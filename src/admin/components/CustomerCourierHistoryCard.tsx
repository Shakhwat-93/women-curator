import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Clock
} from 'lucide-react';
import { CourierCheckResult, CourierRiskLevel } from '../../types';
import { bdCourierService } from '../../lib/bdCourier';
import { useAdminToast } from '../context/AdminToastContext';

interface CustomerCourierHistoryCardProps {
  phone: string;
  orderId?: string;
  initialData?: CourierCheckResult | null;
  onRefreshSuccess?: (data: CourierCheckResult) => void;
}

export const CustomerCourierHistoryCard: React.FC<CustomerCourierHistoryCardProps> = ({
  phone,
  orderId,
  initialData,
  onRefreshSuccess
}) => {
  const [courierData, setCourierData] = useState<CourierCheckResult | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  const { success, error } = useAdminToast();

  const loadData = async (forceRefresh: boolean = false) => {
    if (!phone) {
      setIsLoading(false);
      return;
    }

    if (forceRefresh) {
      setIsRefreshing(true);
    } else if (!courierData) {
      setIsLoading(true);
    }

    try {
      const res = await bdCourierService.checkCustomerCourier(phone, {
        orderId,
        forceRefresh
      });

      if (res.success && res.data) {
        setCourierData(res.data);
        if (onRefreshSuccess) {
          onRefreshSuccess(res.data);
        }
        if (forceRefresh) {
          success('Fresh courier data retrieved and cached!');
        }
      } else if (!forceRefresh && !courierData) {
        // Soft fallback for unconfigured API key or missing history
        setCourierData(null);
      } else if (forceRefresh) {
        error(res.error || 'Failed to fetch courier data');
      }
    } catch (err: any) {
      if (forceRefresh) {
        error(err.message || 'Error connecting to courier gateway');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setShowConfirmModal(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setCourierData(initialData);
      setIsLoading(false);
    } else if (phone) {
      loadData(false);
    }
  }, [phone, initialData]);

  const handleRefreshClick = () => {
    if (!courierData) {
      loadData(true);
      return;
    }

    const isExpired = new Date(courierData.expires_at) <= new Date();
    if (isExpired) {
      loadData(true);
    } else {
      // Prompt modal to prevent accidental external API calls
      setShowConfirmModal(true);
    }
  };

  const getRiskBadge = (risk: CourierRiskLevel, total: number) => {
    if (total === 0 || risk === 'unknown') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono text-[10px] font-bold uppercase">
          <ShieldQuestion className="w-3 h-3 text-gray-500" />
          <span>No History / Unknown</span>
        </span>
      );
    }
    if (risk === 'low') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold uppercase">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Low Risk Customer ({courierData?.summary_success_ratio || 0}%)</span>
        </span>
      );
    }
    if (risk === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold uppercase">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Medium Risk ({courierData?.summary_success_ratio || 0}%)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-mono text-[10px] font-bold uppercase">
        <ShieldAlert className="w-3 h-3 text-rose-600" />
        <span>High Cancellation Risk ({courierData?.summary_success_ratio || 0}%)</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-curator-border shadow-xs space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-4 bg-gray-200 rounded-full w-24" />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="h-16 bg-gray-100 rounded-2xl" />
          <div className="h-16 bg-gray-100 rounded-2xl" />
          <div className="h-16 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasParcels = courierData && courierData.summary_total_parcel > 0;
  const hasReports = courierData && courierData.reports && courierData.reports.length > 0;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-curator-border shadow-xs space-y-4 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-curator-muted font-mono uppercase block">
              Customer Courier History (BD Courier)
            </span>
          </div>
          <p className="text-[11px] text-curator-muted font-sans mt-0.5">
            Cross-courier delivery success & cancellation profile for {phone}
          </p>
        </div>

        {getRiskBadge(courierData?.risk_level || 'unknown', courierData?.summary_total_parcel || 0)}
      </div>

      {courierData && hasParcels ? (
        <>
          {/* Main Success Ratio Metric Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF5EE] to-[#F9ECE4]/50 border border-curator-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-curator-muted tracking-wider block">
                  Overall Delivery Success Rate
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-serif text-3xl font-bold text-curator-charcoal">
                    {courierData.summary_success_ratio}%
                  </span>
                  <span className="text-xs text-curator-muted font-mono">
                    ({courierData.summary_success_parcel} of {courierData.summary_total_parcel} parcels)
                  </span>
                </div>
              </div>

              {/* Visual Ring/Progress indicator */}
              <div className="w-14 h-14 rounded-full bg-white border-2 border-curator-border flex items-center justify-center p-1 shadow-xs">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-xs font-mono font-bold"
                  style={{
                    color:
                      courierData.summary_success_ratio >= 85
                        ? '#059669'
                        : courierData.summary_success_ratio >= 70
                        ? '#D97706'
                        : '#DC2626'
                  }}
                >
                  {Math.round(courierData.summary_success_ratio)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${courierData.summary_success_ratio}%` }}
                title={`Success: ${courierData.summary_success_parcel}`}
              />
              <div
                className="bg-rose-400 h-full transition-all duration-500"
                style={{ width: `${100 - courierData.summary_success_ratio}%` }}
                title={`Cancelled: ${courierData.summary_cancelled_parcel}`}
              />
            </div>

            {/* 3-Column Numbers */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-white border border-curator-border/60">
                <span className="text-[10px] text-curator-muted font-mono uppercase block">Total Orders</span>
                <span className="font-mono font-bold text-sm text-curator-charcoal">
                  {courierData.summary_total_parcel}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-curator-border/60">
                <span className="text-[10px] text-emerald-700 font-mono uppercase block">Delivered</span>
                <span className="font-mono font-bold text-sm text-emerald-700">
                  {courierData.summary_success_parcel}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-curator-border/60">
                <span className="text-[10px] text-rose-700 font-mono uppercase block">Cancelled / Returned</span>
                <span className="font-mono font-bold text-sm text-rose-700">
                  {courierData.summary_cancelled_parcel}
                </span>
              </div>
            </div>
          </div>

          {/* Courier Breakdown Grid */}
          {courierData.couriers && Object.keys(courierData.couriers).length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-curator-muted block font-mono">
                Courier Specific Breakdown
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(courierData.couriers).map(([key, item]) => {
                  if (!item.total_parcel || item.total_parcel === 0) return null;
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.logo ? (
                          <img
                            src={item.logo}
                            alt={item.name}
                            className="w-7 h-7 rounded-lg object-contain bg-white p-1 border border-curator-border/40 flex-shrink-0"
                            onError={e => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-curator-coral-light text-curator-coral flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0">
                            {key.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-curator-charcoal truncate">
                            {item.name || key.toUpperCase()}
                          </h5>
                          <span className="text-[10px] text-curator-muted font-mono block">
                            {item.success_parcel} of {item.total_parcel} ok ({item.cancelled_parcel} returned)
                          </span>
                        </div>
                      </div>

                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.success_ratio >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.success_ratio >= 70
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.success_ratio}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Merchant Reports / Fraud Flags Accordion */}
          {hasReports && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-amber-100/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span className="text-xs font-bold text-amber-900">
                    Merchant Reports & Notes ({courierData.reports.length})
                  </span>
                </div>
                {isReportsOpen ? (
                  <ChevronUp className="w-4 h-4 text-amber-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-amber-700" />
                )}
              </button>

              {isReportsOpen && (
                <div className="p-3.5 pt-0 space-y-2 border-t border-amber-200/60">
                  {courierData.reports.map((rep, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-900">
                          {rep.courier || 'SteadFast / Pathao Report'}
                        </span>
                        <span className="text-curator-muted font-mono">{rep.date || 'Recent'}</span>
                      </div>
                      <p className="text-curator-charcoal leading-relaxed">
                        {rep.report || rep.details || rep.reason || 'Flagged parcel return or fake order history.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Empty / No History State */
        <div className="p-5 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border text-center space-y-1.5">
          <ShieldQuestion className="w-8 h-8 text-curator-muted mx-auto" />
          <h5 className="font-serif font-bold text-xs text-curator-charcoal">
            No Prior Courier Records Found
          </h5>
          <p className="text-[11px] text-curator-muted max-w-xs mx-auto">
            This customer ({phone}) has no recorded cancellations across Pathao, Steadfast, or RedX networks.
          </p>
        </div>
      )}

      {/* Footer & Cache Status Meta */}
      <div className="pt-2 border-t border-curator-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-curator-muted font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-curator-coral" />
          <span>
            {courierData?.checked_at
              ? `Cached on ${new Date(courierData.checked_at).toLocaleDateString()} ${new Date(courierData.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Not checked yet'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1 text-curator-coral font-bold hover:underline self-start sm:self-auto min-h-[30px]"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Rechecking...' : 'Refresh Courier Data'}</span>
        </button>
      </div>

      {/* Force Recheck Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-curator-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full border border-curator-border shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-curator-charcoal">
              <Info className="w-5 h-5 text-curator-coral flex-shrink-0" />
              <h4 className="font-serif text-sm font-bold">Cached Courier Data Available</h4>
            </div>

            <p className="text-xs text-curator-muted leading-relaxed">
              Courier data for <strong>{phone}</strong> is currently cached from{' '}
              {courierData?.checked_at ? new Date(courierData.checked_at).toLocaleDateString() : 'recent check'}.
              <br />
              Do you want to consume a live external API call to force recheck?
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-curator-border text-xs font-bold text-curator-charcoal hover:bg-curator-surface-peach"
              >
                Use Cached
              </button>
              <button
                type="button"
                onClick={() => loadData(true)}
                className="flex-1 py-2.5 rounded-xl bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover"
              >
                Force Recheck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
