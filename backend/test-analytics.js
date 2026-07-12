const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
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
    console.log("Allocations OK:", overdueAllocations);
    
    const categoryStatsRaw = await prisma.assetCategory.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      }
    });
    console.log("Categories OK");
    
    const maintenanceRaw = await prisma.maintenanceRequest.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    console.log("Maintenance OK");
    
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
