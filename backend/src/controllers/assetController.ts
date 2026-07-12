import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag, serial, categoryId, condition, location, isShared } = req.body;

    if (!tag || !categoryId || !condition) {
      res.status(400).json({ error: 'Tag, categoryId, and condition are required' });
      return;
    }

    const newAsset = await prisma.asset.create({
      data: {
        tag,
        serial,
        categoryId,
        condition,
        location,
        isShared: isShared || false,
        status: 'AVAILABLE',
      },
      include: {
        category: true,
      }
    });

    res.status(201).json({ asset: newAsset });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(400).json({ error: 'Asset tag or serial must be unique' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag, serial, categoryId, status } = req.query;
    
    const whereClause: Prisma.AssetWhereInput = {};
    if (tag) whereClause.tag = { contains: tag as string }; // SQLite Prisma contains doesn't support mode: 'insensitive' out of the box in some older versions, but works for basic filtering.
    if (serial) whereClause.serial = { contains: serial as string };
    if (categoryId) whereClause.categoryId = categoryId as string;
    if (status) whereClause.status = status as string;

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ assets });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssetHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
      }
    });

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    // Fetch allocations and map to a unified timeline format
    const allocations = await prisma.allocation.findMany({
      where: { assetId: id },
      include: {
        assignedUser: true,
        assignedDept: true,
      },
      orderBy: { allocatedAt: 'desc' },
    });

    // In a real app we would also fetch Maintenance here, but we will add that in Phase 5.
    
    const history = allocations.map(a => ({
      id: a.id,
      type: 'ALLOCATION',
      status: a.status,
      allocatedAt: a.allocatedAt,
      returnedAt: a.returnedAt,
      expectedReturnAt: a.expectedReturnAt,
      assignedUser: a.assignedUser ? `${a.assignedUser.firstName} ${a.assignedUser.lastName}` : null,
      assignedDept: a.assignedDept ? a.assignedDept.name : null,
    }));

    res.status(200).json({ asset, history });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
