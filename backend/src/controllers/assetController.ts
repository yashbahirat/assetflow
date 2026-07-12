import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag, serial, name, categoryId, condition, location, isShared, acquisitionDate, acquisitionCost, photoUrl } = req.body;

    if (!name || !categoryId || !condition) {
      res.status(400).json({ error: 'Name, categoryId, and condition are required' });
      return;
    }

    // Auto-generate Asset Tag if blank or not provided (AF-XXXX)
    let finalTag = tag && tag.trim() ? tag.trim() : null;
    if (!finalTag) {
      const count = await prisma.asset.count();
      let attempt = count + 1;
      finalTag = `AF-${attempt.toString().padStart(4, '0')}`;
      while (await prisma.asset.findUnique({ where: { tag: finalTag } })) {
        attempt++;
        finalTag = `AF-${attempt.toString().padStart(4, '0')}`;
      }
    }

    const newAsset = await prisma.asset.create({
      data: {
        tag: finalTag,
        serialNumber: serial || null,
        name,
        categoryId,
        condition,
        location: location || null,
        isShared: isShared === true || isShared === 'true',
        status: 'AVAILABLE',
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
        acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : null,
        photoUrl: photoUrl || null,
      },
      include: { category: true }
    });

    res.status(201).json({ asset: newAsset });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(400).json({ error: 'Asset tag or serial number must be unique' });
      return;
    }
    console.error('createAsset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag, serial, name, categoryId, status, location, isShared } = req.query as Record<string, string | undefined>;

    const whereClause: Prisma.AssetWhereInput = {};

    // Full-text search: match tag, serial number, OR name
    if (tag) {
      whereClause.OR = [
        { tag: { contains: tag as string } },
        { name: { contains: tag as string } },
        { serialNumber: { contains: tag as string } },
      ];
    }
    if (serial) whereClause.serialNumber = { contains: serial as string };
    if (name) {
      const existing = whereClause.OR || [];
      whereClause.OR = [...existing as any[], { name: { contains: name as string } }];
    }
    if (categoryId) whereClause.categoryId = categoryId as string;
    if (status) whereClause.status = status as string;
    if (location) whereClause.location = { contains: location as string };
    if (isShared !== undefined && isShared !== '') whereClause.isShared = isShared === 'true';

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ assets });
  } catch (error) {
    console.error('getAssets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssetHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as Record<string, string>;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    const allocations = await prisma.allocation.findMany({
      where: { assetId: id },
      include: { user: true, department: true },
      orderBy: { allocatedAt: 'desc' },
    });

    const maintenance = await prisma.maintenanceRequest.findMany({
      where: { assetId: id },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    const history = allocations.map((a: any) => ({
      id: a.id,
      type: 'ALLOCATION',
      status: a.status,
      allocatedAt: a.allocatedAt,
      returnedAt: a.returnedAt,
      returnNotes: a.returnNotes,
      expectedReturnAt: a.expectedReturnDate,
      assignedUser: a.user ? `${a.user.firstName} ${a.user.lastName}` : null,
      assignedUserId: a.userId,
      assignedDept: a.department ? a.department.name : null,
    }));

    const maintenanceHistory = maintenance.map((m: any) => ({
      id: m.id,
      description: m.description,
      status: m.status,
      priority: m.priority,
      createdAt: m.createdAt,
      resolvedAt: m.resolvedAt,
      technicianName: m.technicianName,
      notes: m.notes,
      reportedBy: m.user ? `${m.user.firstName} ${m.user.lastName}` : null
    }));

    res.status(200).json({ asset, history, maintenanceHistory });
  } catch (error) {
    console.error('getAssetHistory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as Record<string, string>;
    const { isShared } = req.body;

    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        isShared: isShared !== undefined ? (isShared === true || isShared === 'true') : existing.isShared,
      },
      include: { category: true }
    });

    res.status(200).json({ asset: updated });
  } catch (error) {
    console.error('updateAsset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
