'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Bakery,
  Review,
  BakeryType,
  Specialty,
  FilterState,
  ViewMode,
  SPECIALTY_LABELS,
  BAKERY_TYPE_LABELS,
  SAMPLE_BAKERIES,
  SAMPLE_REVIEWS,
  calculateDistance,
  isOpenNow,
} from '@/types';
import {
  Search,
  MapPin,
  Grid3X3,
  List,
  Map,
  Star,
  Clock,
  Phone,
  Globe,
  Instagram,
  ChevronDown,
  X,
  Heart,
  Navigation,
  ExternalLink,
  Filter,
  Loader2,
  MapPinned,
  Store,
  Home,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Send,
  Check,
  AlertCircle,
  Plus,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#C45B24]" />
    </div>
  ),
});

// Custom hook for localStorage with SSR safety
function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

// Star Rating Component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

// Bakery Type Badge Component
function BakeryTypeBadge({ type }: { type: BakeryType }) {
  const styles = {
    bakery: 'bg-[#C45B24]/10 text-[#C45B24] border-[#C45B24]/20',
    farmers_market: 'bg-green-100 text-green-700 border-green-200',
    home_baker: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const icons = {
    bakery: Store,
    farmers_market: Leaf,
    home_baker: Home,
  };

  const Icon = icons[type];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${styles[type]}`}>
      <Icon className="w-3 h-3" />
      {BAKERY_TYPE_LABELS[type]}
    </span>
  );
}

// Bakery Card Component
function BakeryCard({
  bakery,
  onClick,
  isFavorite,
  onToggleFavorite,
  distance,
  viewMode,
}: {
  bakery: Bakery;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  distance?: number;
  viewMode: ViewMode;
}) {
  const openNow = isOpenNow(bakery.hours);

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer animate-fade-in"
        onClick={onClick}
      >
        <div className="flex gap-4">
          {/* Photo */}
          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {bakery.photos.length > 0 ? (
              <img
                src={bakery.photos[0]}
                alt={bakery.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Store className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">{bakery.name}</h3>
                <BakeryTypeBadge type={bakery.type} />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <StarRating rating={Math.round(bakery.rating)} size="sm" />
                <span className="font-medium">{bakery.rating}</span>
                <span className="text-gray-400">({bakery.review_count})</span>
              </div>
              {distance !== undefined && (
                <span className="text-gray-400">
                  {distance.toFixed(1)} mi
                </span>
              )}
              {openNow && (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Open Now
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {bakery.address}, {bakery.city}, {bakery.state}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer animate-fade-in ${
        bakery.featured ? 'border-[#FFD700] ring-1 ring-[#FFD700]/20' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      {/* Photo */}
      <div className="aspect-[16/10] relative bg-gray-100">
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

        {/* Featured badge */}
        {bakery.featured && (
          <div className="absolute top-3 left-3 bg-[#FFD700] text-gray-900 px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Open now badge */}
        {openNow && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Open Now
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{bakery.name}</h3>
          <BakeryTypeBadge type={bakery.type} />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={Math.round(bakery.rating)} size="sm" />
          <span className="text-sm font-medium text-gray-700">{bakery.rating}</span>
          <span className="text-sm text-gray-400">({bakery.review_count})</span>
        </div>

        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{bakery.city}, {bakery.state}</span>
          {distance !== undefined && (
            <span className="text-gray-400 ml-auto whitespace-nowrap">
              {distance.toFixed(1)} mi
            </span>
          )}
        </p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mt-3">
          {bakery.specialties.slice(0, 3).map((specialty) => (
            <span
              key={specialty}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {SPECIALTY_LABELS[specialty]}
            </span>
          ))}
          {bakery.specialties.length > 3 && (
            <span className="px-2 py-0.5 text-gray-400 text-xs">
              +{bakery.specialties.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Bakery Detail Modal
function BakeryModal({
  bakery,
  reviews,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSubmitReview,
}: {
  bakery: Bakery;
  reviews: Review[];
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSubmitReview: (review: { author_name: string; rating: number; review_text: string }) => void;
}) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmitReview = () => {
    if (!reviewName.trim() || !reviewText.trim()) return;

    setSubmitStatus('submitting');

    // Simulate API call
    setTimeout(() => {
      onSubmitReview({
        author_name: reviewName,
        rating: reviewRating,
        review_text: reviewText,
      });
      setSubmitStatus('success');
      setShowReviewForm(false);
      setReviewName('');
      setReviewRating(5);
      setReviewText('');
      setTimeout(() => setSubmitStatus('idle'), 2000);
    }, 500);
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bakery.latitude},${bakery.longitude}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">{bakery.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Photo Gallery */}
        {bakery.photos.length > 0 && (
          <div className="relative aspect-video bg-gray-100">
            <img
              src={bakery.photos[currentPhotoIndex]}
              alt={`${bakery.name} photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {bakery.photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPhotoIndex((i) => (i === 0 ? bakery.photos.length - 1 : i - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPhotoIndex((i) => (i === bakery.photos.length - 1 ? 0 : i + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {bakery.photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPhotoIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Type and rating */}
          <div className="flex items-center justify-between mb-4">
            <BakeryTypeBadge type={bakery.type} />
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(bakery.rating)} size="md" />
              <span className="font-semibold">{bakery.rating}</span>
              <span className="text-gray-500">({bakery.review_count} reviews)</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">{bakery.description}</p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={onToggleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
            </a>
            {bakery.order_url && (
              <a
                href={bakery.order_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C45B24] text-white hover:bg-[#a84d1e] transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Order Online
              </a>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#C45B24] mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Address</p>
                <p className="text-gray-600">{bakery.address}</p>
                <p className="text-gray-600">{bakery.city}, {bakery.state} {bakery.zip}</p>
              </div>
            </div>

            {/* Hours */}
            {bakery.hours && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#C45B24] mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Hours</p>
                  <p className="text-gray-600">{bakery.hours}</p>
                </div>
              </div>
            )}

            {/* Phone */}
            {bakery.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#C45B24] mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <a href={`tel:${bakery.phone}`} className="text-[#C45B24] hover:underline">
                    {bakery.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Website */}
            {bakery.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-[#C45B24] mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Website</p>
                  <a
                    href={bakery.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C45B24] hover:underline truncate block max-w-[200px]"
                  >
                    {bakery.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}

            {/* Instagram */}
            {bakery.instagram && (
              <div className="flex items-start gap-3">
                <Instagram className="w-5 h-5 text-[#C45B24] mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Instagram</p>
                  <a
                    href={`https://instagram.com/${bakery.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C45B24] hover:underline"
                  >
                    {bakery.instagram}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Specialties */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {bakery.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="px-3 py-1 bg-[#C45B24]/10 text-[#C45B24] rounded-full text-sm"
                >
                  {SPECIALTY_LABELS[specialty]}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Reviews</h3>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-[#C45B24] hover:text-[#a84d1e] text-sm font-medium"
              >
                Write a Review
              </button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent resize-none"
                    placeholder="Share your experience..."
                  />
                </div>
                <button
                  onClick={handleSubmitReview}
                  disabled={!reviewName.trim() || !reviewText.trim() || submitStatus === 'submitting'}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C45B24] text-white rounded-lg hover:bg-[#a84d1e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitStatus === 'submitting' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit Review
                </button>
              </div>
            )}

            {/* Success message */}
            {submitStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 mb-4 p-3 bg-green-50 rounded-lg">
                <Check className="w-5 h-5" />
                Review submitted successfully!
              </div>
            )}

            {/* Review list */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{review.author_name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    <p className="text-gray-700 mt-2">{review.review_text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function BreadFindr() {
  // State
  const [bakeries] = useState<Bakery[]>(SAMPLE_BAKERIES);
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);
  const [favorites, setFavorites] = useLocalStorage<string[]>('breadfindr_favorites', []);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedBakery, setSelectedBakery] = useState<Bakery | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    specialties: [],
    openNow: false,
    radius: 50,
    sortBy: 'rating',
  });

  // Geocode location using Nominatim (free OpenStreetMap geocoding)
  const geocodeLocation = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=1`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.length > 0) {
        setSearchedLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].display_name.split(',').slice(0, 2).join(','),
        });
      } else {
        setLocationError('Location not found. Try a different search term.');
      }
    } catch {
      setLocationError('Failed to search location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setSearchedLocation({
          ...location,
          name: 'Your Location',
        });
        setLocationQuery('');
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An error occurred getting your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Handle location search
  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationQuery.trim()) {
      geocodeLocation(locationQuery);
    }
  };

  // Clear location
  const clearLocation = () => {
    setSearchedLocation(null);
    setLocationQuery('');
    setLocationError(null);
  };

  // Filter and sort bakeries
  const filteredBakeries = useMemo(() => {
    let result = [...bakeries];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.specialties.some((s) => SPECIALTY_LABELS[s].toLowerCase().includes(query))
      );
    }

    // Filter by type
    if (filters.type !== 'all') {
      result = result.filter((b) => b.type === filters.type);
    }

    // Filter by specialties
    if (filters.specialties.length > 0) {
      result = result.filter((b) =>
        filters.specialties.some((s) => b.specialties.includes(s))
      );
    }

    // Filter by open now
    if (filters.openNow) {
      result = result.filter((b) => isOpenNow(b.hours));
    }

    // Calculate distances and filter by radius if location is set
    if (searchedLocation) {
      result = result.map((b) => ({
        ...b,
        distance: calculateDistance(searchedLocation.lat, searchedLocation.lng, b.latitude, b.longitude),
      }));

      result = result.filter((b) => (b as Bakery & { distance: number }).distance <= filters.radius);
    }

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        if (searchedLocation) {
          result.sort((a, b) => {
            const distA = (a as Bakery & { distance: number }).distance || 0;
            const distB = (b as Bakery & { distance: number }).distance || 0;
            return distA - distB;
          });
        }
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [bakeries, searchQuery, filters, searchedLocation]);

  // Get bakery distances for display
  const getBakeryDistance = (bakery: Bakery): number | undefined => {
    if (!searchedLocation) return undefined;
    return calculateDistance(searchedLocation.lat, searchedLocation.lng, bakery.latitude, bakery.longitude);
  };

  // Toggle favorite
  const toggleFavorite = (bakeryId: string) => {
    setFavorites((prev) =>
      prev.includes(bakeryId) ? prev.filter((id) => id !== bakeryId) : [...prev, bakeryId]
    );
  };

  // Get reviews for a bakery
  const getBakeryReviews = (bakeryId: string) => {
    return reviews.filter((r) => r.bakery_id === bakeryId);
  };

  // Submit a review
  const handleSubmitReview = (bakeryId: string, review: { author_name: string; rating: number; review_text: string }) => {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      bakery_id: bakeryId,
      author_name: review.author_name,
      rating: review.rating,
      review_text: review.review_text,
      created_at: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  // Toggle specialty filter
  const toggleSpecialty = (specialty: Specialty) => {
    setFilters((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
      <header className="bg-[#C45B24] text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <MapPinned className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">BreadFindr</h1>
                <p className="text-white/70 text-sm">Find artisan bread near you</p>
              </div>
            </div>

            <a
              href="/submit"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-[#C45B24] rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your Bakery
            </a>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Bakery search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C45B24]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bakeries, specialties..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* Location search */}
            <form onSubmit={handleLocationSearch} className="flex-1 sm:max-w-xs relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C45B24]/50" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="City or ZIP code"
                className="w-full pl-10 pr-20 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#C45B24] hover:bg-[#C45B24]/10 rounded-md transition-colors"
                title="Use my location"
              >
                {isLoadingLocation ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>

          {/* Location badge */}
          {searchedLocation && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                <MapPin className="w-4 h-4" />
                <span>{searchedLocation.name}</span>
                <button
                  onClick={clearLocation}
                  className="ml-1 p-0.5 hover:bg-white/20 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <span className="text-white/70 text-sm">
                within {filters.radius} miles
              </span>
            </div>
          )}

          {/* Location error */}
          {locationError && (
            <div className="mt-3 flex items-center gap-2 text-red-200 text-sm">
              <AlertCircle className="w-4 h-4" />
              {locationError}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredBakeries.length}</span>{' '}
              {filteredBakeries.length === 1 ? 'bakery' : 'bakeries'} found
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || filters.type !== 'all' || filters.specialties.length > 0 || filters.openNow
                  ? 'bg-[#C45B24] text-white border-[#C45B24]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {(filters.type !== 'all' || filters.specialties.length > 0 || filters.openNow) && (
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                  {(filters.type !== 'all' ? 1 : 0) + filters.specialties.length + (filters.openNow ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as FilterState['sortBy'] }))}
                className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C45B24] cursor-pointer"
              >
                <option value="rating">Top Rated</option>
                <option value="distance" disabled={!searchedLocation}>Nearest</option>
                <option value="newest">Newest</option>
                <option value="name">Name A-Z</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View mode */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#C45B24] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                title="Grid view"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#C45B24] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 ${viewMode === 'map' ? 'bg-[#C45B24] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                title="Map view"
              >
                <Map className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Type filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="space-y-2">
                  {(['all', 'bakery', 'farmers_market', 'home_baker'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={filters.type === type}
                        onChange={() => setFilters((f) => ({ ...f, type }))}
                        className="text-[#C45B24] focus:ring-[#C45B24]"
                      />
                      <span className="text-gray-700">
                        {type === 'all' ? 'All Types' : BAKERY_TYPE_LABELS[type]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specialties filter */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SPECIALTY_LABELS) as Specialty[]).map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => toggleSpecialty(specialty)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.specialties.includes(specialty)
                          ? 'bg-[#C45B24] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {SPECIALTY_LABELS[specialty]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other filters */}
              <div className="space-y-4">
                {/* Open now */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.openNow}
                      onChange={(e) => setFilters((f) => ({ ...f, openNow: e.target.checked }))}
                      className="rounded text-[#C45B24] focus:ring-[#C45B24]"
                    />
                    <span className="text-gray-700">Open Now</span>
                  </label>
                </div>

                {/* Radius */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Radius: {filters.radius} miles
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={filters.radius}
                    onChange={(e) => setFilters((f) => ({ ...f, radius: parseInt(e.target.value) }))}
                    className="w-full accent-[#C45B24]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 mi</span>
                    <span>100 mi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active filters */}
            {(filters.type !== 'all' || filters.specialties.length > 0 || filters.openNow) && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Active filters:</span>
                {filters.type !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#C45B24]/10 text-[#C45B24] rounded-full text-sm">
                    {BAKERY_TYPE_LABELS[filters.type]}
                    <button onClick={() => setFilters((f) => ({ ...f, type: 'all' }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.specialties.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-1 bg-[#C45B24]/10 text-[#C45B24] rounded-full text-sm">
                    {SPECIALTY_LABELS[s]}
                    <button onClick={() => toggleSpecialty(s)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.openNow && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#C45B24]/10 text-[#C45B24] rounded-full text-sm">
                    Open Now
                    <button onClick={() => setFilters((f) => ({ ...f, openNow: false }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => setFilters({ type: 'all', specialties: [], openNow: false, radius: 50, sortBy: 'rating' })}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {filteredBakeries.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bakeries found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ type: 'all', specialties: [], openNow: false, radius: 50, sortBy: 'rating' });
                clearLocation();
              }}
              className="text-[#C45B24] hover:underline font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'map' ? (
          <MapView
            bakeries={filteredBakeries}
            center={searchedLocation || userLocation || { lat: 37.7749, lng: -122.4194 }}
            onSelectBakery={setSelectedBakery}
            favorites={favorites}
          />
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredBakeries.map((bakery, index) => (
              <div key={bakery.id} style={{ animationDelay: `${index * 50}ms` }}>
                <BakeryCard
                  bakery={bakery}
                  onClick={() => setSelectedBakery(bakery)}
                  isFavorite={favorites.includes(bakery.id)}
                  onToggleFavorite={() => toggleFavorite(bakery.id)}
                  distance={getBakeryDistance(bakery)}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bakery Detail Modal */}
      {selectedBakery && (
        <BakeryModal
          bakery={selectedBakery}
          reviews={getBakeryReviews(selectedBakery.id)}
          onClose={() => setSelectedBakery(null)}
          isFavorite={favorites.includes(selectedBakery.id)}
          onToggleFavorite={() => toggleFavorite(selectedBakery.id)}
          onSubmitReview={(review) => handleSubmitReview(selectedBakery.id, review)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MapPinned className="w-6 h-6 text-[#C45B24]" />
              <span className="font-semibold text-gray-900">BreadFindr</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="/submit" className="hover:text-[#C45B24]">Add Your Bakery</a>
              <a href="/favorites" className="hover:text-[#C45B24]">My Favorites ({favorites.length})</a>
              <a href="/about" className="hover:text-[#C45B24]">About</a>
            </div>
            <p className="text-sm text-gray-500">
              Helping bread lovers find artisan bakeries since 2024
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Add Bakery Button */}
      <a
        href="/submit"
        className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-[#C45B24] text-white rounded-full shadow-lg hover:bg-[#a84d1e] transition-colors z-30"
      >
        <Plus className="w-6 h-6" />
      </a>
    </div>
  );
}
