import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create default IT Department
  const itDept = await prisma.department.upsert({
    where: { name: 'IT' },
    update: {},
    create: {
      name: 'IT',
      isActive: true,
    },
  });
  console.log('Created IT Department:', itDept.id);

  const hrDept = await prisma.department.upsert({
    where: { name: 'HR' },
    update: {},
    create: {
      name: 'HR',
      isActive: true,
    },
  });
  console.log('Created HR Department:', hrDept.id);

  // Create default Asset Categories
  const laptopCategory = await prisma.assetCategory.upsert({
    where: { name: 'Laptops' },
    update: {},
    create: {
      name: 'Laptops',
      description: 'MacBooks, ThinkPads, etc.',
    },
  });
  console.log('Created Category Laptops:', laptopCategory.id);

  const monitorCategory = await prisma.assetCategory.upsert({
    where: { name: 'Monitors' },
    update: {},
    create: {
      name: 'Monitors',
      description: 'External displays',
    },
  });
  console.log('Created Category Monitors:', monitorCategory.id);

  // Create default Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: {
      email: 'admin@assetflow.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      departmentId: itDept.id,
    },
  });
  console.log('Created Admin User:', adminUser.email);
  console.log('Seed finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
