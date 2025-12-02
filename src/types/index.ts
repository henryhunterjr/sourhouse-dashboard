export interface Order {
  id: string;
  orderId: string;
  price: number;
  commission: number;
  date: string;
  emailId: string;
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
