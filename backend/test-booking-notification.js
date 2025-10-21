const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBookingNotification() {
  console.log('🔔 Test de notification de réservation...');

  try {
    // Trouver Alice et Bob
    const alice = await prisma.user.findUnique({
      where: { email: 'alice@example.com' }
    });
    const bob = await prisma.user.findUnique({
      where: { email: 'bob@example.com' }
    });

    if (!alice || !bob) {
      console.error('❌ Alice ou Bob non trouvé');
      return;
    }

    // Trouver un service d'Alice
    const service = await prisma.service.findFirst({
      where: { providerId: alice.id },
      include: { provider: true }
    });

    if (!service) {
      console.error('❌ Aucun service trouvé pour Alice');
      return;
    }

    console.log(`📋 Service trouvé: "${service.title}" par ${service.provider.username}`);

    // Créer une réservation (Bob réserve le service d'Alice)
    const booking = await prisma.booking.create({
      data: {
        clientId: bob.id,
        serviceId: service.id,
        providerId: alice.id,
        hours: 2,
        totalPrice: service.pricePerHour * 2,
        notes: 'Test de notification automatique',
        status: 'PENDING',
      },
      include: {
        client: { select: { id: true, username: true } },
        service: { select: { id: true, title: true } },
        provider: { select: { id: true, username: true } }
      }
    });

    console.log('✅ Réservation créée avec succès !');
    console.log(`👤 Client: ${booking.client.username}`);
    console.log(`🛠️ Service: ${booking.service.title}`);
    console.log(`👨‍💼 Prestataire: ${booking.provider.username}`);
    console.log(`💰 Prix: ${booking.totalPrice} crédits`);
    console.log(`📊 Statut: ${booking.status}`);

    // Créer une notification pour Alice (prestataire)
    const notification = await prisma.notification.create({
      data: {
        title: 'Nouvelle demande de réservation',
        message: `${booking.client.username} souhaite réserver votre service "${booking.service.title}"`,
        type: 'BOOKING_REQUEST',
        userId: alice.id,
      },
    });

    console.log('🔔 Notification créée pour Alice !');
    console.log(`📝 Titre: ${notification.title}`);
    console.log(`💬 Message: ${notification.message}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBookingNotification();

