'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthLink from '../components/AuthLink';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06141B] via-[#11212D] to-[#253745] text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-[#4A5C6A]/20 rounded-full blur-3xl transition-all duration-1000"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#4A5C6A]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#9BA8AB]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-[#4A5C6A]/25">
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
            <span className="text-white text-2xl font-bold group-hover:text-[#9BA8AB] transition-colors">Time-Swap</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#features"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              Fonctionnalités
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A5C6A] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#security"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              Sécurité
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A5C6A] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#about"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              À propos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A5C6A] group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>

          <div className="flex space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-white hover:text-[#9BA8AB] transition-all duration-300 hover:scale-105 relative group"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4A5C6A]/25"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Title */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-[#4A5C6A] via-[#9BA8AB] to-[#CCD0CF] bg-clip-text text-transparent">
              TIME-SWAP
            </h1>
            <div className="absolute inset-0 text-6xl md:text-8xl font-black opacity-20 blur-sm bg-gradient-to-r from-[#4A5C6A] via-[#9BA8AB] to-[#CCD0CF] bg-clip-text text-transparent">
              TIME-SWAP
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            L'avenir des <span className="text-[#4A5C6A] font-bold">échanges sécurisés</span>.
            <br />
            <span className="text-[#9BA8AB] font-bold">Échangez</span> vos compétences, <span className="text-[#CCD0CF] font-bold">gagnez</span> des crédits, <span className="text-[#4A5C6A] font-bold">construisez</span> des communautés.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg text-lg font-bold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[#4A5C6A]/25"
            >
              <span className="relative z-10">Commencer gratuitement</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <button 
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
            >
              <span className="relative z-10">Voir la démo</span>
              <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: 'Utilisateurs actifs', value: '10,000+', icon: '👥' },
              { title: 'Transactions', value: '50,000+', icon: '💳' },
              { title: 'Sécurité', value: '99.9%', icon: '🔒' }
            ].map((stat, index) => (
              <div
                key={index}
                className="relative p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-[#4A5C6A]/50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-gray-300">{stat.title}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-[#4A5C6A]/10 to-[#9BA8AB]/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] bg-clip-text text-transparent">
              Fonctionnalités
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Une plateforme moderne pour échanger du temps et des compétences en toute sécurité
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Feature Cards */}
            <div className="space-y-8">
              {[
                {
                  title: 'Transactions instantanées',
                  desc: 'Échangez vos crédits en temps réel avec une sécurité maximale. Aucun délai, aucune attente.',
                  color: 'from-[#4A5C6A] to-[#9BA8AB]'
                },
                {
                  title: 'Sécurité bancaire',
                  desc: 'Protection militaire de vos données avec chiffrement AES-256 et authentification multi-facteurs.',
                  color: 'from-[#253745] to-[#4A5C6A]'
                },
                {
                  title: 'Interface intuitive',
                  desc: 'Design moderne et ergonomique pour une expérience utilisateur fluide et professionnelle.',
                  color: 'from-[#9BA8AB] to-[#CCD0CF]'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-[#4A5C6A]/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-300`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#4A5C6A] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4A5C6A]/5 to-[#9BA8AB]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-[#4A5C6A]/20 to-[#9BA8AB]/20 rounded-2xl border border-[#4A5C6A]/30 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4A5C6A]/10 to-[#9BA8AB]/10 animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center text-4xl animate-spin">
                    💳
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Plateforme active</h3>
                  <p className="text-[#4A5C6A] font-semibold">Status: En ligne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative py-32 px-6 bg-gradient-to-r from-[#11212D] via-[#253745] to-[#4A5C6A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#9BA8AB] to-[#4A5C6A] bg-clip-text text-transparent">
              Sécurité
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Vos données protégées par les technologies de sécurité les plus avancées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Chiffrement AES-256', value: '99.9%', color: 'green' },
              { title: 'Temps de fonctionnement', value: '100%', color: 'blue' },
              { title: 'Sécurité des transactions', value: '100%', color: 'indigo' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-r ${
                  stat.color === 'green' ? 'from-[#9BA8AB] to-[#CCD0CF]' :
                  stat.color === 'blue' ? 'from-[#4A5C6A] to-[#9BA8AB]' :
                  'from-[#253745] to-[#4A5C6A]'
                } rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                  🔒
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{stat.title}</h3>
                <p className={`text-4xl font-black ${
                  stat.color === 'green' ? 'text-[#9BA8AB]' :
                  stat.color === 'blue' ? 'text-[#4A5C6A]' :
                  'text-[#253745]'
                }`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#9BA8AB] to-[#4A5C6A] bg-clip-text text-transparent">
              À propos
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Révolutionner l'avenir des échanges décentralisés de temps
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Notre Mission</h3>
              <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                Time-Swap représente la prochaine évolution dans la finance décentralisée. Nous construisons 
                une plateforme qui permet des échanges de temps et de compétences sans intermédiaires 
                traditionnels ou contrôle centralisé.
              </p>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Notre vision est de créer un monde où le temps devient un actif échangeable et précieux 
                qui peut être échangé à travers les frontières, les cultures et les économies.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-[#4A5C6A] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-300">Architecture décentralisée</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-[#9BA8AB] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-300">Confidentialité zero-knowledge</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-[#CCD0CF] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-300">Gouvernance communautaire</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-[#9BA8AB]/20 to-[#4A5C6A]/20 rounded-2xl border border-[#9BA8AB]/30 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-[#9BA8AB]/10 to-[#4A5C6A]/10 animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-[#9BA8AB] to-[#4A5C6A] rounded-full flex items-center justify-center text-4xl animate-pulse">
                    🚀
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Statut de la plateforme</h3>
                  <p className="text-[#9BA8AB] font-semibold">Version 2.0 - EN LIGNE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 bg-gradient-to-r from-[#4A5C6A] via-[#9BA8AB] to-[#CCD0CF]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez la révolution. Faites partie de l'avenir des échanges décentralisés de temps.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-12 py-6 bg-white text-[#4A5C6A] rounded-lg text-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Créer un compte gratuit
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4 group">
                <div className="w-8 h-8 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-sm">TS</span>
                </div>
                <span className="text-white text-xl font-bold group-hover:text-[#9BA8AB] transition-colors">Time-Swap</span>
              </Link>
              <p className="text-gray-400">L'avenir des échanges sécurisés</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors hover:underline">Fonctionnalités</a></li>
                <li><a href="#security" className="text-gray-400 hover:text-white transition-colors hover:underline">Sécurité</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors hover:underline">À propos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors hover:underline">S'inscrire</Link></li>
                <li><Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors hover:underline">Se connecter</Link></li>
                <li><AuthLink href="/dashboard" className="text-gray-400 hover:text-white transition-colors hover:underline">Tableau de bord</AuthLink></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors hover:underline">Contact</Link></li>
                <li><Link href="/legal/confidentialite" className="text-gray-400 hover:text-white transition-colors hover:underline">Confidentialité</Link></li>
                <li><Link href="/legal/mentions-legales" className="text-gray-400 hover:text-white transition-colors hover:underline">Mentions légales</Link></li>
                <li><Link href="/legal/cgu" className="text-gray-400 hover:text-white transition-colors hover:underline">CGU</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 Time-Swap Network. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}