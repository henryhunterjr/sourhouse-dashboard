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
