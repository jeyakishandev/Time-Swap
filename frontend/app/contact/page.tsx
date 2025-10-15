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

      {/* Main Content */}
      <main className="relative z-10 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Une question sur Time-Swap ? Un problème technique ? Une suggestion ? 
              Notre équipe est là pour vous aider !
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Envoyez-nous un message</h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-200">
                    ✅ Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200">
                    ❌ Erreur lors de l'envoi. Veuillez réessayer ou nous contacter directement par email.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sujet *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="" className="bg-slate-800">Sélectionnez un sujet</option>
                    <option value="support" className="bg-slate-800">Support technique</option>
                    <option value="feature" className="bg-slate-800">Demande de fonctionnalité</option>
                    <option value="bug" className="bg-slate-800">Signaler un bug</option>
                    <option value="partnership" className="bg-slate-800">Partenariat</option>
                    <option value="other" className="bg-slate-800">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Direct Contact */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">Contact direct</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-xl">📧</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Email général</h4>
                      <a href="mailto:contact@timeswap.network" className="text-gray-300 hover:text-blue-300 transition-colors">
                        contact@timeswap.network
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-400 text-xl">🛠️</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Support technique</h4>
                      <a href="mailto:support@timeswap.network" className="text-gray-300 hover:text-green-300 transition-colors">
                        support@timeswap.network
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-xl">🤝</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Partenariats</h4>
                      <a href="mailto:partnerships@timeswap.network" className="text-gray-300 hover:text-purple-300 transition-colors">
                        partnerships@timeswap.network
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-red-400 text-xl">🔒</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Sécurité & Confidentialité</h4>
                      <a href="mailto:security@timeswap.network" className="text-gray-300 hover:text-red-300 transition-colors">
                        security@timeswap.network
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white mb-4">Temps de réponse</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Support technique</span>
                    <span className="text-blue-300 font-semibold">24h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Questions générales</span>
                    <span className="text-green-300 font-semibold">48h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Partenariats</span>
                    <span className="text-purple-300 font-semibold">72h</span>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Questions fréquentes</h3>
                <p className="text-gray-300 mb-4">
                  Vous avez peut-être déjà la réponse à votre question !
                </p>
                <div className="space-y-2">
                  <a href="/legal/cgu" className="block text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                    → Conditions d'utilisation
                  </a>
                  <a href="/legal/confidentialite" className="block text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                    → Politique de confidentialité
                  </a>
                  <a href="/legal/mentions-legales" className="block text-blue-400 hover:text-blue-300 transition-colors hover:underline">
                    → Mentions légales
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
