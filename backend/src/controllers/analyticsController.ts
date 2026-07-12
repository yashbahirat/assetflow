import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(now); todayEnd.setHours(23,59,59,999);

    const [availableCount, allocatedCount, maintenanceCount, activeBookings, pendingTransfers] = await Promise.all([
      prisma.asset.count({ where: { status: 'AVAILABLE' } }),
      prisma.asset.count({ where: { status: 'ALLOCATED' } }),
      prisma.asset.count({ where: { status: 'MAINTENANCE' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED', startTime: { lte: now }, endTime: { gte: now } } }),
      prisma.transferRequest.count({ where: { status: 'PENDING' } })
    ]);

    // Overdue allocations
    const overdueAllocations = await prisma.allocation.findMany({
      where: { status: 'ACTIVE', expectedReturnDate: { lt: now } },
      include: {
        asset: { select: { name: true, tag: true } },
        user: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } }
      },
      orderBy: { expectedReturnDate: 'asc' }
    });

    // Upcoming returns (due within 7 days, not yet overdue)
    const upcomingReturns = await prisma.allocation.findMany({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: { gte: now, lte: in7Days }
      },
      include: {
        asset: { select: { name: true, tag: true } },
        user: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } }
      },
      orderBy: { expectedReturnDate: 'asc' },
      take: 5
    });

    // Pending maintenance requests
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: { status: 'PENDING' }
    });

    // Recent activity feed
    const recentActivity = await prisma.activityLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } }
    });

    const userId = req.user?.userId;
    const myAllocations = await prisma.allocation.findMany({
      where: { status: 'ACTIVE', userId },
      include: {
        asset: { select: { id: true, name: true, tag: true, condition: true } }
      }
    });

    res.status(200).json({
      stats: {
        available: availableCount,
        allocated: allocatedCount,
        maintenance: maintenanceCount,
        activeBookings,
        pendingTransfers,
        pendingMaintenance,
        overdueCount: overdueAllocations.length,
        upcomingCount: upcomingReturns.length
      },
      overdueAllocations,
      upcomingReturns,
      myAllocations,
      recentActivity
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Most used assets (by booking count)
    const bookingsGrouped = await prisma.booking.groupBy({
      by: ['assetId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });
    const mostUsedAssets = await Promise.all(
      bookingsGrouped.map(async b => {
        const asset = await prisma.asset.findUnique({ where: { id: b.assetId } });
        return { name: asset?.name || 'Unknown', tag: asset?.tag || '', value: b._count.id };
      })
    );

    // 2. Idle assets (AVAILABLE, no recent activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const idleAssetsQuery = await prisma.asset.findMany({
      where: {
        status: 'AVAILABLE',
        allocations: { none: { status: 'ACTIVE' } },
        bookings: { none: { startTime: { gte: thirtyDaysAgo } } }
      },
      select: { name: true, tag: true, location: true, category: { select: { name: true } }, createdAt: true },
      take: 10
    });

    // 3. Maintenance frequency (by category)
    const categories = await prisma.assetCategory.findMany({
      include: {
        assets: {
          include: {
            _count: { select: { maintenanceRequests: true } }
          }
        }
      }
    });
    const maintenanceFrequency = categories.map(c => {
      const totalReqs = c.assets.reduce((sum, asset) => sum + asset._count.maintenanceRequests, 0);
      return { name: c.name, value: totalReqs };
    }).filter(c => c.value > 0);

    // 4. Department wise allocation summary (active allocations only)
    const departments = await prisma.department.findMany({
      include: {
        allocations: { where: { status: 'ACTIVE' } }
      }
    });
    const departmentAllocationSummary = departments.map((d: any) => ({
      name: d.name,
      value: d.allocations.length
    })).filter(d => d.value > 0);

    // 5. Category stats (for dashboard)
    const categoryStats = categories.map((c: any) => ({
      name: c.name,
      value: c.assets.length
    }));

    // 6. Maintenance stats (for dashboard)
    const maintenanceRaw = await prisma.maintenanceRequest.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const maintenanceStats = maintenanceRaw.map((m: any) => ({
      name: m.status,
      value: m._count.id
    }));

    // 7. Booking heatmap — count bookings per hour-of-day (0-23)
    const allBookings = await prisma.booking.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { startTime: true, endTime: true, assetId: true }
    });
    const heatmapHours: Record<number, number> = {};
    for (let h = 0; h < 24; h++) heatmapHours[h] = 0;
    for (const b of allBookings) {
      const startHour = new Date(b.startTime).getHours();
      heatmapHours[startHour] = (heatmapHours[startHour] || 0) + 1;
    }
    const bookingHeatmap = Object.entries(heatmapHours).map(([hour, count]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      bookings: count
    }));

    // 8. Assets due for maintenance (last maintenance resolved > 90 days ago OR never maintained)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const assetsDueForMaintenance = await prisma.asset.findMany({
      where: {
        status: { not: 'RETIRED' },
        OR: [
          { maintenanceRequests: { none: {} } }, // Never had maintenance
          {
            maintenanceRequests: {
              every: {
                OR: [
                  { status: { not: 'RESOLVED' } },
                  { resolvedAt: { lt: ninetyDaysAgo } }
                ]
              }
            }
          }
        ]
      },
      select: {
        name: true, tag: true, location: true, status: true,
        category: { select: { name: true } },
        maintenanceRequests: {
          where: { status: 'RESOLVED' },
          orderBy: { resolvedAt: 'desc' },
          take: 1,
          select: { resolvedAt: true }
        }
      },
      take: 10
    });

    // 9. Retirement candidates (assets older than 5 years by acquisition date)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const retirementCandidates = await prisma.asset.findMany({
      where: {
        status: { notIn: ['RETIRED', 'DISPOSED', 'LOST'] },
        acquisitionDate: { lt: fiveYearsAgo }
      },
      select: {
        name: true, tag: true, status: true, acquisitionDate: true,
        category: { select: { name: true } }
      },
      take: 10
    });

    res.status(200).json({
      mostUsedAssets,
      idleAssets: idleAssetsQuery,
      maintenanceFrequency,
      departmentAllocationSummary,
      categoryStats,
      maintenanceStats,
      bookingHeatmap,
      assetsDueForMaintenance,
      retirementCandidates
    });
  } catch (error) {
    console.error('getReports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityTypePrefix, entityId, type, page = '1', limit = '50' } = req.query as Record<string, string | undefined>;
    
    let whereClause: any = {};
    if (entityTypePrefix) {
      whereClause.entityType = { startsWith: entityTypePrefix as string };
    }
    if (entityId) {
      whereClause.entityId = entityId as string;
    }
    if (type && type !== 'ALL') {
      whereClause.entityType = type as string;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, role: true } }
        }
      }),
      prisma.activityLog.count({ where: whereClause })
    ]);

    res.status(200).json({ logs, total, page: parseInt(page as string), limit: take });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    // Build relevant actions to surface as user-facing notifications
    const relevantTypes = [
      'ASSET_ALLOCATED', 'ASSET_RETURNED',
      'TRANSFER_REQUESTED', 'TRANSFER_APPROVED', 'TRANSFER_REJECTED',
      'MAINTENANCE_REQUESTED', 'MAINTENANCE_APPROVED', 'MAINTENANCE_REJECTED', 'MAINTENANCE_RESOLVED',
      'BOOKING_CONFIRMED', 'BOOKING_CANCELLED',
      'MARKED_ITEM_MISSING', 'MARKED_ITEM_DAMAGED',
      'CLOSED_CYCLE'
    ];

    const logs = await prisma.activityLog.findMany({
      where: { action: { in: relevantTypes } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        user: { select: { firstName: true, lastName: true, role: true } }
      }
    });

    // Also surface overdue allocations as virtual notifications
    const overdueAllocations = await prisma.allocation.findMany({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: { lt: new Date() }
      },
      include: {
        asset: { select: { name: true, tag: true } },
        user: { select: { firstName: true, lastName: true } }
      },
      take: 10
    });

    const overdueVirtual = overdueAllocations.map((a: any) => ({
      id: `overdue-${a.id}`,
      action: 'OVERDUE_RETURN',
      entityType: 'ALLOCATION',
      entityId: a.id,
      createdAt: a.expectedReturnDate,
      isVirtual: true,
      meta: {
        assetName: a.asset.name,
        assetTag: a.asset.tag,
        holderName: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Department',
        dueDate: a.expectedReturnDate
      }
    }));

    res.status(200).json({ notifications: logs, overdueAlerts: overdueVirtual });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const toCSV = (rows: any[], columns: string[]): string => {
  const header = columns.join(',');
  const body = rows.map(row =>
    columns.map(col => {
      const val = row[col] ?? '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  ).join('\n');
  return `${header}\n${body}`;
};

export const exportInventoryCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const assets = await prisma.asset.findMany({
      include: { category: true },
      orderBy: { tag: 'asc' }
    });

    const rows = assets.map((a: any) => ({
      Tag: a.tag,
      Name: a.name,
      Category: a.category.name,
      Status: a.status,
      Condition: a.condition || '',
      Location: a.location || '',
      SerialNumber: a.serialNumber || '',
      AcquisitionDate: a.acquisitionDate ? new Date(a.acquisitionDate).toLocaleDateString() : '',
      AcquisitionCost: a.acquisitionCost ?? '',
      IsShared: a.isShared ? 'Yes' : 'No'
    }));

    const csv = toCSV(rows, ['Tag', 'Name', 'Category', 'Status', 'Condition', 'Location', 'SerialNumber', 'AcquisitionDate', 'AcquisitionCost', 'IsShared']);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inventory_${new Date().toISOString().split('T')[0]}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportMaintenanceCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        asset: { select: { name: true, tag: true } },
        user: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const rows = requests.map((r: any) => ({
      AssetTag: r.asset.tag,
      AssetName: r.asset.name,
      ReportedBy: `${r.user.firstName} ${r.user.lastName}`,
      Description: r.description,
      Priority: r.priority,
      Status: r.status,
      Technician: r.technicianName || '',
      Notes: r.notes || '',
      CreatedAt: new Date(r.createdAt).toLocaleDateString(),
      ResolvedAt: r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : ''
    }));

    const csv = toCSV(rows, ['AssetTag', 'AssetName', 'ReportedBy', 'Description', 'Priority', 'Status', 'Technician', 'Notes', 'CreatedAt', 'ResolvedAt']);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="maintenance_${new Date().toISOString().split('T')[0]}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
