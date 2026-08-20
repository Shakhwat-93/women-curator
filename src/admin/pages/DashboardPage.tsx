import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Sparkles,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { orderService, productService } from '../../lib/api';
import { Order, Product } from '../../types';
import { AdminCardSkeleton } from '../components/AdminSkeleton';
import { useAdminAuth } from '../context/AdminAuthContext';

export const DashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const { user } = useAdminAuth();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [orderList, productList] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts()
      ]);
      setOrders(orderList);
      setProducts(productList);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders by date range
  const filteredOrders = orders.filter(o => {
    if (!o.created_at || dateRange === 'all') return true;
    const orderDate = new Date(o.created_at).getTime();
    const now = Date.now();
    if (dateRange === 'today') return now - orderDate < 24 * 60 * 60 * 1000;
    if (dateRange === '7days') return now - orderDate < 7 * 24 * 60 * 60 * 1000;
    if (dateRange === '30days') return now - orderDate < 30 * 24 * 60 * 60 * 1000;
    return true;
  });

  // Calculate Metrics
  const totalSales = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
  const confirmedOrders = filteredOrders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;
  const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;
  const activeProducts = products.filter(p => p.status !== 'archived').length;

  const metrics = [
    {
      title: 'Total Revenue',
      value: `৳${totalSales.toLocaleString()}`,
      subtitle: `${filteredOrders.length} orders`,
      icon: TrendingUp,
      accent: 'text-curator-coral bg-curator-coral-light'
    },
    {
      title: 'Pending',
      value: pendingOrders.toString(),
      subtitle: 'Needs review',
      icon: Clock,
      accent: 'text-amber-600 bg-amber-50'
    },
    {
      title: 'Confirmed',
      value: confirmedOrders.toString(),
      subtitle: 'Packaging',
      icon: CheckCircle2,
      accent: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Delivered',
      value: deliveredOrders.toString(),
      subtitle: 'Completed',
      icon: Truck,
      accent: 'text-emerald-600 bg-emerald-50'
    },
    {
      title: 'Active Drops',
      value: activeProducts.toString(),
      subtitle: 'Published',
      icon: Package,
      accent: 'text-purple-600 bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Mobile Greeting & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Store Performance</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Welcome, {user?.full_name?.split(' ')[0] || 'Owner'}
          </h1>
          <p className="text-xs text-curator-muted font-sans mt-0.5">
            Here is what's happening in your Women Curator store today.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center bg-white rounded-full p-1 border border-curator-border shadow-xs text-xs font-semibold flex-shrink-0">
            {(['today', '7days', '30days', 'all'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setDateRange(tab)}
                className={`px-3 py-1.5 rounded-full capitalize transition-all whitespace-nowrap min-h-[32px] ${
                  dateRange === tab
                    ? 'bg-curator-coral text-white shadow-xs font-bold'
                    : 'text-curator-muted hover:text-curator-charcoal'
                }`}
              >
                {tab === '7days' ? '7 Days' : tab === '30days' ? '30 Days' : tab}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            title="Refresh Data"
            aria-label="Refresh Data"
            className="p-2 sm:p-2.5 rounded-full bg-white border border-curator-border text-curator-charcoal hover:text-curator-coral shadow-xs transition-all flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards — Responsive Grid & Mobile Touch Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <AdminCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 border border-curator-border shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${
                idx === 0 ? 'col-span-2 sm:col-span-1 bg-gradient-to-br from-white via-white to-curator-surface-peach/40' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-curator-muted font-mono">
                  {m.title}
                </span>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${m.accent}`}>
                  <m.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div>
                <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-curator-charcoal block leading-tight">
                  {m.value}
                </span>
                <span className="text-[10px] sm:text-[11px] text-curator-muted font-sans mt-0.5 block">
                  {m.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Shortcuts (Mobile touch grid) */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] bg-gradient-to-r from-curator-surface-peach via-[#FAF5EE] to-curator-surface-peach border border-curator-border space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-curator-coral text-white flex items-center justify-center font-bold text-xs">
            ✦
          </div>
          <h4 className="font-serif text-xs sm:text-sm font-bold text-curator-charcoal">
            Quick Actions
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            to="/admin/products/new"
            className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-curator-coral text-white text-xs font-bold shadow-xs hover:bg-curator-coral-hover transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Drop</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-white border border-curator-border text-curator-charcoal text-xs font-semibold hover:border-curator-coral hover:text-curator-coral transition-colors min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4 text-curator-coral" />
            <span>Orders</span>
          </Link>
          <Link
            to="/admin/content/hero"
            className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-white border border-curator-border text-curator-charcoal text-xs font-semibold hover:border-curator-coral hover:text-curator-coral transition-colors min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-curator-coral" />
            <span>Hero Banner</span>
          </Link>
          <Link
            to="/admin/content/homepage"
            className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-white border border-curator-border text-curator-charcoal text-xs font-semibold hover:border-curator-coral hover:text-curator-coral transition-colors min-h-[44px]"
          >
            <Sliders className="w-4 h-4 text-curator-coral" />
            <span>Sections</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Drops Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-curator-charcoal">Recent Orders</h3>
              <p className="text-[11px] sm:text-xs text-curator-muted">Latest purchases across Bangladesh</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-curator-coral hover:text-curator-coral-hover flex items-center gap-1 min-h-[36px] items-center"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-xs text-curator-muted">
              No orders found for this time period.
            </div>
          ) : (
            <>
              {/* MOBILE: Order Cards List (< 768px) */}
              <div className="block md:hidden space-y-2.5">
                {filteredOrders.slice(0, 5).map(order => (
                  <Link
                    key={order.id || order.order_number}
                    to={`/admin/orders?highlight=${order.id || order.order_number}`}
                    className="block p-3.5 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border/80 hover:border-curator-coral transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-curator-charcoal">
                        {order.order_number}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'confirmed' || order.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'shipped'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status || 'pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-curator-charcoal">{order.customer_name}</div>
                        <div className="text-[10px] text-curator-muted font-mono">{order.city} • {order.phone}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-curator-coral block">
                          ৳{order.total?.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-curator-muted">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* DESKTOP: Orders Table (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-curator-border text-curator-muted font-mono uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-semibold">Order</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">City</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-curator-border/60">
                    {filteredOrders.slice(0, 5).map(order => (
                      <tr key={order.id || order.order_number} className="hover:bg-curator-surface-peach/30 transition-colors">
                        <td className="py-3 font-mono font-bold text-curator-charcoal">
                          {order.order_number}
                        </td>
                        <td className="py-3">
                          <div className="font-semibold text-curator-charcoal">{order.customer_name}</div>
                          <div className="text-[10px] text-curator-muted font-mono">{order.phone}</div>
                        </td>
                        <td className="py-3 text-curator-muted">
                          {order.city}
                        </td>
                        <td className="py-3 font-mono font-bold text-curator-coral">
                          ৳{order.total?.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'confirmed' || order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/admin/orders?highlight=${order.id || order.order_number}`}
                            className="text-xs font-bold text-curator-coral hover:underline min-h-[32px] inline-flex items-center"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Current Drops Inventory (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base sm:text-lg font-bold text-curator-charcoal">Active Drops</h3>
            <Link to="/admin/products" className="text-xs font-bold text-curator-coral hover:underline">
              Manage All ({products.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {products.slice(0, 4).map(prod => (
              <Link
                key={prod.id}
                to={`/admin/products/${prod.id}`}
                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-curator-surface-peach/50 transition-colors border border-curator-border/60"
              >
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  className="w-12 h-14 object-cover rounded-xl bg-curator-bg flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-xs font-bold text-curator-charcoal truncate">
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-xs text-curator-coral">
                      ৳{prod.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-curator-surface-peach text-curator-muted font-mono">
                      Stock: {prod.stock || 50}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-curator-muted" />
              </Link>
            ))}
          </div>

          <Link
            to="/admin/products/new"
            className="w-full py-3 px-4 rounded-2xl border border-dashed border-curator-coral/60 text-curator-coral hover:bg-curator-coral-light font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Product Drop</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
