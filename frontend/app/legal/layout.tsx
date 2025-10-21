import Link from 'next/link';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06141B] via-[#11212D] to-[#253745]">
      {/* Header */}
      <header className="relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-[#4A5C6A]/25">
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-full h-full rounded-xl"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Cercle extérieur avec dégradé */}
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4A5C6A" />
                      <stop offset="100%" stopColor="#9BA8AB" />
                    </linearGradient>
                  </defs>
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="url(#logoGradient)" 
                    stroke="#CCD0CF" 
                    strokeWidth="2"
                  />
                  
                  {/* Marqueurs d'horloge */}
                  <line x1="50" y1="10" x2="50" y2="20" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="90" y1="50" x2="80" y2="50" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="50" y1="90" x2="50" y2="80" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="10" y1="50" x2="20" y2="50" stroke="#CCD0CF" strokeWidth="3" strokeLinecap="round"/>
                  
                  {/* Symbole central - T */}
                  <text 
                    x="50" 
                    y="45" 
                    textAnchor="middle" 
                    fontSize="24" 
                    fontWeight="bold" 
                    fill="#CCD0CF"
                    fontFamily="Arial, sans-serif"
                  >
                    T
                  </text>
                  
                  {/* Symbole central - S */}
                  <text 
                    x="50" 
                    y="70" 
                    textAnchor="middle" 
                    fontSize="24" 
                    fontWeight="bold" 
                    fill="#CCD0CF"
                    fontFamily="Arial, sans-serif"
                  >
                    S
                  </text>
                </svg>
              </div>
              <span className="text-white text-xl font-bold group-hover:text-[#9BA8AB] transition-colors">Time-Swap</span>
            </Link>
            
            <Link 
              href="/"
              className="px-4 py-2 text-white hover:text-[#9BA8AB] transition-all duration-300 hover:scale-105"
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