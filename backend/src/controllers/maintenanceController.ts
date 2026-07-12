import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId, description } = req.body;
    const userId = req.user?.userId;

    if (!assetId || !description || !userId) {
      res.status(400).json({ error: 'assetId and description are required' });
      return;
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        userId,
        description,
        status: 'PENDING'
      }
    });

    res.status(201).json({ request });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllMaintenanceRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        asset: { select: { tag: true, name: true } },
        user: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMaintenanceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, IN_PROGRESS, RESOLVED

    if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ error: 'Maintenance request not found' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.maintenanceRequest.update({
        where: { id },
        data: { 
          status,
          resolvedAt: status === 'RESOLVED' ? new Date() : null
        }
      });

      // Update asset status
      if (status === 'IN_PROGRESS') {
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: 'MAINTENANCE' }
        });
      } else if (status === 'RESOLVED') {
        // Technically we might want to check if it was allocated before, but to keep it simple, return to AVAILABLE
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: 'AVAILABLE' }
        });
      }
    });

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
