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

  // Créer des services de test
  const service1 = await prisma.service.create({
    data: {
      title: 'Développement Web',
      description: 'Création de sites web modernes et responsives avec React et Node.js',
      category: 'Technologie',
      pricePerHour: 25.0,
      providerId: alice.id,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      title: 'Design Graphique',
      description: 'Création de logos et chartes graphiques professionnelles',
      category: 'Design',
      pricePerHour: 20.0,
      providerId: alice.id,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      title: 'Cours de Français',
      description: 'Cours particuliers de français tous niveaux',
      category: 'Éducation',
      pricePerHour: 15.0,
      providerId: alice.id,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      title: 'Cours de Piano',
      description: 'Apprentissage du piano pour débutants et intermédiaires',
      category: 'Musique',
      pricePerHour: 30.0,
      providerId: bob.id,
    },
  });

  const service5 = await prisma.service.create({
    data: {
      title: 'Traduction FR/EN',
      description: 'Traduction professionnelle français-anglais',
      category: 'Langues',
      pricePerHour: 18.0,
      providerId: charlie.id,
    },
  });

  const service6 = await prisma.service.create({
    data: {
      title: 'Yoga & Méditation',
      description: 'Séances de yoga et méditation pour le bien-être',
      category: 'Bien-être',
      pricePerHour: 22.0,
      providerId: diana.id,
    },
  });

  const service7 = await prisma.service.create({
    data: {
      title: 'Cours de Cuisine',
      description: 'Apprendre à cuisiner des plats traditionnels français',
      category: 'Cuisine',
      pricePerHour: 28.0,
      providerId: diana.id,
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

  console.log('✅ Services created:', {
    alice_services: 3,
    bob_services: 1,
    charlie_services: 1,
    diana_services: 2,
    total_services: 7
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
