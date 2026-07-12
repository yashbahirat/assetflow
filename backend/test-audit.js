const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const allAssets = await prisma.asset.findMany();
    // Assuming there's a valid auditor (user)
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) throw new Error("No admin user found");
    
    console.log("Assets count:", allAssets.length);
    console.log("Admin id:", admin.id);

    const cycle = await prisma.auditCycle.create({
      data: {
        name: "Test Audit",
        startDate: new Date(),
        status: 'IN_PROGRESS',
        items: {
          create: allAssets.map(asset => ({
            assetId: asset.id,
            auditorId: admin.id,
            status: 'UNVERIFIED'
          }))
        }
      }
    });
    console.log("Created successfully:", cycle.id);
  } catch (err) {
    console.error("ERROR:", err.message);
    if (err.code) console.error("Prisma Code:", err.code);
    if (err.meta) console.error("Prisma Meta:", err.meta);
  } finally {
    await prisma.$disconnect();
  }
}
test();
