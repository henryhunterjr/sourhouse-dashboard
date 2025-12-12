// Bakery Types
export type BakeryType = 'bakery' | 'farmers_market' | 'home_baker';

export type Specialty =
  | 'sourdough'
  | 'whole_grain'
  | 'gluten_free'
  | 'vegan'
  | 'organic'
  | 'heritage_grains'
  | 'pastries'
  | 'rye'
  | 'focaccia'
  | 'baguettes'
  | 'croissants';

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  sourdough: 'Sourdough',
  whole_grain: 'Whole Grain',
  gluten_free: 'Gluten-Free',
  vegan: 'Vegan',
  organic: 'Organic',
  heritage_grains: 'Heritage Grains',
  pastries: 'Pastries',
  rye: 'Rye',
  focaccia: 'Focaccia',
  baguettes: 'Baguettes',
  croissants: 'Croissants',
};

export const BAKERY_TYPE_LABELS: Record<BakeryType, string> = {
  bakery: 'Bakery',
  farmers_market: "Farmer's Market",
  home_baker: 'Home Baker',
};

export interface Bakery {
  id: string;
  name: string;
  type: BakeryType;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  website?: string;
  instagram?: string;
  hours?: string;
  rating: number;
  review_count: number;
  specialties: Specialty[];
  featured: boolean;
  verified: boolean;
  photos: string[];
  order_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  bakery_id: string;
  author_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface BakerySubmission {
  name: string;
  type: BakeryType;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  website?: string;
  instagram?: string;
  hours?: string;
  specialties: Specialty[];
  photos: string[];
  order_url?: string;
  submitter_email: string;
}

// Filter Types
export interface FilterState {
  type: BakeryType | 'all';
  specialties: Specialty[];
  openNow: boolean;
  radius: number;
  sortBy: 'rating' | 'distance' | 'newest' | 'name';
}

export interface SearchState {
  query: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
}

// View Types
export type ViewMode = 'grid' | 'list' | 'map';

// Geocoding
export interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
  city?: string;
  state?: string;
}

// Distance calculation
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Hours parsing utilities
export interface ParsedHours {
  [day: string]: { open: string; close: string } | null;
}

export function parseHours(hoursString: string | undefined): ParsedHours | null {
  if (!hoursString) return null;
  return null;
}

export function isOpenNow(hours: string | undefined): boolean {
  if (!hours) return false;
  // Simplified check for demo
  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay();

  // Basic parsing for common patterns
  const lowerHours = hours.toLowerCase();

  // Check if closed on Sunday (day 0)
  if (dayOfWeek === 0 && lowerHours.includes('mon-sat')) {
    return false;
  }

  // Check if within typical business hours (8am - 5pm)
  if (currentHour >= 8 && currentHour < 17) {
    if (lowerHours.includes('daily') || lowerHours.includes('mon-sun') || lowerHours.includes('open')) {
      return true;
    }
  }

  return hours.toLowerCase().includes('daily') || hours.toLowerCase().includes('open');
}

