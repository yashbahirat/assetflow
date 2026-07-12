import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    res.status(201).json({ booking });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssetBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: assetId } = req.params;

    const bookings = await prisma.booking.findMany({
      where: {
        assetId,
        status: 'CONFIRMED',
        endTime: { gt: new Date() } // Only fetch upcoming/current bookings
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
