'use client';

import { useEffect, useState, useCallback } from 'react';
import { Order, DashboardStats, MonthlyData } from '@/types';
import { 
  RefreshCw, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Calendar,
  ExternalLink,
  LogOut,
  Loader2
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
  Line
} from 'recharts';
import { format, startOfMonth, startOfWeek, isAfter, parseISO } from 'date-fns';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Calculate stats
  const stats: DashboardStats = (() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const weekStart = startOfWeek(now);

    const thisMonthOrders = orders.filter(o => isAfter(parseISO(o.date), monthStart));
    const thisWeekOrders = orders.filter(o => isAfter(parseISO(o.date), weekStart));

    return {
      totalCommission: orders.reduce((sum, o) => sum + o.commission, 0),
      totalOrders: orders.length,
      thisMonthCommission: thisMonthOrders.reduce((sum, o) => sum + o.commission, 0),
      thisMonthOrders: thisMonthOrders.length,
      thisWeekCommission: thisWeekOrders.reduce((sum, o) => sum + o.commission, 0),
      thisWeekOrders: thisWeekOrders.length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.price, 0) / orders.length : 0
    };
  })();

  // Calculate monthly data for chart
  const monthlyData: MonthlyData[] = (() => {
    const monthMap = new Map<string, { commission: number; orders: number; revenue: number }>();

    orders.forEach(order => {
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
  })();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

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
            
            {isAuthenticated ? (
              <>
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
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {!isAuthenticated && orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Connect Your Gmail</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Connect your Gmail account to automatically track your SourHouse affiliate commissions from Affiliatly notification emails.
            </p>
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors font-medium text-lg"
            >
              <ExternalLink className="w-5 h-5" />
              Connect Gmail
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

            {/* Orders Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              </div>
              
              {orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet. Click Refresh to fetch your commission data.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Order Value</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Commission (15%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {orders.slice(0, 50).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {format(parseISO(order.date), 'MMM d, yyyy h:mm a')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-amber-400">
                            {order.orderId}
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
              
              {orders.length > 50 && (
                <div className="px-6 py-3 bg-gray-800/30 border-t border-gray-800 text-center text-sm text-gray-500">
                  Showing 50 of {orders.length} orders
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
    </div>
  );
}
