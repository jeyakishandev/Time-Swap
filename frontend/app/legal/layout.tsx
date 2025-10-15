import Link from 'next/link';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-blue-500/25">
                <span className="text-white font-bold text-lg">TS</span>
              </div>
              <span className="text-white text-xl font-bold group-hover:text-blue-300 transition-colors">Time-Swap</span>
            </Link>
            
            <Link 
              href="/"
              className="px-4 py-2 text-white hover:text-blue-300 transition-all duration-300 hover:scale-105"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 pb-20">
        {children}
      </main>
    </div>
  );
}
