'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Order, DashboardStats, MonthlyData, ProductStats, GrowthMetrics, ProductType,
  DateRange, DateRangePreset, OrderReview, CustomProduct, ProductCatalogConfig, Payout,
  PRODUCT_CATALOG, ACCESSORY_THRESHOLD
} from '@/types';
import {
  RefreshCw,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  ExternalLink,
  LogOut,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PieChart as PieChartIcon,
  Target,
  Download,
  Settings,
  Search,
  X,
  Plus,
  Trash2,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, startOfMonth, startOfWeek, startOfYear, isAfter, isBefore, parseISO, differenceInDays, getDaysInMonth, subDays } from 'date-fns';
import { Play } from 'lucide-react';

// Generate realistic demo data
function generateDemoOrders(): Order[] {
  const demoOrders: Order[] = [];
  const now = new Date();

  // Product distribution: ~60% Goldie Starter, ~30% Goldie Bundle, ~10% accessories
  const products = [
    { type: 'goldie' as ProductType, name: 'Goldie Starter', price: 149, weight: 60 },
    { type: 'goldie_bundle' as ProductType, name: 'Goldie Bundle', price: 199, weight: 30 },
    { type: 'accessory' as ProductType, name: 'Replacement Lid', price: 29, weight: 5 },
    { type: 'accessory' as ProductType, name: 'Bread Lame', price: 24, weight: 5 },
  ];

  // Generate orders over the past 8 months with realistic patterns
  // More orders in recent months (growth trend)
  const monthlyOrderCounts = [8, 10, 12, 15, 18, 22, 25, 28]; // orders per month, growing

  let orderNumber = 43200; // Starting order number

  for (let monthsAgo = 7; monthsAgo >= 0; monthsAgo--) {
    const orderCount = monthlyOrderCounts[7 - monthsAgo];

    for (let i = 0; i < orderCount; i++) {
      // Random day within the month
      const orderDate = new Date(now);
      orderDate.setMonth(orderDate.getMonth() - monthsAgo);
      orderDate.setDate(Math.floor(Math.random() * 28) + 1);
      orderDate.setHours(Math.floor(Math.random() * 12) + 8); // 8am - 8pm
      orderDate.setMinutes(Math.floor(Math.random() * 60));

      // Skip future dates
      if (orderDate > now) continue;

      // Weighted random product selection
      const rand = Math.random() * 100;
      let cumWeight = 0;
      let selectedProduct = products[0];
      for (const product of products) {
        cumWeight += product.weight;
        if (rand < cumWeight) {
          selectedProduct = product;
          break;
        }
      }

      // Slight price variations (shipping, discounts)
      const priceVariation = (Math.random() - 0.5) * 10;
      const finalPrice = Math.round(selectedProduct.price + priceVariation);

      demoOrders.push({
        id: `demo-${orderNumber}`,
        orderId: `SH${orderNumber}`,
        price: finalPrice,
        commission: finalPrice * 0.15,
        date: orderDate.toISOString(),
        emailId: `demo-email-${orderNumber}`,
        product: selectedProduct.type,
        productName: selectedProduct.name,
        needsReview: selectedProduct.type === 'unknown' || Math.abs(finalPrice - selectedProduct.price) > 15,
      });

      orderNumber++;
    }
  }

  // Sort by date descending (newest first)
  return demoOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

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

// Date range preset labels
const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  this_month: 'This Month',
  last_30_days: 'Last 30 Days',
  last_90_days: 'Last 90 Days',
  ytd: 'Year to Date',
  all_time: 'All Time',
  custom: 'Custom'
};

// Get date bounds from a date range
function getDateRangeBounds(range: DateRange): { start: Date | null; end: Date | null } {
  const now = new Date();
  switch (range.preset) {
    case 'this_month':
      return { start: startOfMonth(now), end: now };
    case 'last_30_days':
      return { start: subDays(now, 30), end: now };
    case 'last_90_days':
      return { start: subDays(now, 90), end: now };
    case 'ytd':
      return { start: startOfYear(now), end: now };
    case 'all_time':
      return { start: null, end: null };
    case 'custom':
      return {
        start: range.startDate ? parseISO(range.startDate) : null,
        end: range.endDate ? parseISO(range.endDate) : null
      };
  }
}

