import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAuditCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, scopeType, scopeValue, auditorIds } = req.body;

    if (!name || !userId) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Build asset filter based on scope
    let assetFilter: any = {};
    if (scopeType === 'DEPARTMENT') {
      // Find assets allocated to this department
      const allocations = await prisma.allocation.findMany({
        where: { department: { name: scopeValue }, status: 'ACTIVE' },
        select: { assetId: true }
      });
      assetFilter = { id: { in: allocations.map((a: any) => a.assetId) } };
    } else if (scopeType === 'LOCATION') {
      assetFilter = { location: { contains: scopeValue } };
    }
    // else scopeType === 'ALL' => no filter

    const allAssets = await prisma.asset.findMany({ where: assetFilter });

    if (allAssets.length === 0) {
      res.status(400).json({ error: 'No assets found matching the given scope. Please adjust scope settings.' });
      return;
    }

    // Auditors: include creator + any extra auditor IDs
    const auditorList: string[] = [userId];
    if (Array.isArray(auditorIds)) {
      for (const id of auditorIds) {
        if (id !== userId) auditorList.push(id);
      }
    }

    // Take a snapshot — create an audit item per auditor per asset (one item per asset, cycle-wide)
    const cycle = await prisma.auditCycle.create({
      data: {
        name,
        startDate: new Date(),
        status: 'IN_PROGRESS',
        scopeType: scopeType || 'ALL',
        scopeValue: scopeValue || null,
        auditorIds: JSON.stringify(auditorList),
        items: {
          create: allAssets.map((asset: any) => ({
            assetId: asset.id,
            auditorId: userId,
            status: 'UNVERIFIED'
          }))
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATED_CYCLE',
        entityType: 'AUDIT_CYCLE',
        entityId: cycle.id
      }
    });

    res.status(201).json({ cycle });
  } catch (error) {
    console.error('createAuditCycle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAuditCycles = async (req: Request, res: Response): Promise<void> => {
  try {
    const cycles = await prisma.auditCycle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { items: true } }
      }
    });

    res.status(200).json({ cycles });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAuditCycleDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as Record<string, string>;
    const cycle = await prisma.auditCycle.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            asset: { select: { tag: true, name: true, location: true, status: true } },
            auditor: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!cycle) {
      res.status(404).json({ error: 'Audit cycle not found' });
      return;
    }

    res.status(200).json({ cycle });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAuditItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params as Record<string, string>;
    const { status, notes } = req.body;

    // Validate the item belongs to an open cycle
    const existingItem = await prisma.auditItem.findUnique({
      where: { id: itemId },
      include: { audit: true }
    });
    if (!existingItem) {
      res.status(404).json({ error: 'Audit item not found' });
      return;
    }
    if (existingItem.audit.status === 'CLOSED') {
      res.status(400).json({ error: 'Cannot update items in a closed audit cycle' });
      return;
    }

    const item = await prisma.auditItem.update({
      where: { id: itemId },
      data: { status, notes },
      include: { asset: true }
    });

    const userId = req.user?.userId;
    if (userId) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: `MARKED_ITEM_${status}`,
          entityType: 'AUDIT_CYCLE',
          entityId: item.auditId
        }
      });
    }

    res.status(200).json({ item });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const closeAuditCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as Record<string, string>;
    const userId = req.user?.userId;

    const cycle = await prisma.auditCycle.findUnique({
      where: { id },
      include: {
        items: { include: { asset: true } }
      }
    });

    if (!cycle) {
      res.status(404).json({ error: 'Audit cycle not found' });
      return;
    }
    if (cycle.status === 'CLOSED') {
      res.status(400).json({ error: 'Cycle is already closed' });
      return;
    }

    // Update all MISSING assets to LOST, DAMAGED assets to MAINTENANCE
    await prisma.$transaction(async (tx) => {
      // Close the cycle
      await tx.auditCycle.update({
        where: { id },
        data: { status: 'CLOSED', endDate: new Date() }
      });

      // Update affected assets
      for (const item of cycle.items) {
        if (item.status === 'MISSING') {
          await tx.asset.update({
            where: { id: item.assetId },
            data: { status: 'LOST' }
          });
        } else if (item.status === 'DAMAGED') {
          // Only flag if currently available (don't override an active allocation)
          if (item.asset.status === 'AVAILABLE') {
            await tx.asset.update({
              where: { id: item.assetId },
              data: { status: 'MAINTENANCE' }
            });
          }
        }
      }

      if (userId) {
        await tx.activityLog.create({
          data: {
            userId,
            action: 'CLOSED_CYCLE',
            entityType: 'AUDIT_CYCLE',
            entityId: id
          }
        });
      }
    });

    // Return discrepancy summary
    const missingCount = cycle.items.filter(i => i.status === 'MISSING').length;
    const damagedCount = cycle.items.filter(i => i.status === 'DAMAGED').length;

    res.status(200).json({
      message: `Audit cycle closed. ${missingCount} assets marked LOST, ${damagedCount} assets flagged for maintenance.`
    });
  } catch (error) {
    console.error('closeAuditCycle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
