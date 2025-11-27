'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulation d'envoi (dans un vrai projet, on ferait un appel API)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06141B] via-[#11212D] to-[#253745]">
      {/* Header - Mobile First */}
      <header className="relative z-10 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-[#4A5C6A]/25">
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
              <span className="text-white text-lg sm:text-xl font-bold group-hover:text-[#9BA8AB] transition-colors">Time-Swap</span>
            </Link>
            
            <Link 
              href="/"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-white hover:text-[#9BA8AB] transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">← Retour à l'accueil</span>
              <span className="sm:hidden">← Retour</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile First */}
      <main className="relative z-10 pb-12 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              Contactez-nous
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Une question ? Un problème ? Notre équipe est là pour vous aider.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 order-2 lg:order-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Envoyez-nous un message</h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
                  Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
                  Erreur lors de l'envoi. Veuillez réessayer.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent text-sm sm:text-base"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent text-sm sm:text-base"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    Sujet *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent text-sm sm:text-base"
                    required
                  >
                    <option value="" className="bg-slate-800">Sélectionner un sujet</option>
                    <option value="support" className="bg-slate-800">Support technique</option>
                    <option value="bug" className="bg-slate-800">Signaler un bug</option>
                    <option value="feature" className="bg-slate-800">Demande de fonctionnalité</option>
                    <option value="account" className="bg-slate-800">Problème de compte</option>
                    <option value="other" className="bg-slate-800">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent resize-none text-sm sm:text-base"
                    placeholder="Décrivez votre demande en détail..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white py-3 sm:py-3.5 px-6 rounded-lg hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-sm sm:text-base"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
              {/* Contact Methods */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Autres moyens de contact</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4A5C6A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A5C6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Email</h3>
                      <p className="text-sm sm:text-base text-gray-300 break-words">contact@timeswap.network</p>
                      <p className="text-xs sm:text-sm text-gray-400">Réponse sous 24h</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#9BA8AB]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#9BA8AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Support</h3>
                      <p className="text-sm sm:text-base text-gray-300 break-words">support@timeswap.network</p>
                      <p className="text-xs sm:text-sm text-gray-400">Aide technique</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#CCD0CF]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#CCD0CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Développement</h3>
                      <p className="text-sm sm:text-base text-gray-300 break-words">dev@timeswap.network</p>
                      <p className="text-xs sm:text-sm text-gray-400">Questions techniques</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Questions fréquentes</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Comment créer un compte ?</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Cliquez sur "S'inscrire" et remplissez le formulaire avec vos informations.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Les crédits sont-ils réels ?</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Non, les crédits Time-Swap sont virtuels et n'ont aucune valeur monétaire.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Comment réinitialiser mon mot de passe ?</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Contactez-nous par email avec votre nom d'utilisateur pour obtenir de l'aide.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Puis-je supprimer mon compte ?</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Oui, contactez-nous et nous supprimerons votre compte et vos données.</p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-r from-[#4A5C6A]/10 to-[#9BA8AB]/10 rounded-2xl p-4 sm:p-6 border border-[#4A5C6A]/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4A5C6A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A5C6A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">Temps de réponse</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Nous nous engageons à vous répondre dans les 24 heures</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}