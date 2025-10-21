'use client';

import RatingStars from './RatingStars';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    id: string;
    username: string;
  };
  reviewee: {
    id: string;
    username: string;
  };
  service?: {
    id: string;
    title: string;
  };
  booking?: {
    id: string;
  };
}

interface ReviewCardProps {
  review: Review;
  showService?: boolean;
  className?: string;
}

export default function ReviewCard({ review, showService = true, className = '' }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {review.reviewer.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.reviewer.username}</h4>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} size="sm" />
      </div>

      {review.comment && (
        <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
      )}

      {showService && review.service && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Service:</span>
          <span className="font-medium text-blue-600">{review.service.title}</span>
        </div>
      )}
    </div>
  );
}