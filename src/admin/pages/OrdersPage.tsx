import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, Eye, Download, Sparkles, AlertCircle } from 'lucide-react';
import { orderService } from '../../lib/api';
import { Order } from '../../types';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import { AdminTableSkeleton } from '../components/AdminSkeleton';
import { useAdminToast } from '../context/AdminToastContext';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { success, error } = useAdminToast();

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);

      // Check if URL specifies highlight order
      const highlightId = searchParams.get('highlight');
      if (highlightId) {
        const found = data.find(o => o.id === highlightId || o.order_number === highlightId);
        if (found) {
          setSelectedOrder(found);
          setIsDrawerOpen(true);
        }
      }
    } catch {
      error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [searchParams]);

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        success(`Status updated to ${newStatus}`);
        loadOrders();
      } else {
        error('Failed to update status');
      }
    } catch {
      error('Failed to update status');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Customer Name', 'Phone', 'Address', 'City', 'Subtotal', 'Delivery', 'Total', 'Status', 'Date'];
    const rows = orders.map(o => [
      o.order_number,
      `"${o.customer_name}"`,
      `"${o.phone}"`,
      `"${o.address?.replace(/"/g, '""')}"`,
      o.city,
      o.subtotal,
      o.delivery_charge,
      o.total,
      o.status,
      o.created_at || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `women-curator-orders-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Orders exported as CSV');
  };

  // Filter Orders
  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.address?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdated={loadOrders}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Orders Management</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Orders ({orders.length})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:text-curator-coral hover:border-curator-coral shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadOrders}
            className="p-2.5 rounded-full border border-curator-border bg-white text-curator-charcoal hover:text-curator-coral shadow-xs transition-all"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-[2rem] p-4 border border-curator-border shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full lg:max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer name, phone..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-curator-border bg-[#FAF5EE]/50 text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all font-sans"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#FAF5EE] rounded-full p-1 border border-curator-border w-full lg:w-auto overflow-x-auto text-xs font-semibold">
          {(['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-curator-coral text-white shadow-sm font-bold'
                  : 'text-curator-muted hover:text-curator-charcoal'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <AdminTableSkeleton rows={5} />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-curator-border p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-curator-muted mx-auto" />
          <h3 className="font-serif text-lg font-bold text-curator-charcoal">No Orders Found</h3>
          <p className="text-xs text-curator-muted max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Try changing your search query or filter status.'
              : 'Orders placed on the storefront will appear here in real-time.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-curator-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5EE]/70 border-b border-curator-border text-curator-muted font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6 font-semibold">Order</th>
                  <th className="py-4 px-4 font-semibold">Customer Destination</th>
                  <th className="py-4 px-4 font-semibold">City & Delivery</th>
                  <th className="py-4 px-4 font-semibold">Amount</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-curator-border/60 font-sans">
                {filteredOrders.map(order => (
                  <tr
                    key={order.id || order.order_number}
                    className="hover:bg-curator-surface-peach/30 transition-colors cursor-pointer"
                    onClick={() => handleOpenOrder(order)}
                  >
                    {/* Order # + Time */}
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-sm text-curator-charcoal block">
                        {order.order_number}
                      </span>
                      <span className="text-[10px] text-curator-muted font-mono">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-curator-charcoal">{order.customer_name}</div>
                      <div className="text-[11px] text-curator-muted font-mono">{order.phone}</div>
                    </td>

                    {/* Destination & City */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-curator-charcoal block">{order.city}</span>
                      <span className="text-[11px] text-curator-muted truncate max-w-xs block">{order.address}</span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-sm text-curator-coral block">
                        ৳{order.total?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-curator-muted font-mono">
                        {order.items?.length || 1} item(s) • COD
                      </span>
                    </td>

                    {/* Status Select */}
                    <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status || 'pending'}
                        onChange={e => handleStatusChange(order.id || '', e.target.value as any)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono border focus:outline-none cursor-pointer ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.status === 'confirmed' || order.status === 'processing'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : order.status === 'shipped'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : order.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Action View */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOrder(order);
                        }}
                        className="p-2 rounded-xl border border-curator-border hover:bg-curator-coral hover:text-white text-curator-charcoal transition-all shadow-xs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
