import { prisma } from '../src/lib/prisma'

async function cleanup() {
  await prisma.user.deleteMany({
    where: { email: 'test-trial@example.com' }
  })
  console.log('Test user cleaned up')
  await prisma.$disconnect()
}

cleanup()
