'use client';

import { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import { reviewsApi } from '../lib/api';

interface RatingStatsProps {
  userId?: string;
  serviceId?: string;
  className?: string;
}

interface RatingDistribution {
  rating: number;
  count: number;
}

interface StatsData {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution[];
}

export default function RatingStats({ userId, serviceId, className = '' }: RatingStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Non authentifié');
          return;
        }

        let reviews;
        if (userId) {
          reviews = await reviewsApi.getByUser(userId);
        } else if (serviceId) {
          reviews = await reviewsApi.getByService(serviceId);
        } else {
          reviews = await reviewsApi.getAll();
        }
        
        if (reviews.length === 0) {
          setStats({
            averageRating: 0,
            totalReviews: 0,
            distribution: []
          });
          return;
        }

        // Calculer la moyenne
        const averageRating = reviews.reduce((sum: number, review) => sum + review.rating, 0) / reviews.length;
        
        // Calculer la distribution
        const distribution = [5, 4, 3, 2, 1].map(rating => ({
          rating,
          count: reviews.filter((review) => review.rating === rating).length
        }));

        setStats({
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.length,
          distribution
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, serviceId]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-3 w-8 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des avis</h3>
        <p className="text-gray-500">Aucun avis pour le moment</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des avis</h3>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="text-3xl font-bold text-gray-900">
          {stats.averageRating.toFixed(1)}
        </div>
        <div>
          <RatingStars rating={Math.round(stats.averageRating)} size="lg" />
          <p className="text-sm text-gray-500 mt-1">
            Basé sur {stats.totalReviews} avis
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {stats.distribution.map(({ rating, count }) => {
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-4">{rating}</span>
              <RatingStars rating={rating} size="sm" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}