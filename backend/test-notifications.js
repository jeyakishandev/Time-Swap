const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestNotifications() {
  console.log('🔔 Création de notifications de test...');

  try {
    // Trouver Alice
    const alice = await prisma.user.findUnique({
      where: { email: 'alice@example.com' }
    });

    if (!alice) {
      console.error('❌ Alice non trouvée');
      return;
    }

    // Créer des notifications de test
    const testNotifications = [
      {
        title: 'Nouvelle demande de réservation',
        message: 'bob souhaite réserver votre service "Développement Web Personnalisé"',
        type: 'BOOKING_REQUEST',
        userId: alice.id,
      },
      {
        title: 'Réservation confirmée',
        message: 'Votre réservation pour "Cours de Guitare pour Débutants" a été confirmée',
        type: 'BOOKING_CONFIRMED',
        userId: alice.id,
      },
      {
        title: 'Paiement reçu',
        message: 'Vous avez reçu 50 crédits pour le service "Design UI/UX pour Applications Mobiles"',
        type: 'PAYMENT_RECEIVED',
        userId: alice.id,
      },
      {
        title: 'Service terminé',
        message: 'Le service "Traduction Anglais-Français Professionnelle" a été marqué comme terminé',
        type: 'BOOKING_COMPLETED',
        userId: alice.id,
      },
    ];

    for (const notificationData of testNotifications) {
      await prisma.notification.create({
        data: notificationData,
      });
    }

    console.log('✅ Notifications de test créées avec succès !');
    console.log(`📊 ${testNotifications.length} notifications créées pour Alice`);

  } catch (error) {
    console.error('❌ Erreur lors de la création des notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotifications();

