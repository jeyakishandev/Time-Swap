const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedServices() {
  try {
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany();
    
    if (users.length < 2) {
      console.log('Pas assez d\'utilisateurs pour créer des services');
      return;
    }

    // Créer des services pour chaque utilisateur
    const services = [
      {
        title: 'Création d\'applications web',
        description: 'Développement d\'applications web modernes avec React, Node.js et bases de données',
        category: 'Développement',
        pricePerHour: 25,
        providerId: users[0].id
      },
      {
        title: 'Design de logos',
        description: 'Création de logos professionnels et identité visuelle',
        category: 'Design',
        pricePerHour: 20,
        providerId: users[0].id
      },
      {
        title: 'Cours de piano',
        description: 'Apprentissage du piano pour débutants et intermédiaires',
        category: 'Musique',
        pricePerHour: 15,
        providerId: users[1].id
      },
      {
        title: 'Traduction FR/EN',
        description: 'Traduction professionnelle français-anglais et anglais-français',
        category: 'Langues',
        pricePerHour: 18,
        providerId: users[1].id
      },
      {
        title: 'Yoga & Méditation',
        description: 'Séances de yoga et méditation pour le bien-être',
        category: 'Sport',
        pricePerHour: 12,
        providerId: users[0].id
      },
      {
        title: 'Cours de cuisine',
        description: 'Apprentissage de techniques culinaires et recettes',
        category: 'Cuisine',
        pricePerHour: 22,
        providerId: users[1].id
      }
    ];

    // Supprimer les services existants
    await prisma.service.deleteMany({});

    // Créer les nouveaux services
    for (const service of services) {
      await prisma.service.create({
        data: service
      });
    }

    console.log('✅ Services créés avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la création des services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedServices();
