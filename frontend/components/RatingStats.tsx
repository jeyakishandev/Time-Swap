'use client';

import RatingStars from './RatingStars';

interface RatingStatsProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  showDistribution?: boolean;
}

export default function RatingStats({
  averageRating,
  totalReviews,
  ratingDistribution,
  showDistribution = true
}: RatingStatsProps) {
  const getRatingPercentage = (stars: number) => {
    if (!ratingDistribution || totalReviews === 0) return 0;
    return (ratingDistribution[stars as keyof typeof ratingDistribution] / totalReviews) * 100;
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Très bien';
    if (rating >= 3.5) return 'Bien';
    if (rating >= 3.0) return 'Correct';
    if (rating >= 2.0) return 'Moyen';
    return 'À améliorer';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {averageRating.toFixed(1)}
          </div>
          <RatingStars rating={averageRating} size="lg" />
          <p className="text-sm text-gray-600 mt-2">
            {getRatingText(averageRating)}
          </p>
        </div>
        
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {totalReviews} {totalReviews === 1 ? 'avis' : 'avis'}
          </p>
          <p className="text-gray-600">
            Basé sur les retours des utilisateurs
          </p>
        </div>
      </div>

      {showDistribution && ratingDistribution && totalReviews > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 mb-3">Répartition des notes</h4>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars as keyof typeof ratingDistribution];
            const percentage = getRatingPercentage(stars);
            
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-4">
                  {stars}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#4A5C6A] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
