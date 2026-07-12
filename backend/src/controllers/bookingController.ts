import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getDynamicStatus = (booking: any) => {
  if (booking.status === 'CANCELLED') return 'CANCELLED';
  const now = new Date();
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  if (now < start) return 'UPCOMING';
  if (now >= start && now <= end) return 'ONGOING';
  return 'COMPLETED';
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId, startTime, endTime } = req.body;
    const userId = req.user?.userId;

    if (!assetId || !startTime || !endTime || !userId) {
      res.status(400).json({ error: 'assetId, startTime, and endTime are required' });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      res.status(400).json({ error: 'Start time must be before end time' });
      return;
    }

    // Ensure asset exists and is shared
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }
    if (!asset.isShared) {
      res.status(400).json({ error: 'This asset is not a shared resource and cannot be booked' });
      return;
    }

    // Check for overlapping bookings
    const overlappingBookings = await prisma.booking.findFirst({
      where: {
        assetId,
        status: 'CONFIRMED',
        OR: [
          {
            // Existing booking starts before requested end AND ends after requested start
            startTime: { lt: end },
            endTime: { gt: start },
          }
        ]
      }
    });

    if (overlappingBookings) {
      res.status(409).json({ error: 'This time slot overlaps with an existing booking' });
      return;
    }

    const booking = await prisma.booking.create({
      data: {
        assetId,
        userId,
        startTime: start,
        endTime: end,
        status: 'CONFIRMED'
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: userId!,
        action: 'BOOKING_CONFIRMED',
        entityType: 'BOOKING',
        entityId: booking.id
      }
    });

    res.status(201).json({ booking });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssetBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: assetId } = req.params as Record<string, string>;

    const bookings = await prisma.booking.findMany({
      where: {
        assetId,
        status: { not: 'CANCELLED' }
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const mapped = bookings.map((b: any) => ({
      ...b,
      dynamicStatus: getDynamicStatus(b)
    }));

    res.status(200).json({ bookings: mapped });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId: currentUserId, role } = req.user!;

    // Managers/Admins/DeptHeads see all bookings (for calendar management)
    // Employees only see their own bookings
    const canSeeAll = role === 'ADMIN' || role === 'ASSET_MANAGER' || role === 'DEPARTMENT_HEAD';
    const whereClause: any = { status: { not: 'CANCELLED' } };
    if (!canSeeAll) whereClause.userId = currentUserId;

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        asset: { select: { id: true, name: true, tag: true, isShared: true } },
        user: { select: { firstName: true, lastName: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    const mapped = bookings.map((b: any) => ({
      ...b,
      dynamicStatus: getDynamicStatus(b)
    }));

    res.status(200).json({ bookings: mapped });
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as Record<string, string>;
    const userId = req.user?.userId;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    if (booking.userId !== userId && req.user?.role !== 'ADMIN' && req.user?.role !== 'ASSET_MANAGER' && req.user?.role !== 'DEPARTMENT_HEAD') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }


    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    await prisma.activityLog.create({
      data: {
        userId: userId!,
        action: 'BOOKING_CANCELLED',
        entityType: 'BOOKING',
        entityId: id
      }
    });

    res.status(200).json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rescheduleBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as Record<string, string>;
    const { startTime, endTime } = req.body;
    const userId = req.user?.userId;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.userId !== userId && req.user?.role !== 'ADMIN' && req.user?.role !== 'ASSET_MANAGER') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      res.status(400).json({ error: 'Start time must be before end time' });
      return;
    }

    const overlappingBookings = await prisma.booking.findFirst({
      where: {
        id: { not: id },
        assetId: booking.assetId,
        status: 'CONFIRMED',
        OR: [
          {
            startTime: { lt: end },
            endTime: { gt: start },
          }
        ]
      }
    });

    if (overlappingBookings) {
      res.status(409).json({ error: 'This time slot overlaps with an existing booking' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { startTime: start, endTime: end }
    });

    res.status(200).json({ booking: updated });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
