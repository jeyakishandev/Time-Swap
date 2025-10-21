import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer des utilisateurs de test
  const hashedPassword = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      password: hashedPassword,
      credits: 10000.0,
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

  // Créer des réservations terminées pour les tests d'avis
  const completedBookings = await Promise.all([
    prisma.booking.create({
      data: {
        clientId: bob.id,
        serviceId: service1.id,
        providerId: alice.id,
        hours: 2,
        totalPrice: service1.pricePerHour * 2,
        status: 'COMPLETED',
        notes: 'Excellent travail !',
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
      },
    }),
    prisma.booking.create({
      data: {
        clientId: charlie.id,
        serviceId: service2.id,
        providerId: alice.id,
        hours: 1,
        totalPrice: service2.pricePerHour * 1,
        status: 'COMPLETED',
        notes: 'Très professionnel',
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
      },
    }),
    prisma.booking.create({
      data: {
        clientId: alice.id,
        serviceId: service4.id,
        providerId: bob.id,
        hours: 3,
        totalPrice: service4.pricePerHour * 3,
        status: 'COMPLETED',
        notes: 'Super service',
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
      },
    }),
  ]);

  // Créer des avis pour les réservations terminées
  const reviews = await Promise.all([
    // Bob évalue Alice (service de développement)
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Alice est une développeuse exceptionnelle ! Elle a livré un travail de qualité supérieure dans les délais. Je recommande vivement ses services.',
        reviewerId: bob.id,
        revieweeId: alice.id,
        serviceId: service1.id,
        bookingId: completedBookings[0].id,
      },
    }),
    // Charlie évalue Alice (service de design)
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Très bon designer, créatif et à l\'écoute. Le résultat correspondait exactement à mes attentes.',
        reviewerId: charlie.id,
        revieweeId: alice.id,
        serviceId: service2.id,
        bookingId: completedBookings[1].id,
      },
    }),
    // Alice évalue Bob (service de piano)
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Bob est un excellent professeur de piano. Il est patient et pédagogue. Mes enfants adorent ses cours !',
        reviewerId: alice.id,
        revieweeId: bob.id,
        serviceId: service4.id,
        bookingId: completedBookings[2].id,
      },
    }),
    // Diana évalue Alice (avis général)
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Alice est une professionnelle de talent. Travail soigné, respect des délais et excellente communication.',
        reviewerId: diana.id,
        revieweeId: alice.id,
        serviceId: service3.id,
      },
    }),
    // Charlie évalue Diana (service de musique)
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Diana a créé une bande sonore parfaite pour mon projet. Très créative et professionnelle.',
        reviewerId: charlie.id,
        revieweeId: diana.id,
        serviceId: service6.id,
      },
    }),
  ]);

  console.log('✅ Reviews created:', {
    total_reviews: reviews.length,
    average_rating_alice: 4.75,
    average_rating_bob: 5.0,
    average_rating_diana: 4.0
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
