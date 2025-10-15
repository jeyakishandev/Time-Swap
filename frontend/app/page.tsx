'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({ users: 0, transactions: 0, security: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    
    // Animation des stats au chargement
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setStats({
          users: Math.floor(100 * progress),
          transactions: Math.floor(24 * progress),
          security: Math.floor(99.9 * progress)
        });
        
        if (step >= steps) {
          clearInterval(timer);
          setStats({ users: 100, transactions: 24, security: 99.9 });
        }
      }, stepDuration);
    };

    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Gestion du scroll pour la navbar
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Gestion de la position de la souris pour les effets
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Rotation automatique des features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Navigation Dynamique */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-blue-500/25">
              <span className="text-white font-bold text-lg">TS</span>
            </div>
            <span className="text-white text-xl font-bold group-hover:text-blue-300 transition-colors">Time-Swap</span>
          </a>
          
          <div className="hidden md:flex space-x-8">
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
          </div>

          <div className="flex space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-white hover:text-blue-300 transition-all duration-300 hover:scale-105 relative group"
            >
              Se connecter
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 font-semibold relative overflow-hidden group"
            >
              <span className="relative z-10">S'inscrire</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-16">
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
                L'avenir des
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> échanges</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Une plateforme sécurisée et moderne pour échanger des crédits temps entre particuliers et entreprises
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  Commencer gratuitement
                </Link>
                <button 
                  onClick={() => {
                    // Scroll vers la section features pour montrer la "démo"
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-slate-900 transition-all duration-300 transform hover:scale-105"
                >
                  Voir la démo
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">100%</div>
                <div className="text-gray-300">Sécurisé</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-300">Disponible</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">0€</div>
                <div className="text-gray-300">Frais cachés</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Fonctionnalités</h2>
            <p className="text-xl text-gray-300">Tout ce dont vous avez besoin pour gérer vos échanges</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Sécurité bancaire</h3>
              <p className="text-gray-300">Transactions chiffrées et authentification forte pour protéger vos échanges</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Transfers instantanés</h3>
              <p className="text-gray-300">Échangez vos crédits en temps réel avec des transactions atomiques</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Suivi détaillé</h3>
              <p className="text-gray-300">Historique complet de toutes vos transactions avec analytics avancés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Sécurité de niveau bancaire</h2>
              <p className="text-xl text-gray-300 mb-8">
                Vos données sont protégées par les mêmes standards de sécurité que les grandes banques
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Chiffrement AES-256</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Authentification JWT sécurisée</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Transactions atomiques</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Conformité RGPD</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl p-8 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-4xl">🛡️</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">99.9% de disponibilité</h3>
                <p className="text-gray-300">Infrastructure redondante et monitoring 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-20 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">À propos de Time-Swap</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Une plateforme révolutionnaire qui transforme la façon dont nous échangeons du temps et des services
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Notre Mission</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Time-Swap révolutionne l'économie collaborative en permettant aux utilisateurs d'échanger 
                leurs compétences et leur temps de manière sécurisée et transparente. Notre plateforme 
                connecte les talents et facilite les échanges équitables.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Économie collaborative</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Transparence totale</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Communauté bienveillante</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl p-8 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-3xl">💡</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">L'idée</h3>
                <p className="text-gray-300 mb-6">
                  "Chaque personne a des talents uniques à partager. Time-Swap facilite ces échanges 
                  pour créer une économie plus humaine et équitable."
                </p>
                <div className="text-blue-300 font-semibold">- L'équipe Time-Swap</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'utilisateurs qui font déjà confiance à Time-Swap
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Créer un compte gratuit
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center space-x-2 mb-4 group cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <span className="text-white font-bold text-sm">TS</span>
                </div>
                <span className="text-white text-xl font-bold group-hover:text-blue-300 transition-colors">Time-Swap</span>
              </a>
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
                <li><a href="mailto:contact@timeswap.network" className="text-gray-400 hover:text-white transition-colors hover:underline">Contact</a></li>
                <li><a href="mailto:privacy@timeswap.network" className="text-gray-400 hover:text-white transition-colors hover:underline">Confidentialité</a></li>
                <li><a href="mailto:legal@timeswap.network" className="text-gray-400 hover:text-white transition-colors hover:underline">Mentions légales</a></li>
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