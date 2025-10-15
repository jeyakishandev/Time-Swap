'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transition-all duration-1000"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-blue-500/25">
              <span className="text-white font-bold text-lg">TS</span>
            </div>
            <span className="text-white text-2xl font-bold group-hover:text-blue-300 transition-colors">Time-Swap</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#features"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              Fonctionnalités
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#security"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              Sécurité
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#about"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              À propos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>

          <div className="flex space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-white hover:text-blue-300 transition-all duration-300 hover:scale-105 relative group"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
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
            <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              TIME-SWAP
            </h1>
            <div className="absolute inset-0 text-6xl md:text-8xl font-black opacity-20 blur-sm bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              TIME-SWAP
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            L'avenir des <span className="text-blue-400 font-bold">échanges sécurisés</span>.
            <br />
            <span className="text-indigo-400 font-bold">Échangez</span> vos compétences, <span className="text-purple-400 font-bold">gagnez</span> des crédits, <span className="text-green-400 font-bold">construisez</span> des communautés.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-lg font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
            >
              <span className="relative z-10">Commencer gratuitement</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                className="relative p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-gray-300">{stat.title}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
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
                  color: 'from-blue-400 to-blue-600'
                },
                {
                  title: 'Sécurité bancaire',
                  desc: 'Protection militaire de vos données avec chiffrement AES-256 et authentification multi-facteurs.',
                  color: 'from-indigo-400 to-indigo-600'
                },
                {
                  title: 'Interface intuitive',
                  desc: 'Design moderne et ergonomique pour une expérience utilisateur fluide et professionnelle.',
                  color: 'from-purple-400 to-purple-600'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-300`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl border border-blue-500/30 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-4xl animate-spin">
                    💳
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Plateforme active</h3>
                  <p className="text-blue-400 font-semibold">Status: En ligne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative py-32 px-6 bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
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
                  stat.color === 'green' ? 'from-green-400 to-emerald-500' :
                  stat.color === 'blue' ? 'from-blue-400 to-blue-600' :
                  'from-indigo-400 to-indigo-600'
                } rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                  🔒
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{stat.title}</h3>
                <p className={`text-4xl font-black ${
                  stat.color === 'green' ? 'text-green-400' :
                  stat.color === 'blue' ? 'text-blue-400' :
                  'text-indigo-400'
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
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-600 bg-clip-text text-transparent">
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
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-300">Architecture décentralisée</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-300">Confidentialité zero-knowledge</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-300">Gouvernance communautaire</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-2xl border border-purple-500/30 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-600/10 animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-full flex items-center justify-center text-4xl animate-pulse">
                    🚀
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Statut de la plateforme</h3>
                  <p className="text-purple-400 font-semibold">Version 2.0 - EN LIGNE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez la révolution. Faites partie de l'avenir des échanges décentralisés de temps.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-12 py-6 bg-white text-blue-600 rounded-lg text-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-sm">TS</span>
                </div>
                <span className="text-white text-xl font-bold group-hover:text-blue-300 transition-colors">Time-Swap</span>
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
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors hover:underline">Tableau de bord</Link></li>
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