'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../../lib/api';

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Token de réinitialisation manquant');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError('Token de réinitialisation manquant');
      setIsLoading(false);
      return;
    }

    try {
      await authApi.resetPassword(token, formData.newPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la réinitialisation';
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Réinitialiser le mot de passe</h1>
          <p className="text-[#9BA8AB] mb-6 sm:mb-8">
            Entrez votre nouveau mot de passe
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm sm:text-base">
                  Mot de passe réinitialisé avec succès ! Redirection vers la page de connexion...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4">
                  <p className="text-red-400 text-sm sm:text-base">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-[#CCD0CF] mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#06141B] border border-[#253745] rounded-lg text-white placeholder-[#4A5C6A] focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent transition-all pr-12"
                    placeholder="Minimum 6 caractères"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5C6A] hover:text-[#9BA8AB] transition-colors"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-[#4A5C6A] mt-1">
                  Doit contenir au moins une majuscule, une minuscule et un chiffre
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#CCD0CF] mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#06141B] border border-[#253745] rounded-lg text-white placeholder-[#4A5C6A] focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-transparent transition-all pr-12"
                    placeholder="Répétez le mot de passe"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5C6A] hover:text-[#9BA8AB] transition-colors"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] text-white font-semibold py-3 px-4 rounded-lg hover:from-[#5A6C7A] hover:to-[#ABBAAD] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
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

