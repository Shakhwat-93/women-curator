import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Download,
  Eye,
  Sparkles,
  ShoppingBag,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { orderService } from '../../lib/api';
import { Order, OrderStatus } from '../../types';
import { AdminTableSkeleton } from '../components/AdminSkeleton';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import { useAdminToast } from '../context/AdminToastContext';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { success, error } = useAdminToast();
  const location = useLocation();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
      error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Handle URL search params or highlight
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const highlight = params.get('highlight');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (highlight && orders.length > 0) {
      const found = orders.find(o => o.id === highlight || o.order_number === highlight);
      if (found) setSelectedOrder(found);
    }
  }, [location.search, orders]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await orderService.updateOrderStatus(orderId, status);
      if (res.success) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId || o.order_number === orderId ? { ...o, status } : o))
        );
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderId)) {
          setSelectedOrder(prev => (prev ? { ...prev, status } : null));
        }
        success(`Order marked as ${status}`);
      } else {
        error(res.error || 'Failed to update order status');
      }
    } catch (err: any) {
      error(err.message || 'Status update failed');
    }
  };

  const exportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'City', 'Total (BDT)', 'Status', 'Payment'];
    const rows = filteredOrders.map(o => [
      o.order_number,
      o.created_at ? new Date(o.created_at).toLocaleDateString() : '',
      `"${o.customer_name}"`,
      o.phone,
      `"${o.city}"`,
      o.total,
      o.status,
      `"${o.payment_method}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `women_curator_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Exported orders CSV successfully!');
  };

  const filteredOrders = orders.filter(o => {
    const matchesQuery =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery) ||
      o.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Fulfillment Hub</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Orders ({orders.length})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:bg-curator-surface-peach shadow-xs transition-colors min-h-[44px]"
          >
            <Download className="w-4 h-4 text-curator-coral" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={loadOrders}
            title="Refresh Orders"
            className="p-2.5 rounded-full border border-curator-border bg-white text-curator-charcoal hover:text-curator-coral transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-4 border border-curator-border shadow-xs space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, city, order #..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-curator-border bg-[#FAF5EE]/50 text-xs focus:outline-none focus:border-curator-coral font-sans"
          />
        </div>

        {/* Horizontal Scrollable Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(st => {
            const count = st === 'all' ? orders.length : orders.filter(o => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[36px] ${
                  statusFilter === st
                    ? 'bg-curator-coral text-white font-bold shadow-xs'
                    : 'bg-[#FAF5EE] text-curator-muted hover:text-curator-charcoal border border-curator-border/60'
                }`}
              >
                <span>{st}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === st ? 'bg-white/20 text-white' : 'bg-curator-surface-peach text-curator-charcoal'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Container */}
      {isLoading ? (
        <AdminTableSkeleton />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-curator-coral-light text-curator-coral mx-auto flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-curator-charcoal">No Orders Found</h3>
          <p className="text-xs text-curator-muted max-w-sm mx-auto">
            {searchQuery ? `No orders match "${searchQuery}".` : 'Customer purchases will appear here in real time.'}
          </p>
        </div>
      ) : (
        <>
          {/* ─── MOBILE: ORDER CARDS LIST (< 768px) ─── */}
          <div className="block md:hidden space-y-3">
            {filteredOrders.map(order => (
              <div
                key={order.id || order.order_number}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs hover:border-curator-coral transition-all active:scale-[0.99] cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-curator-charcoal">
                      {order.order_number}
                    </span>
                    <span className="text-[10px] text-curator-muted font-sans">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
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
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h4 className="font-bold text-xs text-curator-charcoal">{order.customer_name}</h4>
                    <p className="text-[11px] text-curator-muted font-mono">{order.city} • {order.phone}</p>
                    <p className="text-[10px] text-curator-muted mt-0.5">{order.items?.length || 1} item(s)</p>
                  </div>

                  <div className="text-right">
                    <span className="font-serif font-bold text-base text-curator-coral block">
                      ৳{order.total?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-curator-muted font-mono">
                      {order.payment_method?.includes('Cash') ? 'COD' : 'Paid'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-curator-border/50 flex items-center justify-between text-xs text-curator-coral font-bold">
                  <span>View Details & Timeline</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* ─── DESKTOP: FULL TABLE (>= 768px) ─── */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-curator-border shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5EE]/70 border-b border-curator-border text-curator-muted font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Order</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Delivery City</th>
                  <th className="py-3.5 px-4 font-semibold">Items</th>
                  <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-curator-border/60">
                {filteredOrders.map(order => (
                  <tr
                    key={order.id || order.order_number}
                    className="hover:bg-curator-surface-peach/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-4 px-6 font-mono font-bold text-curator-charcoal">
                      <div>{order.order_number}</div>
                      <div className="text-[10px] text-curator-muted font-sans font-normal">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-curator-charcoal">{order.customer_name}</div>
                      <div className="text-[10px] text-curator-muted font-mono">{order.phone}</div>
                    </td>

                    <td className="py-4 px-4 text-curator-charcoal font-medium">
                      {order.city}
                      {order.area && <span className="text-[10px] text-curator-muted block font-mono">{order.area}</span>}
                    </td>

                    <td className="py-4 px-4 font-mono text-curator-muted">
                      {order.items?.length || 1} item(s)
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-curator-coral">
                      ৳{order.total?.toLocaleString()}
                      <span className="text-[9px] text-curator-muted block font-sans font-normal">
                        {order.payment_method}
                      </span>
                    </td>

                    <td className="py-4 px-4">
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
                        {order.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="inline-flex items-center gap-1 py-1.5 px-3 rounded-full border border-curator-border hover:border-curator-coral text-curator-coral text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
