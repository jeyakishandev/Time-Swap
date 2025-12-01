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

      {/* Header - Mobile First */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-[#4A5C6A]/25">
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
            <span className="text-white text-lg sm:text-xl md:text-2xl font-bold group-hover:text-[#9BA8AB] transition-colors">Time-Swap</span>
          </Link>
          
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            <a 
              href="#features"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group text-sm xl:text-base"
            >
              Fonctionnalités
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A5C6A] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#security"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group text-sm xl:text-base"
            >
              Sécurité
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A5C6A] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#about"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group text-sm xl:text-base"
            >
              À propos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A5C6A] group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/auth/login"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-white hover:text-[#9BA8AB] transition-all duration-300 hover:scale-105 relative group text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Se connecter</span>
              <span className="sm:hidden">Connexion</span>
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-1.5 sm:px-6 sm:py-2 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4A5C6A]/25 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Commencer</span>
              <span className="sm:hidden">Start</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Mobile First */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24">
        <div className="max-w-6xl mx-auto text-center w-full">
          {/* Main Title */}
          <div className="relative mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-[#4A5C6A] via-[#9BA8AB] to-[#CCD0CF] bg-clip-text text-transparent leading-tight">
              TIME-SWAP
            </h1>
            <div className="absolute inset-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black opacity-20 blur-sm bg-gradient-to-r from-[#4A5C6A] via-[#9BA8AB] to-[#CCD0CF] bg-clip-text text-transparent">
              TIME-SWAP
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Plateforme bancaire sécurisée pour <span className="text-[#4A5C6A] font-bold">gérer vos transactions</span>.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <span className="text-[#9BA8AB] font-bold">Ouvrez</span> votre compte, <span className="text-[#CCD0CF] font-bold">effectuez</span> des virements, <span className="text-[#4A5C6A] font-bold">suivez</span> vos opérations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <Link
              href="/auth/register"
              className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white rounded-lg text-base sm:text-lg font-semibold hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="relative z-10">Ouvrir un compte</span>
            </Link>
            <button 
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/30 text-white rounded-lg text-base sm:text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Découvrir nos services
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto px-4">
            {[
              { title: 'Comptes actifs', value: '50+', icon: 'account' },
              { title: 'Transactions mensuelles', value: '500+', icon: 'transaction' },
              { title: 'Clients satisfaits', value: '100+', icon: 'users' }
            ].map((stat, index) => (
              <div
                key={index}
                className="relative p-4 sm:p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#4A5C6A]/30 transition-all duration-300"
              >
                <div className="mb-3 sm:mb-4">
                  {stat.icon === 'account' && (
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#4A5C6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                  {stat.icon === 'transaction' && (
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#4A5C6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  )}
                  {stat.icon === 'users' && (
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#4A5C6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{stat.value}</h3>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">{stat.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Mobile First */}
      <section id="features" className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] bg-clip-text text-transparent">
              Services Bancaires
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Une solution complète pour gérer vos comptes et transactions en toute sécurité
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Feature Cards */}
            <div className="space-y-8">
              {[
                {
                  title: 'Gestion de compte',
                  desc: 'Consultez votre solde, votre historique de transactions et gérez vos informations bancaires en toute simplicité.',
                  color: 'from-[#4A5C6A] to-[#9BA8AB]',
                  icon: 'account'
                },
                {
                  title: 'Virements sécurisés',
                  desc: 'Effectuez des transferts entre comptes avec un système de validation et de traçabilité complet.',
                  color: 'from-[#253745] to-[#4A5C6A]',
                  icon: 'transfer'
                },
                {
                  title: 'Portefeuille numérique',
                  desc: 'Gérez vos crédits et vos avoirs avec une interface claire et des outils de suivi avancés.',
                  color: 'from-[#9BA8AB] to-[#CCD0CF]',
                  icon: 'wallet'
                },
                {
                  title: 'Historique détaillé',
                  desc: 'Accédez à l\'ensemble de vos opérations avec des filtres et des exports pour votre comptabilité.',
                  color: 'from-[#4A5C6A] to-[#253745]',
                  icon: 'history'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-4 sm:p-5 md:p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#4A5C6A]/30 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {feature.icon === 'account' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      )}
                      {feature.icon === 'transfer' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      )}
                      {feature.icon === 'wallet' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                      {feature.icon === 'history' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Element */}
            <div className="relative order-first lg:order-last">
              <div className="w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-[#4A5C6A]/20 to-[#9BA8AB]/20 rounded-lg border border-[#4A5C6A]/30 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                <div className="relative z-10 text-center px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Sécurité bancaire</h3>
                  <p className="text-[#9BA8AB] text-xs sm:text-sm font-medium">Protection de vos données</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section - Mobile First */}
      <section id="security" className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-gradient-to-r from-[#11212D] via-[#253745] to-[#4A5C6A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#9BA8AB] to-[#4A5C6A] bg-clip-text text-transparent">
              Sécurité
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Vos données et transactions protégées par les meilleures pratiques de sécurité
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { title: 'Chiffrement des données', value: 'AES-256', color: 'green' },
              { title: 'Transactions sécurisées', value: 'SSL/TLS', color: 'blue' },
              { title: 'Authentification', value: '2FA', color: 'indigo' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r ${
                  stat.color === 'green' ? 'from-[#9BA8AB] to-[#CCD0CF]' :
                  stat.color === 'blue' ? 'from-[#4A5C6A] to-[#9BA8AB]' :
                  'from-[#253745] to-[#4A5C6A]'
                } rounded-lg flex items-center justify-center`}>
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{stat.title}</h3>
                <p className={`text-xl sm:text-2xl font-bold ${
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

      {/* About Section - Mobile First */}
      <section id="about" className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#9BA8AB] to-[#4A5C6A] bg-clip-text text-transparent">
              À propos
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Une plateforme moderne pour échanger des services et des compétences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Notre Engagement</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-base sm:text-lg">
                Time-Swap est une plateforme bancaire moderne qui offre une gestion complète de vos comptes 
                et transactions. Notre système sécurisé garantit la protection de vos données et la traçabilité 
                de toutes vos opérations financières.
              </p>
              <p className="text-gray-300 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                Avec des fonctionnalités avancées de suivi, des notifications en temps réel, 
                et une interface intuitive, nous offrons une expérience bancaire digitale de qualité professionnelle.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-[#4A5C6A] rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Gestion de compte complète</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-[#9BA8AB] rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Virements sécurisés</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-[#CCD0CF] rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Sécurité renforcée</span>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-[#9BA8AB]/20 to-[#4A5C6A]/20 rounded-lg border border-[#9BA8AB]/30 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                <div className="relative z-10 text-center px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-[#9BA8AB] to-[#4A5C6A] rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Plateforme active</h3>
                  <p className="text-[#9BA8AB] text-xs sm:text-sm font-medium">Services bancaires en ligne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile First */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-gradient-to-r from-[#4A5C6A] via-[#9BA8AB] to-[#CCD0CF]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Ouvrez votre compte
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Rejoignez notre plateforme bancaire. Gérez vos comptes et effectuez vos transactions en toute sécurité.
          </p>
          <Link
            href="/auth/register"
            className="inline-block w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-white text-[#4A5C6A] rounded-lg text-lg sm:text-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
          >
            Ouvrir un compte
          </Link>
        </div>
      </section>

      {/* Footer - Mobile First */}
      <footer className="relative py-8 sm:py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4 group">
                <div className="w-8 h-8 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-sm">TS</span>
                </div>
                <span className="text-white text-xl font-bold group-hover:text-[#9BA8AB] transition-colors">Time-Swap</span>
              </Link>
              <p className="text-gray-400">Plateforme bancaire sécurisée</p>
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