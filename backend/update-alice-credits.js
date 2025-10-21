const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAliceCredits() {
  try {
    // Mettre à jour les crédits d'Alice
    const alice = await prisma.user.update({
      where: { email: 'alice@example.com' },
      data: { credits: 10000.0 }
    });

    console.log('✅ Alice mise à jour avec 10 000 crédits !');
    console.log('Utilisateur:', alice.username);
    console.log('Email:', alice.email);
    console.log('Crédits:', alice.credits);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAliceCredits();
