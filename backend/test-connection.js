#!/usr/bin/env node
/**
 * Script pour tester la connexion à Supabase
 * Usage: node test-connection.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Test de connexion à la base de données...\n');
  
  try {
    // Test de connexion simple
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion réussie !\n');
    
    // Test de lecture
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre d'utilisateurs dans la base : ${userCount}\n`);
    
    // Test des tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('📋 Tables disponibles :');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    console.log('\n✅ Tous les tests sont passés !');
    
  } catch (error) {
    console.error('❌ Erreur de connexion :');
    console.error(error.message);
    
    if (error.message.includes('password')) {
      console.error('\n💡 Vérifiez que le mot de passe dans DATABASE_URL est correct');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Vérifiez que vous utilisez le Transaction Pooler (port 6543)');
    } else if (error.message.includes('does not exist')) {
      console.error('\n💡 Les migrations Prisma n\'ont peut-être pas été appliquées');
      console.error('   Exécutez: npx prisma migrate deploy');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

