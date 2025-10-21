'use client';

import ReviewCard from './ReviewCard';

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

interface ReviewsListProps {
  reviews: Review[];
  title?: string;
  showEmptyState?: boolean;
  emptyStateMessage?: string;
}

export default function ReviewsList({
  reviews,
  title = 'Avis',
  showEmptyState = true,
  emptyStateMessage = 'Aucun avis pour le moment.'
}: ReviewsListProps) {
  if (reviews.length === 0 && showEmptyState) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-500">{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title} ({reviews.length})
      </h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
