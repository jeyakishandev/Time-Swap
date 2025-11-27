'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);
    setResetLink(null);

    try {
      const data = await authApi.forgotPassword(email);
      setSuccess(true);
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'envoi de l\'email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06141B] via-[#11212D] to-[#253745] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 sm:space-x-3 text-white group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-[#4A5C6A]/25">
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="45" fill="url(#gradient)" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4A5C6A" />
                    <stop offset="100%" stopColor="#9BA8AB" />
                  </linearGradient>
                </defs>
                <text x="50" y="65" fontSize="40" fill="white" textAnchor="middle" fontWeight="bold">TS</text>
              </svg>
            </div>
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] bg-clip-text text-transparent">
              Time-Swap
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#11212D]/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#253745]/50">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mot de passe oublié</h1>
          <p className="text-[#9BA8AB] mb-6 sm:mb-8">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm sm:text-base">
                  {resetLink 
                    ? 'Lien de réinitialisation généré (mode développement) :'
                    : 'Si cet email existe, un lien de réinitialisation a été envoyé à votre adresse email.'
                  }
                </p>
                {resetLink && (
                  <div className="mt-3 p-3 bg-[#06141B] rounded border border-green-500/20">
                    <p className="text-xs text-green-300 break-all">{resetLink}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(resetLink);
                        alert('Lien copié !');
                      }}
                      className="mt-2 text-xs text-green-400 hover:text-green-300 underline"
                    >
                      Copier le lien
                    </button>
                  </div>
                )}
              </div>
              <Link
                href="/auth/login"
                className="block w-full text-center text-[#4A5C6A] hover:text-[#9BA8AB] transition-colors"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4">
                  <p className="text-red-400 text-sm sm:text-base">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#CCD0CF] mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#06141B] border border-[#253745] rounded-lg text-white placeholder-[#4A5C6A] focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent transition-all"
                  placeholder="votre@email.com"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white font-semibold py-3 px-4 rounded-lg hover:from-[#5A6C7A] hover:to-[#ABBAAD] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-[#4A5C6A] hover:text-[#9BA8AB] transition-colors text-sm sm:text-base"
                >
                  ← Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

