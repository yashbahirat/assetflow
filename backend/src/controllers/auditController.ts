import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAuditCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!name || !userId) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const allAssets = await prisma.asset.findMany();

    // Take a snapshot
    const cycle = await prisma.auditCycle.create({
      data: {
        name,
        startDate: new Date(),
        status: 'IN_PROGRESS',
        items: {
          create: allAssets.map(asset => ({
            assetId: asset.id,
            auditorId: userId,
            status: 'UNVERIFIED'
          }))
        }
      }
    });

    res.status(201).json({ cycle });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAuditCycles = async (req: Request, res: Response): Promise<void> => {
  try {
    const cycles = await prisma.auditCycle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });

    res.status(200).json({ cycles });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAuditCycleDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cycle = await prisma.auditCycle.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            asset: { select: { tag: true, name: true, location: true } }
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
    const { itemId } = req.params;
    const { status, notes } = req.body; // 'UNVERIFIED', 'VERIFIED', 'MISSING', 'DAMAGED'

    const item = await prisma.auditItem.update({
      where: { id: itemId },
      data: {
        status,
        notes
      }
    });

    res.status(200).json({ item });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
