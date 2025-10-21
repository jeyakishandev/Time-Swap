'use client';

import RatingStars from './RatingStars';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  reviewer: {
    id: string;
    username: string;
  };
  service?: {
    id: string;
    title: string;
  };
  createdAt: string;
}

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#4A5C6A] to-[#9BA8AB] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {review.reviewer.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.reviewer.username}</h4>
            {review.service && (
              <p className="text-sm text-gray-500">Service: {review.service.title}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <RatingStars rating={review.rating} size="sm" />
          <p className="text-xs text-gray-500 mt-1">{formatDate(review.createdAt)}</p>
        </div>
      </div>
      
      {review.comment && (
        <div className="mt-4">
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
      )}
    </div>
  );
}
