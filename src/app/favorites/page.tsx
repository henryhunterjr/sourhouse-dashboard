'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bakery,
  SAMPLE_BAKERIES,
  SPECIALTY_LABELS,
  BAKERY_TYPE_LABELS,
  isOpenNow,
} from '@/types';
import {
  MapPinned,
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Clock,
  Store,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('breadfindr_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage
  const updateFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('breadfindr_favorites', JSON.stringify(newFavorites));
  };

  // Remove from favorites
  const removeFavorite = (bakeryId: string) => {
    updateFavorites(favorites.filter((id) => id !== bakeryId));
  };

  // Clear all favorites
  const clearAllFavorites = () => {
    updateFavorites([]);
  };

  // Get favorite bakeries
  const favoriteBakeries = SAMPLE_BAKERIES.filter((b) => favorites.includes(b.id));

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C45B24] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
      <header className="bg-[#C45B24] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">My Favorites</h1>
                  <p className="text-white/70 text-sm">
                    {favorites.length} saved {favorites.length === 1 ? 'bakery' : 'bakeries'}
                  </p>
                </div>
              </div>
            </div>

            {favorites.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {favoriteBakeries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Save your favorite bakeries by clicking the heart icon on any bakery card. They&apos;ll appear here for easy access.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C45B24] text-white rounded-lg font-semibold hover:bg-[#a84d1e] transition-colors"
            >
              <MapPinned className="w-5 h-5" />
              Explore Bakeries
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteBakeries.map((bakery) => (
              <FavoriteCard
                key={bakery.id}
                bakery={bakery}
                onRemove={() => removeFavorite(bakery.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FavoriteCard({ bakery, onRemove }: { bakery: Bakery; onRemove: () => void }) {
  const openNow = isOpenNow(bakery.hours);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bakery.latitude},${bakery.longitude}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Photo */}
        <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-gray-100">
          {bakery.photos.length > 0 ? (
            <img
              src={bakery.photos[0]}
              alt={bakery.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Store className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-gray-900 truncate">{bakery.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  bakery.type === 'bakery' ? 'bg-orange-100 text-orange-700' :
                  bakery.type === 'farmers_market' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {BAKERY_TYPE_LABELS[bakery.type]}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(bakery.rating)
                          ? 'fill-[#FFD700] text-[#FFD700]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium text-gray-700 ml-1">{bakery.rating}</span>
                  <span className="text-sm text-gray-500">({bakery.review_count})</span>
                </div>
                {openNow && (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Clock className="w-4 h-4" />
                    Open Now
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                {bakery.address}, {bakery.city}, {bakery.state}
              </p>

              <div className="flex flex-wrap gap-1">
                {bakery.specialties.slice(0, 4).map((specialty) => (
                  <span
                    key={specialty}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {SPECIALTY_LABELS[specialty]}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={onRemove}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Remove from favorites"
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <Link
              href={`/?bakery=${bakery.id}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#C45B24] text-white text-sm font-medium rounded-lg hover:bg-[#a84d1e] transition-colors"
            >
              View Details
            </Link>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Directions
            </a>
            {bakery.phone && (
              <a
                href={`tel:${bakery.phone}`}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Call
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
