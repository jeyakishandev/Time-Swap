'use client';

import { useState } from 'react';
import RatingStars from './RatingStars';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment: string; revieweeId: string; serviceId?: string; bookingId?: string }) => void;
  revieweeId: string;
  revieweeName: string;
  serviceId?: string;
  serviceTitle?: string;
  bookingId?: string;
}

export default function CreateReviewModal({
  isOpen,
  onClose,
  onSubmit,
  revieweeId,
  revieweeName,
  serviceId,
  serviceTitle,
  bookingId
}: CreateReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        revieweeId,
        serviceId,
        bookingId
      });
      
      // Reset form
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de l\'avis:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Évaluer {revieweeName}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {serviceTitle && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Service:</span> {serviceTitle}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note *
              </label>
              <RatingStars
                rating={rating}
                onRatingChange={setRating}
                interactive={true}
                size="lg"
                className="justify-start"
              />
              {rating === 0 && (
                <p className="text-sm text-red-500 mt-1">Veuillez sélectionner une note</p>
              )}
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Partagez votre expérience avec ce service..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{comment.length}/500 caractères</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer l\'avis'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}