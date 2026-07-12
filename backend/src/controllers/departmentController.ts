import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ departments });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, isActive } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Department name is required' });
      return;
    }

    const newDept = await prisma.department.create({
      data: { name, isActive: isActive ?? true },
    });
    res.status(201).json({ department: newDept });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const updated = await prisma.department.update({
      where: { id },
      data: { name, isActive },
    });
    res.status(200).json({ department: updated });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
