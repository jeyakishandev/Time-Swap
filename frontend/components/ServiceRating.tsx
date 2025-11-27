'use client';

import { useState, useEffect } from 'react';
import { reviewsApi } from '../lib/api';

interface ServiceRatingProps {
  serviceId: string;
  className?: string;
  onReviewClick?: () => void;
  showReviewButton?: boolean;
}

export default function ServiceRating({ serviceId, className = '', onReviewClick, showReviewButton = true }: ServiceRatingProps) {
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const data = await reviewsApi.getServiceAverage(serviceId);
        setRating(data);
      } catch (error) {
        // Erreur silencieuse
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchRating();
    }
  }, [serviceId]);

  if (loading) {
    return <div className={`text-gray-400 text-sm ${className}`}>...</div>;
  }

  if (!rating || rating.count === 0) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="text-gray-400 text-sm">
          Aucun avis
        </div>
        {showReviewButton && onReviewClick && (
          <button
            onClick={onReviewClick}
            className="text-[#4A5C6A] hover:text-[#9BA8AB] text-xs transition-colors"
          >
            Laisser un avis
          </button>
        )}
      </div>
    );
  }

  const renderStars = (average: number) => {
    const stars = [];
    const fullStars = Math.floor(average);
    const hasHalfStar = average % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400 text-sm">★</span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400 text-sm">☆</span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-400 text-sm">☆</span>
        );
      }
    }
    return stars;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-1">
        <div className="flex">
          {renderStars(rating.average)}
        </div>
        <span className="text-white text-sm font-medium">
          {rating.average.toFixed(1)}
        </span>
        <span className="text-gray-400 text-xs">
          ({rating.count} avis)
        </span>
      </div>
      {showReviewButton && onReviewClick && (
        <button
          onClick={onReviewClick}
          className="text-[#4A5C6A] hover:text-[#9BA8AB] text-xs transition-colors"
        >
          Laisser un avis
        </button>
      )}
    </div>
  );
}
