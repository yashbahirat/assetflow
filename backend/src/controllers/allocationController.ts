import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const allocateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId, userId, departmentId, expectedReturnDate } = req.body;

    if (!assetId || (!userId && !departmentId)) {
      res.status(400).json({ error: 'Asset ID and either User ID or Department ID are required' });
      return;
    }

    // Check if asset is AVAILABLE
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    if (asset.status !== 'AVAILABLE') {
      res.status(400).json({ error: 'Asset is not available for allocation' });
      return;
    }

    // Transaction to create allocation and update asset status
    const result = await prisma.$transaction(async (tx) => {
      const allocation = await tx.allocation.create({
        data: {
          assetId,
          userId: userId || null,
          departmentId: departmentId || null,
          expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
          status: 'ACTIVE',
        },
      });

      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: { status: 'ALLOCATED' },
      });

      return { allocation, updatedAsset };
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: assetId } = req.params;
    const { targetUserId } = req.body;
    const requestedById = req.user?.userId;

    if (!requestedById || !targetUserId) {
      res.status(400).json({ error: 'Target User ID is required' });
      return;
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.status !== 'ALLOCATED') {
      res.status(400).json({ error: 'Asset is not currently allocated' });
      return;
    }

    const transferRequest = await prisma.transferRequest.create({
      data: {
        assetId,
        requestedById,
        targetUserId,
        status: 'PENDING',
      },
    });

    res.status(201).json({ transferRequest });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: transferRequestId } = req.params;

    const request = await prisma.transferRequest.findUnique({ where: { id: transferRequestId } });
    if (!request || request.status !== 'PENDING') {
      res.status(404).json({ error: 'Valid pending transfer request not found' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark transfer request as approved
      await tx.transferRequest.update({
        where: { id: transferRequestId },
        data: { status: 'APPROVED' },
      });

      // 2. Terminate current allocation
      await tx.allocation.updateMany({
        where: { assetId: request.assetId, status: 'ACTIVE' },
        data: { status: 'TRANSFERRED', returnedAt: new Date() },
      });

      // 3. Create new allocation
      await tx.allocation.create({
        data: {
          assetId: request.assetId,
          userId: request.targetUserId,
          status: 'ACTIVE',
        },
      });
    });

    res.status(200).json({ message: 'Transfer approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const returnAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: allocationId } = req.params;

    const allocation = await prisma.allocation.findUnique({ where: { id: allocationId } });
    if (!allocation || allocation.status !== 'ACTIVE') {
      res.status(404).json({ error: 'Active allocation not found' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.allocation.update({
        where: { id: allocationId },
        data: { status: 'RETURNED', returnedAt: new Date() },
      });

      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'AVAILABLE' },
      });
    });

    res.status(200).json({ message: 'Asset returned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
