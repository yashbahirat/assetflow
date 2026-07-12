import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const availableCount = await prisma.asset.count({ where: { status: 'AVAILABLE' } });
    const allocatedCount = await prisma.asset.count({ where: { status: 'ALLOCATED' } });
    const maintenanceCount = await prisma.asset.count({ where: { status: 'MAINTENANCE' } });

    // Fetch overdue allocations (ACTIVE, and expectedReturnDate < now)
    const overdueAllocations = await prisma.allocation.findMany({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: { lt: new Date() }
      },
      include: {
        asset: { select: { name: true, tag: true } },
        user: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } }
      }
    });

    res.status(200).json({
      stats: {
        available: availableCount,
        allocated: allocatedCount,
        maintenance: maintenanceCount
      },
      overdueAllocations
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    // Basic report: count of assets by category for a pie chart
    const categoryStatsRaw = await prisma.assetCategory.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      }
    });

    const categoryStats = categoryStatsRaw.map(c => ({
      name: c.name,
      value: c._count.assets
    }));

    // Basic report: count of maintenance requests by status for a bar chart
    const maintenanceRaw = await prisma.maintenanceRequest.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const maintenanceStats = maintenanceRaw.map(m => ({
      name: m.status,
      value: m._count.id
    }));

    res.status(200).json({
      categoryStats,
      maintenanceStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.activityLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });
    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
