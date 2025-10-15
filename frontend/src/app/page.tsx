import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            🌟 Time-Swap Network
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Mon premier projet Full Stack ! Une plateforme d'échange de crédits temps 
            développée avec Next.js 14, NestJS et Prisma.
          </p>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Link 
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Se connecter
            </Link>
            <Link 
              href="/auth/register"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              S'inscrire
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">🔐 Authentification JWT</h3>
              <p className="text-gray-600">
                J'ai appris à implémenter l'authentification sécurisée avec des tokens JWT
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">💳 Transactions Atomiques</h3>
              <p className="text-gray-600">
                Les transferts de crédits utilisent des transactions Prisma pour garantir la cohérence
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">⚡ Full Stack</h3>
              <p className="text-gray-600">
                Next.js 14 avec App Router côté frontend, NestJS côté backend
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
