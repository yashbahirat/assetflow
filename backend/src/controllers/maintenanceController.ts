import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Valid state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['TECHNICIAN_ASSIGNED', 'REJECTED'],
  TECHNICIAN_ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  REJECTED: [],   // terminal
  RESOLVED: [],   // terminal
};

export const createMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId, description, priority, photoUrl } = req.body;
    const userId = req.user?.userId;

    if (!assetId || !description || !userId) {
      res.status(400).json({ error: 'assetId and description are required' });
      return;
    }

    // Asset must exist
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        userId,
        description,
        priority: priority || 'MEDIUM',
        photoUrl: photoUrl || null,
        status: 'PENDING'
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: userId!,
        action: 'MAINTENANCE_REQUESTED',
        entityType: 'MAINTENANCE',
        entityId: request.id
      }
    });

    res.status(201).json({ request });
  } catch (error) {
    console.error('createMaintenanceRequest error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllMaintenanceRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId: currentUserId, role } = req.user!;

    // Asset Managers and Admins see all requests; employees see only their own
    const where = (role === 'ADMIN' || role === 'ASSET_MANAGER')
      ? {}
      : { userId: currentUserId };

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        asset: { select: { tag: true, name: true, id: true } },
        user: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ requests });
  } catch (error) {
    console.error('getAllMaintenanceRequests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMaintenanceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as Record<string, string>;
    const { status, technicianName, notes } = req.body;

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true }
    });
    if (!request) {
      res.status(404).json({ error: 'Maintenance request not found' });
      return;
    }

    // Enforce state machine transitions
    const allowed = VALID_TRANSITIONS[request.status] || [];
    if (!allowed.includes(status)) {
      res.status(400).json({
        error: `Cannot transition from ${request.status} to ${status}. Allowed next states: ${allowed.join(', ') || 'none (terminal state)'}`
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status,
          technicianName: technicianName !== undefined ? technicianName : request.technicianName,
          notes: notes !== undefined ? notes : request.notes,
          resolvedAt: status === 'RESOLVED' ? new Date() : undefined
        }
      });

      // Asset status lifecycle:
      // APPROVED → asset enters MAINTENANCE (only if it was AVAILABLE)
      // RESOLVED → restore asset:
      //   - if it was ALLOCATED before maintenance, put back to ALLOCATED
      //   - otherwise → AVAILABLE
      if (status === 'APPROVED') {
        // Only flip to MAINTENANCE on approval, as per spec
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: 'MAINTENANCE' }
        });
      } else if (status === 'RESOLVED') {
        // Check if there was an active allocation before maintenance was raised
        const priorAllocation = await tx.allocation.findFirst({
          where: { assetId: request.assetId, status: 'ACTIVE' }
        });
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: priorAllocation ? 'ALLOCATED' : 'AVAILABLE' }
        });
      } else if (status === 'REJECTED') {
        // Rejected before approval — asset stays in its current state (don't change it)
        // Only reset to previous status if it was flipped to MAINTENANCE
        if (request.asset.status === 'MAINTENANCE') {
          const priorAllocation = await tx.allocation.findFirst({
            where: { assetId: request.assetId, status: 'ACTIVE' }
          });
          await tx.asset.update({
            where: { id: request.assetId },
            data: { status: priorAllocation ? 'ALLOCATED' : 'AVAILABLE' }
          });
        }
      }

      const actorId = req.user?.userId;
      if (actorId) {
        await tx.activityLog.create({
          data: {
            userId: actorId,
            action: `MAINTENANCE_${status}`,
            entityType: 'MAINTENANCE',
            entityId: id
          }
        });
      }
    });

    res.status(200).json({ message: `Status updated to ${status}` });
  } catch (error) {
    console.error('updateMaintenanceStatus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
