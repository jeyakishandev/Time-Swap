'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Stocker le token et les infos utilisateur dans localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Rediriger vers le dashboard
        router.push('/dashboard');
      } else {
        const error = await response.json();
        setError(error.message || 'Erreur lors de la connexion');
      }
    } catch (err: any) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06141B] via-[#11212D] to-[#253745] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 text-white group">
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
            <span className="text-2xl font-bold group-hover:text-[#9BA8AB] transition-colors">Time-Swap</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
            <p className="text-gray-300">Accédez à votre compte sécurisé</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white py-3 px-4 rounded-lg hover:from-[#253745] hover:to-[#4A5C6A] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-[#4A5C6A] hover:text-[#9BA8AB] transition-colors font-semibold">
                S'inscrire
              </Link>
            </p>
          </div>

          {/* Test accounts */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-sm text-gray-300 mb-2">Comptes de test :</p>
            <p className="text-sm text-gray-400">Email: alice@example.com</p>
            <p className="text-sm text-gray-400">Mot de passe: password123</p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}