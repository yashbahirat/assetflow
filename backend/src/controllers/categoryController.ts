import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.assetCategory.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const newCategory = await prisma.assetCategory.create({
      data: { name, description },
    });
    res.status(201).json({ category: newCategory });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updated = await prisma.assetCategory.update({
      where: { id },
      data: { name, description },
    });
    res.status(200).json({ category: updated });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
