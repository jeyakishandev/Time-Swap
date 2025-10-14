import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center">
          {/* Logo / Titre */}
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Time-Swap Network
          </h1>
          
          <p className="text-2xl text-gray-700 mb-8">
            Échangez votre temps, partagez vos compétences
          </p>

          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Une plateforme innovante qui transforme le temps en monnaie d'échange.
            Aidez les autres, gagnez des crédits, et construisez une communauté solidaire.
          </p>

          {/* Boutons d'action */}
          <div className="flex gap-4 items-center justify-center mb-16">
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
            >
              S'inscrire
            </Link>
          </div>

          {/* Caractéristiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Sécurisé</h3>
              <p className="text-gray-600">
                Authentification JWT et transactions atomiques pour une sécurité maximale
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Rapide</h3>
              <p className="text-gray-600">
                Architecture moderne avec Next.js 14 et NestJS pour des performances optimales
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Solidaire</h3>
              <p className="text-gray-600">
                Construisez une communauté basée sur l'entraide et le partage de compétences
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

