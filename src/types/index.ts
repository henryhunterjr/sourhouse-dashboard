// Product catalog with price points for identification
export type ProductType = 'goldie' | 'goldie_bundle' | 'accessory' | 'unknown';

export interface Product {
  type: ProductType;
  name: string;
  pricePoint: number;
  priceTolerance: number; // Allow small variations (shipping, discounts)
}

export const PRODUCT_CATALOG: Product[] = [
  { type: 'goldie', name: 'Goldie Starter', pricePoint: 149, priceTolerance: 10 },
  { type: 'goldie_bundle', name: 'Goldie Bundle', pricePoint: 199, priceTolerance: 15 },
];

export const ACCESSORY_THRESHOLD = 100; // Orders below this are likely accessories

export interface Order {
  id: string;
  orderId: string;
  price: number;
  commission: number;
  date: string;
  emailId: string;
  // Product identification
  product: ProductType;
  productName: string;
  needsReview: boolean; // Flag for manual review if price doesn't match known products
}

export interface DashboardStats {
  totalCommission: number;
  totalOrders: number;
  thisMonthCommission: number;
  thisMonthOrders: number;
  thisWeekCommission: number;
  thisWeekOrders: number;
  averageOrderValue: number;
}

export interface MonthlyData {
  month: string;
  commission: number;
  orders: number;
  revenue: number;
}

// Product performance analytics
export interface ProductStats {
  type: ProductType;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  percentOfOrders: number;
  percentOfRevenue: number;
}

// Growth and trend analytics
export interface GrowthMetrics {
  monthOverMonth: number; // Percentage change from last month
  averageMonthlyCommission: number;
  projectedMonthlyDeposit: number; // Based on current month pace
  bestMonth: { month: string; commission: number };
  trend: 'growing' | 'stable' | 'declining';
  ordersPerWeekAvg: number;
}

// For flagged orders that need manual review
export interface ReviewableOrder extends Order {
  reviewReason: string;
}

// ============ DATE RANGE FILTERING ============
export type DateRangePreset = 'this_month' | 'last_30_days' | 'last_90_days' | 'ytd' | 'all_time' | 'custom';

export interface DateRange {
  preset: DateRangePreset;
  startDate: string | null;  // ISO string
  endDate: string | null;    // ISO string
}

// ============ MANUAL REVIEW WORKFLOW ============
export interface OrderReview {
  orderId: string;
  status: 'pending' | 'approved' | 'dismissed';
  assignedProduct: ProductType | null;
  notes: string;
  reviewedAt: string | null;
}

// ============ DYNAMIC PRODUCT CATALOG ============
export interface CustomProduct extends Product {
  id: string;
  isCustom: boolean;
  createdAt: string;
}

export interface ProductCatalogConfig {
  products: CustomProduct[];
  accessoryThreshold: number;
}

// ============ PAYOUT TRACKING ============
export type PayoutStatus = 'pending' | 'paid';

export interface Payout {
  id: string;
  amount: number;
  date: string;              // ISO string (payout date)
  periodStart: string;       // Orders from this date
  periodEnd: string;         // Orders to this date
  orderIds: string[];        // Order IDs included
  notes: string;
}

// ============ AFFILIATE PRODUCT CATALOG ============
export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  urlSlug: string;           // e.g., "global-goldie-by-sourhouse-cooling-puck"
  imageUrl?: string;
  category: 'main' | 'accessory' | 'bundle';
  isActive: boolean;
  addedAt: string;           // ISO string - when first added to catalog
  lastUpdated: string;       // ISO string - when price/description last changed
  priceHistory: PriceChange[];
}

export interface PriceChange {
  price: number;
  date: string;              // ISO string
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;       // e.g., "15% off first order"
  isActive: boolean;
  expiresAt?: string;        // ISO string, optional
}

export interface AffiliateSettings {
  refCode: string;           // e.g., "BAKINGGREATBREAD"
  baseUrl: string;           // e.g., "https://sourhouse.co"
  commissionRate: number;    // e.g., 0.15 for 15%
  promoCodes: PromoCode[];
  lastCatalogSync: string | null;  // ISO string
}

// Default affiliate settings
export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettings = {
  refCode: '',
  baseUrl: 'https://sourhouse.co',
  commissionRate: 0.15,
  promoCodes: [],
  lastCatalogSync: null,
};

// Pre-populated SourHouse product catalog
export const DEFAULT_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'goldie',
    name: 'Goldie',
    description: 'A warm, safe home for your sourdough starter. Goldie tracks the temperature inside the glass cloche and provides gentle warmth to keep your starter in the "Goldilocks Zone" of 75-82°F. Winner of Good Housekeeping Best Kitchen Gear Award 2024.',
    price: 149,
    urlSlug: 'pages/goldie',
    category: 'main',
    isActive: true,
    addedAt: '2024-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    priceHistory: [{ price: 149, date: '2024-01-01T00:00:00.000Z' }],
  },
  {
    id: 'goldie-cooling-puck',
    name: 'Goldie + Cooling Puck',
    description: 'The award-winning Goldie sourdough starter warmer bundled with the Sourhouse Cooling Puck for temperature control in warmer environments.',
    price: 199,
    urlSlug: 'products/global-goldie-by-sourhouse-cooling-puck',
    category: 'bundle',
    isActive: true,
    addedAt: '2024-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    priceHistory: [{ price: 199, date: '2024-01-01T00:00:00.000Z' }],
  },
  {
    id: 'starter-jars',
    name: 'Sourhouse Starter Jars (Pint or Quart)',
    description: 'The easiest-to-clean sourdough starter jars. No threads where starter can collect. Soft silicone lid keeps contaminates out while letting gases escape. Very clear borosilicate glass with straight sides for easy mixing and tracking rise.',
    price: 29,
    urlSlug: 'products/global-sourhouse-starter-jars-pint-or-quart',
    category: 'accessory',
    isActive: true,
    addedAt: '2024-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    priceHistory: [{ price: 29, date: '2024-01-01T00:00:00.000Z' }],
  },
  {
    id: 'jar-bundle',
    name: 'Jar Bundle: Pint + Quart',
    description: 'Both the Pint and Quart Sourhouse Starter Jars bundled together at a discount.',
    price: 49,
    urlSlug: 'products/jar-bundle-pt-qt',
    category: 'accessory',
    isActive: true,
    addedAt: '2024-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    priceHistory: [{ price: 49, date: '2024-01-01T00:00:00.000Z' }],
  },
  {
    id: 'big-bundle',
    name: 'Big Bundle: Goldie + Puck + Pint + Quart + Adapter',
    description: 'The complete package: Award-winning Goldie, Cooling Puck, both Pint and Quart Starter Jars, plus a US/Canadian USB adapter.',
    price: 259,
    urlSlug: 'products/big-bundle-goldie-puck-pint-quart-adapter',
    category: 'bundle',
    isActive: true,
    addedAt: '2024-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    priceHistory: [{ price: 259, date: '2024-01-01T00:00:00.000Z' }],
  },
];