// Product colors for charts
const PRODUCT_COLORS: Record<ProductType, string> = {
  goldie: '#F59E0B',
  goldie_bundle: '#10B981',
  accessory: '#8B5CF6',
  unknown: '#6B7280'
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Demo Mode
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Feature 1: Date Range Filtering
  const [dateRange, setDateRange] = useState<DateRange>({
    preset: 'all_time',
    startDate: null,
    endDate: null
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Feature 3 & 4: Search, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState<ProductType | 'all'>('all');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'needs_review' | 'reviewed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(50);

  // Feature 5: Manual Review Workflow
  const [reviews, setReviews] = useLocalStorage<Record<string, OrderReview>>('sourhouse_reviews', {});
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<ProductType>('unknown');
  const [reviewNotes, setReviewNotes] = useState('');

  // Feature 6: Dynamic Product Catalog
  const [productCatalog, setProductCatalog] = useLocalStorage<ProductCatalogConfig>(
    'sourhouse_product_catalog',
    {
      products: PRODUCT_CATALOG.map((p, i) => ({
        ...p,
        id: `default-${i}`,
        isCustom: false,
        createdAt: ''
      })),
      accessoryThreshold: ACCESSORY_THRESHOLD
    }
  );
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Feature 7: Payout Tracking
  const [payouts, setPayouts] = useLocalStorage<Payout[]>('sourhouse_payouts', []);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutDate, setPayoutDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [payoutPeriodStart, setPayoutPeriodStart] = useState('');
  const [payoutPeriodEnd, setPayoutPeriodEnd] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Check for tokens on mount
  useEffect(() => {
    // Check URL for tokens (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const tokensParam = urlParams.get('tokens');
    
    if (tokensParam) {
      try {
        const tokens = JSON.parse(tokensParam);
        localStorage.setItem('gmail_tokens', JSON.stringify(tokens));
        setIsAuthenticated(true);
        // Clean up URL
        window.history.replaceState({}, '', '/');
      } catch (e) {
        console.error('Error parsing tokens:', e);
      }
    }

    // Check localStorage for existing tokens
    const storedTokens = localStorage.getItem('gmail_tokens');
    if (storedTokens) {
      setIsAuthenticated(true);
    }

    // Load cached orders
    const cachedOrders = localStorage.getItem('sourhouse_orders');
    if (cachedOrders) {
      const parsed = JSON.parse(cachedOrders);
      setOrders(parsed.orders || []);
      setLastUpdated(parsed.lastUpdated);
    }

    // Check for error
    const errorParam = urlParams.get('error');
    if (errorParam) {
      setError('Authentication failed. Please try again.');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/gmail');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting:', error);
      setError('Failed to connect to Gmail');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('gmail_tokens');
    localStorage.removeItem('sourhouse_orders');
    setIsAuthenticated(false);
    setOrders([]);
    setLastUpdated(null);
    setIsDemoMode(false);
  };

  // Demo Mode handlers
  const handleEnterDemoMode = () => {
    const demoOrders = generateDemoOrders();
    setOrders(demoOrders);
    setIsDemoMode(true);
    setLastUpdated(new Date().toISOString());
  };

  const handleExitDemoMode = () => {
    setOrders([]);
    setIsDemoMode(false);
    setLastUpdated(null);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tokensStr = localStorage.getItem('gmail_tokens');
      if (!tokensStr) {
        setError('Not authenticated. Please connect Gmail first.');
        setIsLoading(false);
        return;
      }

      const tokens = JSON.parse(tokensStr);

      const response = await fetch('/api/emails/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token
        })
      });

      const data = await response.json();

      if (data.error) {
        if (response.status === 401) {
          // Token expired, need to re-auth
          handleDisconnect();
          setError('Session expired. Please reconnect Gmail.');
        } else {
          setError(data.error);
        }
        setIsLoading(false);
        return;
      }

      setOrders(data.orders);
      setLastUpdated(data.lastUpdated);

      // Cache the data
      localStorage.setItem('sourhouse_orders', JSON.stringify({
        orders: data.orders,
        lastUpdated: data.lastUpdated
      }));
    } catch (error) {
      console.error('Error refreshing:', error);
      setError('Failed to fetch emails');
    }

    setIsLoading(false);
  };

  // Filter orders by date range
  const filteredByDateOrders = useMemo(() => {
    const { start, end } = getDateRangeBounds(dateRange);
    return orders.filter(order => {
      const orderDate = parseISO(order.date);
      if (start && isBefore(orderDate, start)) return false;
      if (end && isAfter(orderDate, end)) return false;
      return true;
    });
  }, [orders, dateRange]);

  // Apply search and filters for display
  const displayedOrders = useMemo(() => {
    return filteredByDateOrders.filter(order => {
      // Search filter
      if (searchQuery && !order.orderId.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Product filter
      if (productFilter !== 'all' && order.product !== productFilter) {
        return false;
      }
      // Review filter
      const isReviewed = reviews[order.orderId]?.status === 'approved' || reviews[order.orderId]?.status === 'dismissed';
      if (reviewFilter === 'needs_review' && (!order.needsReview || isReviewed)) return false;
      if (reviewFilter === 'reviewed' && !isReviewed) return false;
      return true;
    });
  }, [filteredByDateOrders, searchQuery, productFilter, reviewFilter, reviews]);

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedOrders.slice(start, start + pageSize);
  }, [displayedOrders, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(displayedOrders.length / pageSize));

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, productFilter, reviewFilter, dateRange]);

  // Orders needing review (filtered, excluding already reviewed)
  const ordersNeedingReview = useMemo(() => {
    return filteredByDateOrders.filter(o =>
      o.needsReview &&
      (!reviews[o.orderId] || reviews[o.orderId].status === 'pending')
    );
  }, [filteredByDateOrders, reviews]);

  // Calculate stats (using filtered orders)
  const stats: DashboardStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const weekStart = startOfWeek(now);

    const thisMonthOrders = filteredByDateOrders.filter(o => isAfter(parseISO(o.date), monthStart));
    const thisWeekOrders = filteredByDateOrders.filter(o => isAfter(parseISO(o.date), weekStart));

    return {
      totalCommission: filteredByDateOrders.reduce((sum, o) => sum + o.commission, 0),
      totalOrders: filteredByDateOrders.length,
      thisMonthCommission: thisMonthOrders.reduce((sum, o) => sum + o.commission, 0),
      thisMonthOrders: thisMonthOrders.length,
      thisWeekCommission: thisWeekOrders.reduce((sum, o) => sum + o.commission, 0),
      thisWeekOrders: thisWeekOrders.length,
      averageOrderValue: filteredByDateOrders.length > 0 ? filteredByDateOrders.reduce((sum, o) => sum + o.price, 0) / filteredByDateOrders.length : 0
    };
  }, [filteredByDateOrders]);

  // Calculate product stats for analytics
  const productStats: ProductStats[] = useMemo(() => {
    const productMap = new Map<ProductType, { orders: number; revenue: number; commission: number }>();

    filteredByDateOrders.forEach(order => {
      const existing = productMap.get(order.product) || { orders: 0, revenue: 0, commission: 0 };
      productMap.set(order.product, {
        orders: existing.orders + 1,
        revenue: existing.revenue + order.price,
        commission: existing.commission + order.commission
      });
    });

    const totalOrders = filteredByDateOrders.length;
    const totalRevenue = filteredByDateOrders.reduce((sum, o) => sum + o.price, 0);

    const productNames: Record<ProductType, string> = {
      goldie: 'Goldie Starter',
      goldie_bundle: 'Goldie Bundle',
      accessory: 'Accessories/Lids',
      unknown: 'Unknown'
    };

    return Array.from(productMap.entries())
      .map(([type, data]) => ({
        type,
        name: productNames[type],
        totalOrders: data.orders,
        totalRevenue: data.revenue,
        totalCommission: data.commission,
        percentOfOrders: totalOrders > 0 ? (data.orders / totalOrders) * 100 : 0,
        percentOfRevenue: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredByDateOrders]);

  // Calculate growth metrics (always from all orders for accurate trends)
  const growthMetrics: GrowthMetrics = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const dayOfMonth = now.getDate();
    const daysInCurrentMonth = getDaysInMonth(now);

    // This month's commission
    const thisMonthOrders = orders.filter(o => isAfter(parseISO(o.date), monthStart));
    const thisMonthCommission = thisMonthOrders.reduce((sum, o) => sum + o.commission, 0);

    // Last month's commission
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthOrders = orders.filter(o => {
      const date = parseISO(o.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    const lastMonthCommission = lastMonthOrders.reduce((sum, o) => sum + o.commission, 0);

    // Month over month growth
    const monthOverMonth = lastMonthCommission > 0
      ? ((thisMonthCommission - lastMonthCommission) / lastMonthCommission) * 100
      : thisMonthCommission > 0 ? 100 : 0;

    // Projected deposit (extrapolate current month pace)
    const dailyRate = dayOfMonth > 0 ? thisMonthCommission / dayOfMonth : 0;
    const projectedMonthlyDeposit = dailyRate * daysInCurrentMonth;

    // Find best month
    const monthlyTotals = new Map<string, number>();
    orders.forEach(order => {
      const month = format(parseISO(order.date), 'MMM yyyy');
      monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + order.commission);
    });
    let bestMonth = { month: 'N/A', commission: 0 };
    monthlyTotals.forEach((commission, month) => {
      if (commission > bestMonth.commission) {
        bestMonth = { month, commission };
      }
    });

    // Average monthly commission
    const monthCount = monthlyTotals.size || 1;
    const averageMonthlyCommission = orders.reduce((sum, o) => sum + o.commission, 0) / monthCount;

    // Calculate trend (compare last 3 months)
    const recentMonths = Array.from(monthlyTotals.entries()).slice(-3);
    let trend: 'growing' | 'stable' | 'declining' = 'stable';
    if (recentMonths.length >= 2) {
      const recent = recentMonths[recentMonths.length - 1]?.[1] || 0;
      const previous = recentMonths[recentMonths.length - 2]?.[1] || 0;
      if (recent > previous * 1.1) trend = 'growing';
      else if (recent < previous * 0.9) trend = 'declining';
    }

    // Orders per week average
    const oldestOrder = orders[orders.length - 1];
    const newestOrder = orders[0];
    let ordersPerWeekAvg = 0;
    if (oldestOrder && newestOrder) {
      const weeks = Math.max(1, differenceInDays(parseISO(newestOrder.date), parseISO(oldestOrder.date)) / 7);
      ordersPerWeekAvg = orders.length / weeks;
    }

    return {
      monthOverMonth,
      averageMonthlyCommission,
      projectedMonthlyDeposit,
      bestMonth,
      trend,
      ordersPerWeekAvg
    };
  }, [orders]);

  // Calculate monthly data for chart (using filtered orders)
  const monthlyData: MonthlyData[] = useMemo(() => {
    const monthMap = new Map<string, { commission: number; orders: number; revenue: number }>();

    filteredByDateOrders.forEach(order => {
      const month = format(parseISO(order.date), 'MMM yyyy');
      const existing = monthMap.get(month) || { commission: 0, orders: 0, revenue: 0 };
      monthMap.set(month, {
        commission: existing.commission + order.commission,
        orders: existing.orders + 1,
        revenue: existing.revenue + order.price
      });
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .reverse();
  }, [filteredByDateOrders]);

  // Orders in payout period (for payout modal preview)
  const ordersInPayoutPeriod = useMemo(() => {
    if (!payoutPeriodStart || !payoutPeriodEnd) return [];
    const start = parseISO(payoutPeriodStart);
    const end = parseISO(payoutPeriodEnd);
    return orders.filter(o => {
      const date = parseISO(o.date);
      return date >= start && date <= end;
    });
  }, [orders, payoutPeriodStart, payoutPeriodEnd]);

  const payoutPeriodCommission = ordersInPayoutPeriod.reduce((sum, o) => sum + o.commission, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handler: Change date range preset
  const handleDateRangeChange = useCallback((preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setDateRange({ preset, startDate: null, endDate: null });
    }
  }, []);

  // Handler: Apply custom date range
  const handleApplyCustomDateRange = useCallback(() => {
    setDateRange({
      preset: 'custom',
      startDate: customStartDate || null,
      endDate: customEndDate || null
    });
    setShowCustomDatePicker(false);
  }, [customStartDate, customEndDate]);

  // Handler: Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Date', 'Order ID', 'Product', 'Price', 'Commission', 'Status'];
    const rows = displayedOrders.map(order => [
      format(parseISO(order.date), 'yyyy-MM-dd'),
      order.orderId,
      order.productName,
      order.price.toFixed(2),
      order.commission.toFixed(2),
      order.needsReview ? 'Needs Review' : 'Confirmed'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const rangeStr = dateRange.preset === 'all_time'
      ? 'all-time'
      : dateRange.preset === 'custom'
        ? `${dateRange.startDate || 'start'}_to_${dateRange.endDate || 'end'}`
        : dateRange.preset;
    const filename = `sourhouse-commissions-${rangeStr}-${format(new Date(), 'yyyy-MM-dd')}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, [displayedOrders, dateRange]);

  // Handler: Open review modal
  const handleOpenReviewModal = useCallback((order: Order) => {
    setSelectedOrderForReview(order);
    setReviewProduct(order.product);
    setReviewNotes('');
    setShowReviewModal(true);
  }, []);

  // Handler: Approve review
  const handleApproveReview = useCallback(() => {
    if (!selectedOrderForReview) return;

    const review: OrderReview = {
      orderId: selectedOrderForReview.orderId,
      status: 'approved',
      assignedProduct: reviewProduct,
      notes: reviewNotes,
      reviewedAt: new Date().toISOString()
    };

    setReviews(prev => ({ ...prev, [selectedOrderForReview.orderId]: review }));
    setShowReviewModal(false);
    setSelectedOrderForReview(null);
  }, [selectedOrderForReview, reviewProduct, reviewNotes, setReviews]);

  // Handler: Dismiss review
  const handleDismissReview = useCallback(() => {
    if (!selectedOrderForReview) return;

    const review: OrderReview = {
      orderId: selectedOrderForReview.orderId,
      status: 'dismissed',
      assignedProduct: null,
      notes: reviewNotes,
      reviewedAt: new Date().toISOString()
    };

    setReviews(prev => ({ ...prev, [selectedOrderForReview.orderId]: review }));
    setShowReviewModal(false);
    setSelectedOrderForReview(null);
  }, [selectedOrderForReview, reviewNotes, setReviews]);

  // Handler: Add new product to catalog
  const handleAddProduct = useCallback(() => {
    const newProduct: CustomProduct = {
      id: `custom-${Date.now()}`,
      type: 'unknown',
      name: 'New Product',
      pricePoint: 0,
      priceTolerance: 10,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    setProductCatalog(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  }, [setProductCatalog]);

  // Handler: Update product in catalog
  const handleUpdateProduct = useCallback((id: string, field: keyof CustomProduct, value: string | number) => {
    setProductCatalog(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  }, [setProductCatalog]);

  // Handler: Remove product from catalog
  const handleRemoveProduct = useCallback((id: string) => {
    setProductCatalog(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  }, [setProductCatalog]);

  // Handler: Record payout
  const handleRecordPayout = useCallback(() => {
    if (!payoutAmount || !payoutPeriodStart || !payoutPeriodEnd) return;

    const newPayout: Payout = {
      id: `payout-${Date.now()}`,
      amount: parseFloat(payoutAmount),
      date: payoutDate,
      periodStart: payoutPeriodStart,
      periodEnd: payoutPeriodEnd,
      orderIds: ordersInPayoutPeriod.map(o => o.orderId),
      notes: payoutNotes
    };

    setPayouts(prev => [newPayout, ...prev]);
    setShowPayoutModal(false);
    setPayoutAmount('');
    setPayoutPeriodStart('');
    setPayoutPeriodEnd('');
    setPayoutNotes('');
  }, [payoutAmount, payoutDate, payoutPeriodStart, payoutPeriodEnd, ordersInPayoutPeriod, payoutNotes, setPayouts]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SourHouse Commission Tracker</h1>
              <p className="text-sm text-gray-400">HBK23 Affiliate Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {format(parseISO(lastUpdated), 'MMM d, h:mm a')}
              </span>
            )}
            
            {isAuthenticated || isDemoMode ? (
              <>
                {!isDemoMode && (
                  <button
                    onClick={() => setShowPayoutModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium"
                  >
                    <Wallet className="w-4 h-4" />
                    Record Payout
                  </button>
                )}
                <button
                  onClick={handleExportCSV}
                  disabled={displayedOrders.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                {!isDemoMode && (
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white rounded-lg transition-colors font-medium"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {isLoading ? 'Fetching...' : 'Refresh'}
                  </button>
                )}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {isDemoMode ? (
                  <button
                    onClick={handleExitDemoMode}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    Exit Demo
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Connect Gmail
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-blue-200 font-medium">Demo Mode Active</p>
                  <p className="text-blue-300/70 text-sm">
                    You&apos;re viewing sample data. Connect Gmail to see your real commission data.
                  </p>
                </div>
              </div>
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Connect Gmail
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {!isAuthenticated && !isDemoMode && orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Connect Your Gmail</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Connect your Gmail account to automatically track your SourHouse affiliate commissions from Affiliatly notification emails.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors font-medium text-lg"
              >
                <ExternalLink className="w-5 h-5" />
                Connect Gmail
              </button>
              <button
                onClick={handleEnterDemoMode}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-lg border border-gray-600"
              >
                <Play className="w-5 h-5" />
                View Demo
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              Want to see how it works first? Click &quot;View Demo&quot; to explore with sample data.
            </p>
          </div>
        ) : (
          <>
            {/* Date Range Filter */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-gray-400 text-sm font-medium">Date Range:</span>
              <div className="flex flex-wrap gap-2">
                {(['all_time', 'this_month', 'last_30_days', 'last_90_days', 'ytd'] as DateRangePreset[]).map(preset => (
                  <button
                    key={preset}
                    onClick={() => handleDateRangeChange(preset)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      dateRange.preset === preset
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {DATE_RANGE_LABELS[preset]}
                  </button>
                ))}
                <button
                  onClick={() => setShowCustomDatePicker(true)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    dateRange.preset === 'custom'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Custom
                </button>
              </div>
              {dateRange.preset !== 'all_time' && (
                <span className="text-gray-500 text-sm ml-2">
                  ({filteredByDateOrders.length} of {orders.length} orders)
                </span>
              )}
            </div>

            {/* Stats Cards - Row 1: Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">All-Time Commission</span>
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalCommission)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.totalOrders} orders</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">This Month</span>
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.thisMonthCommission)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.thisMonthOrders} orders</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">Projected Deposit</span>
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(growthMetrics.projectedMonthlyDeposit)}</p>
                <p className="text-sm text-gray-500 mt-1">Based on current pace</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">Growth Trend</span>
                  {growthMetrics.trend === 'growing' ? (
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  ) : growthMetrics.trend === 'declining' ? (
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                  ) : (
                    <Minus className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <p className={`text-3xl font-bold ${
                  growthMetrics.monthOverMonth > 0 ? 'text-green-400' :
                  growthMetrics.monthOverMonth < 0 ? 'text-red-400' : 'text-white'
                }`}>
                  {growthMetrics.monthOverMonth > 0 ? '+' : ''}{growthMetrics.monthOverMonth.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">vs last month</p>
              </div>
            </div>

            {/* Stats Cards - Row 2: Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">This Week</span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.thisWeekCommission)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.thisWeekOrders} orders</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">Avg Order Value</span>
                  <Package className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.averageOrderValue)}</p>
                <p className="text-sm text-gray-500 mt-1">15% commission rate</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">Best Month</span>
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(growthMetrics.bestMonth.commission)}</p>
                <p className="text-sm text-gray-500 mt-1">{growthMetrics.bestMonth.month}</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">Orders/Week Avg</span>
                  <PieChartIcon className="w-5 h-5 text-cyan-500" />
                </div>
                <p className="text-3xl font-bold text-white">{growthMetrics.ordersPerWeekAvg.toFixed(1)}</p>
                <p className="text-sm text-gray-500 mt-1">Avg {formatCurrency(growthMetrics.averageMonthlyCommission)}/mo</p>
              </div>
            </div>

            {/* Charts */}
            {monthlyData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Monthly Commission</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `$${v}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                          labelStyle={{ color: '#F3F4F6' }}
                          formatter={(value: number) => [formatCurrency(value), 'Commission']}
                        />
                        <Bar dataKey="commission" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Order Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                          labelStyle={{ color: '#F3F4F6' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ fill: '#10B981', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Product Performance Section */}
            {productStats.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Product Breakdown Pie Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Product Mix</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productStats.map(p => ({ name: p.name, value: p.totalOrders, type: p.type }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {productStats.map((entry) => (
                            <Cell key={entry.type} fill={PRODUCT_COLORS[entry.type]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                          formatter={(value: number, name: string) => [value, `${name} Orders`]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Product Stats Table */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Product Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          <th className="pb-3">Product</th>
                          <th className="pb-3 text-right">Orders</th>
                          <th className="pb-3 text-right">Revenue</th>
                          <th className="pb-3 text-right">Commission</th>
                          <th className="pb-3 text-right">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {productStats.map((product) => (
                          <tr key={product.type} className="hover:bg-gray-800/30">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: PRODUCT_COLORS[product.type] }}
                                />
                                <span className="text-white font-medium">{product.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-right text-gray-300">{product.totalOrders}</td>
                            <td className="py-3 text-right text-gray-300">{formatCurrency(product.totalRevenue)}</td>
                            <td className="py-3 text-right text-green-400 font-medium">{formatCurrency(product.totalCommission)}</td>
                            <td className="py-3 text-right text-gray-400">{product.percentOfOrders.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Needing Review Alert */}
            {ordersNeedingReview.length > 0 && (
              <div className="mb-8 p-4 bg-amber-900/30 border border-amber-700 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-amber-200 font-semibold mb-2">
                      {ordersNeedingReview.length} Order{ordersNeedingReview.length !== 1 ? 's' : ''} Need Review
                    </h3>
                    <p className="text-amber-300/70 text-sm mb-3">
                      These orders have prices that don&apos;t match known products. They may be bundles, sale prices, or new products.
                    </p>
                    <div className="space-y-2">
                      {ordersNeedingReview.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between gap-4 text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-amber-400 font-mono">{order.orderId}</span>
                            <span className="text-amber-300">{formatCurrency(order.price)}</span>
                            <span className="text-amber-300/60">{format(parseISO(order.date), 'MMM d, yyyy')}</span>
                          </div>
                          <button
                            onClick={() => handleOpenReviewModal(order)}
                            className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                      {ordersNeedingReview.length > 5 && (
                        <p className="text-amber-300/60 text-sm">...and {ordersNeedingReview.length - 5} more</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payout History */}
            {payouts.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="text-lg font-semibold text-white">Payout History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Orders</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {payouts.map(payout => (
                        <tr key={payout.id} className="hover:bg-gray-800/30">
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {format(parseISO(payout.date), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {format(parseISO(payout.periodStart), 'MMM d')} - {format(parseISO(payout.periodEnd), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300 text-right">
                            {payout.orderIds.length}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-400 font-medium text-right">
                            {formatCurrency(payout.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-white">Orders</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search order ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 w-48 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    {/* Product Filter */}
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value as ProductType | 'all')}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Products</option>
                      <option value="goldie">Goldie Starter</option>
                      <option value="goldie_bundle">Goldie Bundle</option>
                      <option value="accessory">Accessories</option>
                      <option value="unknown">Unknown</option>
                    </select>
                    {/* Review Status Filter */}
                    <select
                      value={reviewFilter}
                      onChange={(e) => setReviewFilter(e.target.value as typeof reviewFilter)}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Status</option>
                      <option value="needs_review">Needs Review</option>
                      <option value="reviewed">Reviewed</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {displayedOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{orders.length === 0 ? 'No orders yet. Click Refresh to fetch your commission data.' : 'No orders match your filters.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Order Value</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Commission (15%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {paginatedOrders.map((order) => (
                        <tr key={order.id} className={`hover:bg-gray-800/30 transition-colors ${order.needsReview && !reviews[order.orderId] ? 'bg-amber-900/10' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {format(parseISO(order.date), 'MMM d, yyyy h:mm a')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-amber-400">
                            {order.orderId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: PRODUCT_COLORS[order.product] }}
                              />
                              <span className={order.needsReview && !reviews[order.orderId] ? 'text-amber-400' : 'text-gray-300'}>
                                {order.productName}
                              </span>
                              {order.needsReview && !reviews[order.orderId] && (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              )}
                              {reviews[order.orderId]?.status === 'approved' && (
                                <span className="text-xs text-green-500">Reviewed</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                            {formatCurrency(order.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400 text-right">
                            {formatCurrency(order.commission)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {displayedOrders.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value) as 25 | 50 | 100)}
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>per page</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {Math.min((currentPage - 1) * pageSize + 1, displayedOrders.length)}-{Math.min(currentPage * pageSize, displayedOrders.length)} of {displayedOrders.length}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-white"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="px-3 py-2 text-sm text-white">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-white"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>SourHouse Commission Tracker for Baking Great Bread at Home</p>
          <p className="mt-1">Affiliate Code: HBK23 • 15% Commission Rate</p>
        </div>
      </footer>

      {/* Custom Date Range Modal */}
      {showCustomDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Custom Date Range</h3>
              <button onClick={() => setShowCustomDatePicker(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleApplyCustomDateRange}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg"
              >
                Apply
              </button>
              <button
                onClick={() => setShowCustomDatePicker(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrderForReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Review Order</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Order ID</label>
                  <p className="text-amber-400 font-mono">{selectedOrderForReview.orderId}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Price</label>
                  <p className="text-white">{formatCurrency(selectedOrderForReview.price)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Date</label>
                <p className="text-gray-300">{format(parseISO(selectedOrderForReview.date), 'MMM d, yyyy h:mm a')}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Assign Product</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={reviewProduct}
                  onChange={(e) => setReviewProduct(e.target.value as ProductType)}
                >
                  <option value="goldie">Goldie Starter ($149)</option>
                  <option value="goldie_bundle">Goldie Bundle ($199)</option>
                  <option value="accessory">Accessory</option>
                  <option value="unknown">Unknown/Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Notes</label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-20"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Bundle deal, sale price, etc..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleApproveReview}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
              >
                Approve
              </button>
              <button
                onClick={handleDismissReview}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Dismiss
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal (Product Catalog) */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Product Catalog Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-gray-400 uppercase">Products</h4>
              {productCatalog.products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <input
                      value={product.name}
                      onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                      className="bg-transparent text-white font-medium w-full focus:outline-none"
                      placeholder="Product name"
                    />
                  </div>
                  <div className="w-24">
                    <div className="text-xs text-gray-500 mb-1">Price</div>
                    <input
                      type="number"
                      value={product.pricePoint}
                      onChange={(e) => handleUpdateProduct(product.id, 'pricePoint', Number(e.target.value))}
                      className="bg-gray-700 text-white px-2 py-1 rounded w-full text-right"
                    />
                  </div>
                  <div className="w-20">
                    <div className="text-xs text-gray-500 mb-1">Tolerance</div>
                    <input
                      type="number"
                      value={product.priceTolerance}
                      onChange={(e) => handleUpdateProduct(product.id, 'priceTolerance', Number(e.target.value))}
                      className="bg-gray-700 text-white px-2 py-1 rounded w-full text-right"
                    />
                  </div>
                  {product.isCustom && (
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <label className="text-sm text-gray-400 block mb-2">
                Accessory Threshold (orders below this price are accessories)
              </label>
              <input
                type="number"
                value={productCatalog.accessoryThreshold}
                onChange={(e) => setProductCatalog(prev => ({ ...prev, accessoryThreshold: Number(e.target.value) }))}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg w-32"
              />
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Note: Changes are saved automatically. Product catalog is used for new orders only.
            </p>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Record Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Payout Amount</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Payout Date</label>
                <input
                  type="date"
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Period Start</label>
                  <input
                    type="date"
                    value={payoutPeriodStart}
                    onChange={(e) => setPayoutPeriodStart(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Period End</label>
                  <input
                    type="date"
                    value={payoutPeriodEnd}
                    onChange={(e) => setPayoutPeriodEnd(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Notes (optional)</label>
                <textarea
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-20"
                  placeholder="Monthly payout for November..."
                />
              </div>

              {payoutPeriodStart && payoutPeriodEnd && (
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">
                    This will mark <span className="text-white font-medium">{ordersInPayoutPeriod.length}</span> orders
                    totaling <span className="text-green-400 font-medium">{formatCurrency(payoutPeriodCommission)}</span> as paid.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRecordPayout}
                disabled={!payoutAmount || !payoutPeriodStart || !payoutPeriodEnd}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Record Payout
              </button>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