// Sample data for development
export const SAMPLE_BAKERIES: Bakery[] = [
  {
    id: '1',
    name: 'Tartine Bakery',
    type: 'bakery',
    description: 'Iconic San Francisco bakery known for their legendary country bread and morning buns. A must-visit for any bread lover.',
    address: '600 Guerrero St',
    latitude: 37.7614,
    longitude: -122.4241,
    city: 'San Francisco',
    state: 'CA',
    zip: '94110',
    phone: '(415) 487-2600',
    website: 'https://www.tartinebakery.com',
    instagram: '@tartinebakery',
    hours: 'Mon-Sun: 8am-5pm',
    rating: 4.8,
    review_count: 2847,
    specialties: ['sourdough', 'croissants', 'pastries'],
    featured: true,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Josey Baker Bread',
    type: 'bakery',
    description: 'Artisan bakery specializing in whole grain breads made with locally milled flour. Every loaf tells a story.',
    address: '1434 Harrison St',
    latitude: 37.7749,
    longitude: -122.4044,
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    phone: '(415) 513-4616',
    website: 'https://joseybakerbread.com',
    instagram: '@joseybakerbread',
    hours: 'Tue-Sat: 8am-3pm',
    rating: 4.7,
    review_count: 892,
    specialties: ['sourdough', 'whole_grain', 'organic'],
    featured: true,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800'],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Arizmendi Bakery',
    type: 'bakery',
    description: 'Worker-owned cooperative bakery famous for their sourdough pizza and variety of fresh-baked breads.',
    address: '1268 Valencia St',
    latitude: 37.7530,
    longitude: -122.4208,
    city: 'San Francisco',
    state: 'CA',
    zip: '94110',
    phone: '(415) 826-9218',
    website: 'https://arizmendibakery.com',
    hours: 'Mon-Sat: 7am-7pm, Sun: 7am-5pm',
    rating: 4.6,
    review_count: 1523,
    specialties: ['sourdough', 'focaccia', 'pastries'],
    featured: false,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800'],
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    name: 'Ferry Plaza Farmers Market',
    type: 'farmers_market',
    description: "San Francisco's premier farmers market featuring multiple artisan bread vendors every Saturday.",
    address: '1 Ferry Building',
    latitude: 37.7955,
    longitude: -122.3937,
    city: 'San Francisco',
    state: 'CA',
    zip: '94111',
    website: 'https://cuesa.org/markets/ferry-plaza-farmers-market',
    hours: 'Sat: 8am-2pm, Tue & Thu: 10am-2pm',
    rating: 4.9,
    review_count: 3421,
    specialties: ['sourdough', 'organic', 'heritage_grains'],
    featured: true,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800'],
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
  {
    id: '5',
    name: "Sarah's Home Bakery",
    type: 'home_baker',
    description: 'Passionate home baker specializing in sourdough and gluten-free options. Order online for weekend pickup.',
    address: '1500 Mission St',
    latitude: 37.7745,
    longitude: -122.4180,
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    instagram: '@sarahshomebakery',
    hours: 'By appointment - Sat pickup',
    rating: 4.9,
    review_count: 87,
    specialties: ['sourdough', 'gluten_free', 'vegan'],
    featured: false,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800'],
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
  },
  {
    id: '6',
    name: 'Neighbor Bakehouse',
    type: 'bakery',
    description: 'Dogpatch bakery known for their twice-baked almond croissants and rustic sourdough loaves.',
    address: '2343 3rd St',
    latitude: 37.7582,
    longitude: -122.3880,
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    phone: '(415) 658-7627',
    website: 'https://neighborsf.com',
    instagram: '@neighborbakehouse',
    hours: 'Wed-Sun: 8am-3pm',
    rating: 4.7,
    review_count: 645,
    specialties: ['sourdough', 'croissants', 'pastries'],
    featured: false,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800'],
    created_at: '2024-01-06T00:00:00Z',
    updated_at: '2024-01-06T00:00:00Z',
  },
  // New York bakeries
  {
    id: '7',
    name: 'Sullivan Street Bakery',
    type: 'bakery',
    description: 'Jim Lahey\'s legendary bakery known for no-knead bread that revolutionized home baking worldwide.',
    address: '533 W 47th St',
    latitude: 40.7631,
    longitude: -73.9934,
    city: 'New York',
    state: 'NY',
    zip: '10036',
    phone: '(212) 265-5580',
    website: 'https://sullivanstreetbakery.com',
    instagram: '@sullivanstreetbakery',
    hours: 'Mon-Sat: 7am-7pm, Sun: 8am-5pm',
    rating: 4.6,
    review_count: 1234,
    specialties: ['sourdough', 'focaccia', 'baguettes'],
    featured: true,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800'],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '8',
    name: 'She Wolf Bakery',
    type: 'bakery',
    description: 'Brooklyn-based artisan bakery producing some of the best naturally-leavened bread in NYC.',
    address: '38 Frost St',
    latitude: 40.7185,
    longitude: -73.9443,
    city: 'Brooklyn',
    state: 'NY',
    zip: '11211',
    website: 'https://shewolfbakery.com',
    instagram: '@shewolfbakery',
    hours: 'Tue-Sun: 8am-4pm',
    rating: 4.8,
    review_count: 567,
    specialties: ['sourdough', 'whole_grain', 'heritage_grains'],
    featured: true,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800'],
    created_at: '2024-02-02T00:00:00Z',
    updated_at: '2024-02-02T00:00:00Z',
  },
  // Chicago bakeries
  {
    id: '9',
    name: 'Publican Quality Bread',
    type: 'bakery',
    description: 'Greg Wade\'s bakery crafting exceptional artisan breads using heritage grains and traditional methods.',
    address: '1759 W North Ave',
    latitude: 41.9103,
    longitude: -87.6725,
    city: 'Chicago',
    state: 'IL',
    zip: '60622',
    phone: '(312) 733-9696',
    website: 'https://publicanqualitybread.com',
    instagram: '@publicanqualitybread',
    hours: 'Wed-Sun: 8am-4pm',
    rating: 4.7,
    review_count: 423,
    specialties: ['sourdough', 'heritage_grains', 'rye'],
    featured: true,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1534620808146-d33bb39128b2?w=800'],
    created_at: '2024-02-03T00:00:00Z',
    updated_at: '2024-02-03T00:00:00Z',
  },
  {
    id: '10',
    name: 'Hewn Bread',
    type: 'bakery',
    description: 'Evanston bakery focused on whole grain and naturally leavened breads from local and regional grains.',
    address: '810 Dempster St',
    latitude: 42.0411,
    longitude: -87.6912,
    city: 'Evanston',
    state: 'IL',
    zip: '60202',
    phone: '(847) 869-4396',
    website: 'https://hewnbread.com',
    instagram: '@hewnbread',
    hours: 'Wed-Sun: 7am-2pm',
    rating: 4.8,
    review_count: 312,
    specialties: ['sourdough', 'whole_grain', 'organic', 'heritage_grains'],
    featured: false,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1559811814-e2c57b5e02ab?w=800'],
    created_at: '2024-02-04T00:00:00Z',
    updated_at: '2024-02-04T00:00:00Z',
  },
  // Los Angeles bakeries
  {
    id: '11',
    name: 'Bub and Grandma\'s',
    type: 'bakery',
    description: 'Highland Park bakery making exceptional focaccia, country loaves, and seasonal pastries.',
    address: '5013 York Blvd',
    latitude: 34.1178,
    longitude: -118.2015,
    city: 'Los Angeles',
    state: 'CA',
    zip: '90042',
    phone: '(323) 739-6207',
    website: 'https://bubandgrandmas.com',
    instagram: '@bubandgrandmas',
    hours: 'Thu-Sun: 8am-2pm',
    rating: 4.9,
    review_count: 876,
    specialties: ['focaccia', 'sourdough', 'pastries'],
    featured: true,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=800'],
    created_at: '2024-02-05T00:00:00Z',
    updated_at: '2024-02-05T00:00:00Z',
  },
  {
    id: '12',
    name: 'Lodge Bread Company',
    type: 'bakery',
    description: 'Culver City bakery and restaurant known for their wood-fired breads and seasonal menus.',
    address: '11747 Mississippi Ave',
    latitude: 34.0244,
    longitude: -118.4128,
    city: 'Culver City',
    state: 'CA',
    zip: '90025',
    phone: '(310) 396-3896',
    website: 'https://lodgebread.com',
    instagram: '@lodgebread',
    hours: 'Tue-Sun: 8am-3pm',
    rating: 4.7,
    review_count: 1089,
    specialties: ['sourdough', 'whole_grain', 'pastries'],
    featured: false,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1600398054973-d54a1ea9e71f?w=800'],
    created_at: '2024-02-06T00:00:00Z',
    updated_at: '2024-02-06T00:00:00Z',
  },
  // Seattle bakeries
  {
    id: '13',
    name: 'Sea Wolf Bakers',
    type: 'bakery',
    description: 'Fremont neighborhood bakery known for exceptional sourdough and pastries using local ingredients.',
    address: '3621 Evanston Ave N',
    latitude: 47.6509,
    longitude: -122.3457,
    city: 'Seattle',
    state: 'WA',
    zip: '98103',
    phone: '(206) 397-3235',
    website: 'https://seawolfbakers.com',
    instagram: '@seawolfbakers',
    hours: 'Tue-Sun: 7am-3pm',
    rating: 4.7,
    review_count: 534,
    specialties: ['sourdough', 'pastries', 'croissants'],
    featured: false,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=800'],
    created_at: '2024-02-07T00:00:00Z',
    updated_at: '2024-02-07T00:00:00Z',
  },
  // Portland bakeries
  {
    id: '14',
    name: 'Tabor Bread',
    type: 'bakery',
    description: 'Award-winning Portland bakery milling their own flour and using traditional fermentation techniques.',
    address: '5051 SE Hawthorne Blvd',
    latitude: 45.5118,
    longitude: -122.6138,
    city: 'Portland',
    state: 'OR',
    zip: '97215',
    phone: '(503) 954-3411',
    website: 'https://taborbread.com',
    instagram: '@taborbread',
    hours: 'Wed-Sun: 8am-3pm',
    rating: 4.8,
    review_count: 478,
    specialties: ['sourdough', 'whole_grain', 'heritage_grains', 'organic'],
    featured: true,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'],
    created_at: '2024-02-08T00:00:00Z',
    updated_at: '2024-02-08T00:00:00Z',
  },
  // Austin bakeries
  {
    id: '15',
    name: 'Easy Tiger',
    type: 'bakery',
    description: 'Austin bake shop and beer garden known for exceptional pretzels, breads, and sausages.',
    address: '709 E 6th St',
    latitude: 30.2672,
    longitude: -97.7374,
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    phone: '(512) 614-4972',
    website: 'https://easytigeraustin.com',
    instagram: '@easytigeratx',
    hours: 'Daily: 7am-10pm',
    rating: 4.5,
    review_count: 2156,
    specialties: ['sourdough', 'rye', 'baguettes'],
    featured: false,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=800'],
    created_at: '2024-02-09T00:00:00Z',
    updated_at: '2024-02-09T00:00:00Z',
  },
  // Denver bakeries
  {
    id: '16',
    name: 'Reunion Bread Co.',
    type: 'bakery',
    description: 'Denver\'s premier artisan bread bakery using heritage grains and traditional methods.',
    address: '1101 N Broadway',
    latitude: 39.7354,
    longitude: -104.9876,
    city: 'Denver',
    state: 'CO',
    zip: '80203',
    phone: '(720) 485-9841',
    website: 'https://reunionbread.com',
    instagram: '@reunionbread',
    hours: 'Tue-Sat: 7am-2pm',
    rating: 4.8,
    review_count: 389,
    specialties: ['sourdough', 'whole_grain', 'croissants'],
    featured: false,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800'],
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z',
  },
  // Home bakers and farmers markets
  {
    id: '17',
    name: 'Brooklyn Flea Smorgasburg',
    type: 'farmers_market',
    description: 'NYC\'s largest weekly open-air food market featuring several excellent bread vendors.',
    address: '90 Kent Ave',
    latitude: 40.7218,
    longitude: -73.9614,
    city: 'Brooklyn',
    state: 'NY',
    zip: '11211',
    website: 'https://www.smorgasburg.com',
    hours: 'Sat-Sun: 11am-6pm (seasonal)',
    rating: 4.6,
    review_count: 4521,
    specialties: ['sourdough', 'pastries', 'focaccia'],
    featured: false,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800'],
    created_at: '2024-02-11T00:00:00Z',
    updated_at: '2024-02-11T00:00:00Z',
  },
  {
    id: '18',
    name: 'Maria\'s Sourdough',
    type: 'home_baker',
    description: 'Home baker specializing in naturally-leavened breads with organic flour. Pre-order online.',
    address: 'Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.2437,
    city: 'Los Angeles',
    state: 'CA',
    zip: '90012',
    instagram: '@mariassourdough',
    hours: 'Pre-order, Fri pickup',
    rating: 5.0,
    review_count: 45,
    specialties: ['sourdough', 'organic', 'vegan'],
    featured: false,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800'],
    created_at: '2024-02-12T00:00:00Z',
    updated_at: '2024-02-12T00:00:00Z',
  },
];

// Sample reviews
export const SAMPLE_REVIEWS: Review[] = [
  {
    id: '1',
    bakery_id: '1',
    author_name: 'Mike T.',
    rating: 5,
    review_text: 'The country bread is simply perfect. Worth the wait every time. The crumb is open and tangy, crust perfectly caramelized.',
    created_at: '2024-03-15T10:30:00Z',
  },
  {
    id: '2',
    bakery_id: '1',
    author_name: 'Sarah L.',
    rating: 5,
    review_text: 'Morning buns are life-changing. Get there early or they sell out!',
    created_at: '2024-03-10T09:15:00Z',
  },
  {
    id: '3',
    bakery_id: '2',
    author_name: 'James R.',
    rating: 5,
    review_text: 'Josey\'s whole grain bread is incredible. You can taste the quality of the flour. Real bread from a real person.',
    created_at: '2024-03-12T14:20:00Z',
  },
  {
    id: '4',
    bakery_id: '3',
    author_name: 'Maria G.',
    rating: 4,
    review_text: 'Love that it\'s a worker cooperative! The pizza is fantastic, and the bread variety is excellent.',
    created_at: '2024-03-08T11:45:00Z',
  },
  {
    id: '5',
    bakery_id: '4',
    author_name: 'David K.',
    rating: 5,
    review_text: 'Best farmers market in SF! So many amazing bread vendors. The Acme bread is my go-to.',
    created_at: '2024-03-01T08:30:00Z',
  },
  {
    id: '6',
    bakery_id: '7',
    author_name: 'Jennifer M.',
    rating: 5,
    review_text: 'The focaccia here is unbelievable. Jim Lahey is a genius. Worth the trip to Hell\'s Kitchen.',
    created_at: '2024-03-05T16:20:00Z',
  },
  {
    id: '7',
    bakery_id: '9',
    author_name: 'Tom B.',
    rating: 5,
    review_text: 'Greg Wade\'s bread is next level. The miche is my favorite loaf in Chicago, maybe anywhere.',
    created_at: '2024-03-18T11:00:00Z',
  },
  {
    id: '8',
    bakery_id: '11',
    author_name: 'Ashley W.',
    rating: 5,
    review_text: 'The focaccia sandwich here is perfect. Great neighborhood spot in Highland Park.',
    created_at: '2024-03-20T12:30:00Z',
  },
];
