'use client';

import { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import { reviewsApi, type Review } from '../lib/api';

// Type Review importé depuis lib/api.ts

interface ReviewsListProps {
  userId?: string;
  serviceId?: string;
  showService?: boolean;
  limit?: number;
  className?: string;
}

export default function ReviewsList({ 
  userId, 
  serviceId, 
  showService = true, 
  limit,
  className = '' 
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: Review[];
        if (userId) {
          data = await reviewsApi.getByUser(userId);
        } else if (serviceId) {
          data = await reviewsApi.getByService(serviceId);
        } else {
          data = await reviewsApi.getAll();
        }

        const limitedReviews = limit ? data.slice(0, limit) : data;
        setReviews(limitedReviews);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des avis');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId, serviceId, limit]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
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

  if (reviews.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <p className="text-gray-500">Aucun avis pour le moment</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          showService={showService}
        />
      ))}
    </div>
  );
}