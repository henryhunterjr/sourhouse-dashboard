'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  BakeryType,
  Specialty,
  SPECIALTY_LABELS,
  BAKERY_TYPE_LABELS,
} from '@/types';
import {
  MapPinned,
  ArrowLeft,
  ArrowRight,
  Check,
  Store,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Clock,
  Image,
  Loader2,
  Home,
  Leaf,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i < currentStep
                ? 'bg-green-500 text-white'
                : i === currentStep
                ? 'bg-[#C45B24] text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-12 h-1 mx-1 rounded ${
                i < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Step labels
const STEP_LABELS = [
  'Basic Info',
  'Location',
  'Contact',
  'Details',
  'Review',
];

interface FormData {
  name: string;
  type: BakeryType;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
  instagram: string;
  hours: string;
  specialties: Specialty[];
  photos: string[];
  orderUrl: string;
  submitterEmail: string;
}

const initialFormData: FormData = {
  name: '',
  type: 'bakery',
  description: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  website: '',
  instagram: '',
  hours: '',
  specialties: [],
  photos: [],
  orderUrl: '',
  submitterEmail: '',
};

export default function SubmitBakeryPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState<string | null>(null);

  // Update form data
  const updateFormData = useCallback((field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Toggle specialty
  const toggleSpecialty = useCallback((specialty: Specialty) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  }, []);

  // Geocode address for validation
  const geocodeAddress = useCallback(async () => {
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;
    setIsGeocodingAddress(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&countrycodes=us&limit=1`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.length > 0) {
        setGeocodedAddress(data[0].display_name);
        return true;
      } else {
        setErrors((prev) => ({ ...prev, address: 'Address could not be verified. Please check and try again.' }));
        return false;
      }
    } catch {
      setErrors((prev) => ({ ...prev, address: 'Failed to verify address. Please try again.' }));
      return false;
    } finally {
      setIsGeocodingAddress(false);
    }
  }, [formData.address, formData.city, formData.state, formData.zip]);

  // Validate current step
  const validateStep = useCallback(async (): Promise<boolean> => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.name.trim()) {
          newErrors.name = 'Bakery name is required';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Description is required';
        } else if (formData.description.length < 50) {
          newErrors.description = 'Description must be at least 50 characters';
        }
        break;

      case 1: // Location
        if (!formData.address.trim()) {
          newErrors.address = 'Street address is required';
        }
        if (!formData.city.trim()) {
          newErrors.city = 'City is required';
        }
        if (!formData.state.trim()) {
          newErrors.state = 'State is required';
        }
        if (!formData.zip.trim()) {
          newErrors.zip = 'ZIP code is required';
        } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) {
          newErrors.zip = 'Invalid ZIP code format';
        }

        // Geocode address if all fields are filled
        if (Object.keys(newErrors).length === 0) {
          const isValid = await geocodeAddress();
          if (!isValid) {
            return false;
          }
        }
        break;

      case 2: // Contact
        if (formData.phone && !/^[\d\s\-()]+$/.test(formData.phone)) {
          newErrors.phone = 'Invalid phone number format';
        }
        if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
          newErrors.website = 'Website must start with http:// or https://';
        }
        if (formData.instagram && !/^@?\w+$/.test(formData.instagram)) {
          newErrors.instagram = 'Invalid Instagram handle';
        }
        break;

      case 3: // Details
        if (formData.specialties.length === 0) {
          newErrors.specialties = 'Select at least one specialty';
        }
        break;

      case 4: // Review
        if (!formData.submitterEmail.trim()) {
          newErrors.submitterEmail = 'Email is required for submission notifications';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submitterEmail)) {
          newErrors.submitterEmail = 'Invalid email format';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData, geocodeAddress]);

  // Handle next step
  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  // Handle previous step
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Handle form submission
  const handleSubmit = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    setIsSubmitting(true);

    // Simulate API submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, this would be an API call to save to the database
      console.log('Submitted bakery:', formData);

      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bakery Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Tartine Bakery"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['bakery', 'farmers_market', 'home_baker'] as BakeryType[]).map((type) => {
                  const icons = {
                    bakery: Store,
                    farmers_market: Leaf,
                    home_baker: Home,
                  };
                  const Icon = icons[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateFormData('type', type)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                        formData.type === type
                          ? 'border-[#C45B24] bg-[#C45B24]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${formData.type === type ? 'text-[#C45B24]' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${formData.type === type ? 'text-[#C45B24]' : 'text-gray-700'}`}>
                        {BAKERY_TYPE_LABELS[type]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tell us about your bakery, what makes it special, and what you're known for..."
              />
              <div className="flex justify-between mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-500">{errors.description}</p>
                ) : (
                  <p className="text-sm text-gray-500">Minimum 50 characters</p>
                )}
                <span className={`text-sm ${formData.description.length < 50 ? 'text-gray-500' : 'text-green-600'}`}>
                  {formData.description.length} / 50+
                </span>
              </div>
            </div>
          </div>
        );

      case 1: // Location
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => {
                    updateFormData('address', e.target.value);
                    setGeocodedAddress(null);
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 600 Guerrero St"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => {
                    updateFormData('city', e.target.value);
                    setGeocodedAddress(null);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., San Francisco"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => {
                    updateFormData('state', e.target.value.toUpperCase().slice(0, 2));
                    setGeocodedAddress(null);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., CA"
                  maxLength={2}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => {
                  updateFormData('zip', e.target.value);
                  setGeocodedAddress(null);
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent ${
                  errors.zip ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 94110"
              />
              {errors.zip && (
                <p className="mt-1 text-sm text-red-500">{errors.zip}</p>
              )}
            </div>

            {geocodedAddress && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Address verified</p>
                  <p className="text-sm text-green-600">{geocodedAddress}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Contact
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., (415) 487-2600"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent ${
                    errors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., https://www.yourbakery.com"
                />
              </div>
              {errors.website && (
                <p className="mt-1 text-sm text-red-500">{errors.website}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Handle
              </label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => updateFormData('instagram', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent ${
                    errors.instagram ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., @yourbakery"
                />
              </div>
              {errors.instagram && (
                <p className="mt-1 text-sm text-red-500">{errors.instagram}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Online URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.orderUrl}
                  onChange={(e) => updateFormData('orderUrl', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent"
                  placeholder="e.g., https://order.yourbakery.com"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                If you accept online orders, add the link here
              </p>
            </div>
          </div>
        );

      case 3: // Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours of Operation
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.hours}
                  onChange={(e) => updateFormData('hours', e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent resize-none"
                  placeholder="e.g., Mon-Fri: 7am-5pm, Sat-Sun: 8am-4pm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties * <span className="font-normal text-gray-500">(Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(SPECIALTY_LABELS) as Specialty[]).map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => toggleSpecialty(specialty)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.specialties.includes(specialty)
                        ? 'bg-[#C45B24] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {SPECIALTY_LABELS[specialty]}
                  </button>
                ))}
              </div>
              {errors.specialties && (
                <p className="mt-2 text-sm text-red-500">{errors.specialties}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop photos here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Max 5 photos, 5MB each. JPG or PNG format.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    // In production, handle file upload
                    console.log('Files:', e.target.files);
                  }}
                />
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Browse Files
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Photo upload will be available after initial submission
              </p>
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Submission Summary</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Bakery Name</p>
                  <p className="font-medium text-gray-900">{formData.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium text-gray-900">{BAKERY_TYPE_LABELS[formData.type]}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Description</p>
                  <p className="text-gray-900">{formData.description}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">
                    {formData.address}, {formData.city}, {formData.state} {formData.zip}
                  </p>
                </div>
                {formData.phone && (
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{formData.phone}</p>
                  </div>
                )}
                {formData.website && (
                  <div>
                    <p className="text-gray-500">Website</p>
                    <p className="font-medium text-gray-900 truncate">{formData.website}</p>
                  </div>
                )}
                {formData.instagram && (
                  <div>
                    <p className="text-gray-500">Instagram</p>
                    <p className="font-medium text-gray-900">{formData.instagram}</p>
                  </div>
                )}
                {formData.hours && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Hours</p>
                    <p className="font-medium text-gray-900">{formData.hours}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-gray-500">Specialties</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.specialties.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-[#C45B24]/10 text-[#C45B24] rounded-full text-xs">
                        {SPECIALTY_LABELS[s]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Email for notifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Email Address *
              </label>
              <input
                type="email"
                value={formData.submitterEmail}
                onChange={(e) => updateFormData('submitterEmail', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#C45B24] focus:border-transparent ${
                  errors.submitterEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., you@example.com"
              />
              {errors.submitterEmail && (
                <p className="mt-1 text-sm text-red-500">{errors.submitterEmail}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                We&apos;ll notify you when your listing is approved
              </p>
            </div>

            {/* Terms */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                By submitting, you confirm that this is a legitimate business and the information provided is accurate.
                Your listing will be reviewed before being published.
              </p>
            </div>
          </div>
        );
    }
  };

  // Success state
  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Received!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for submitting <strong>{formData.name}</strong>. We&apos;ll review your listing and notify you at{' '}
            <strong>{formData.submitterEmail}</strong> once it&apos;s approved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C45B24] text-white rounded-lg font-semibold hover:bg-[#a84d1e] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to BreadFindr
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
      <header className="bg-[#C45B24] text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <MapPinned className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Add Your Bakery</h1>
                <p className="text-white/70 text-sm">Join the BreadFindr community</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Step indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={5} />

          {/* Step label */}
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            {STEP_LABELS[currentStep]}
          </h2>

          {/* Step content */}
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isGeocodingAddress}
                className="flex items-center gap-2 px-6 py-2 bg-[#C45B24] text-white rounded-lg font-semibold hover:bg-[#a84d1e] transition-colors disabled:opacity-50"
              >
                {isGeocodingAddress ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit Bakery
                  </>
                )}
              </button>
            )}
          </div>

          {/* Error message */}
          {submitStatus === 'error' && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Something went wrong. Please try again.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
