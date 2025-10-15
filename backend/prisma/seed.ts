import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer des utilisateurs de test
  const hashedPassword = crypto.createHash('sha256').update('password123').digest('hex');

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      password: hashedPassword,
      credits: 100.0,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      password: hashedPassword,
      credits: 150.0,
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      username: 'charlie',
      password: hashedPassword,
      credits: 75.0,
    },
  });

  const diana = await prisma.user.upsert({
    where: { email: 'diana@example.com' },
    update: {},
    create: {
      email: 'diana@example.com',
      username: 'diana',
      password: hashedPassword,
      credits: 200.0,
    },
  });

  // Créer quelques transactions de test
  const transaction1 = await prisma.creditTransaction.create({
    data: {
      senderId: alice.id,
      receiverId: bob.id,
      amount: 25.0,
      status: 'COMPLETED',
    },
  });

  const transaction2 = await prisma.creditTransaction.create({
    data: {
      senderId: diana.id,
      receiverId: charlie.id,
      amount: 50.0,
      status: 'COMPLETED',
    },
  });

  const transaction3 = await prisma.creditTransaction.create({
    data: {
      senderId: bob.id,
      receiverId: alice.id,
      amount: 15.0,
      status: 'COMPLETED',
    },
  });

  console.log('✅ Users created:', { 
    alice: alice.username, 
    bob: bob.username,
    charlie: charlie.username,
    diana: diana.username
  });
  
  console.log('✅ Sample transactions created:', {
    alice_to_bob: `${transaction1.amount} credits`,
    diana_to_charlie: `${transaction2.amount} credits`,
    bob_to_alice: `${transaction3.amount} credits`
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
