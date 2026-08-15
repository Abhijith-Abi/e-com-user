import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, Package, Truck, CheckCircle, Clock, MapPin, Phone, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import orderService, { type OrderDetail } from '@/services/order.service';
import { toast } from 'sonner';

type ValidOrderDetail = OrderDetail & {
  gst: string;
  gift_wrap_charges: string;
  gift_card_discount: string;
  applied_gift_wrap_detail: any;
  applied_gift_card_detail: any;
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return CheckCircle;
    case 'processing':
      return Clock;
    case 'shipped':
      return Truck;
    case 'delivered':
      return Package;
    case 'cancelled':
      return AlertCircle;
    default:
      return Clock;
  }
};

const OrderDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPriceExact } = useSettingsStore();
  const [order, setOrder] = useState<ValidOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        toast.error('Order ID not found');
        navigate('/account');
        return;
      }

      try {
        const orderData = await orderService.getOrder(id);
        setOrder(orderData);
      } catch (error: any) {
        console.error('Failed to fetch order:', error);
        toast.error('Failed to load order details');
        navigate('/account');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const handleCancelOrder = async () => {
    if (!id) return;

    setCancelling(true);
    try {
      await orderService.cancelOrder(id, cancelReason);
      // Fetch the latest order details to ensure all data is updated
      const updatedOrder = await orderService.getOrder(id);
      setOrder(updatedOrder as ValidOrderDetail);
      setShowCancelConfirm(false);
      setCancelReason('');
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      const msg = error.response?.data?.detail || error.message || 'Failed to cancel order';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const canCancelOrder = () => {
    if (!order) return false;
    const cancelableStatuses = ['pending', 'processing', 'confirmed'];
    return cancelableStatuses.includes(order.order_status?.toLowerCase() || '');
  };

  const handleBackToOrders = () => {
    navigate('/account', { state: { activeTab: 'orders' } });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50/40 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-zinc-900 dark:text-zinc-100 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-zinc-400 font-sans text-xs tracking-wider uppercase font-semibold">Loading order details...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-zinc-50/40 dark:bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-5">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center mx-auto border border-rose-100/50">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="font-display text-sm font-extrabold text-zinc-900 dark:text-zinc-50">Order Not Found</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">We couldn't retrieve the details for this order ID.</p>
          </div>
          <button onClick={() => navigate('/account')} className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold text-xs tracking-wide shadow-md shadow-primary/10 transition-all duration-300 hover:-translate-y-[0.5px]">
            Back to Account
          </button>
        </div>
      </main>
    );
  }

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    let classes = 'bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50';
    if (s === 'delivered') {
      classes = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (s === 'shipped') {
      classes = 'bg-primary/10 text-primary dark:text-primary border-primary/20';
    } else if (['pending', 'processing', 'confirmed'].includes(s)) {
      classes = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    } else if (['cancelled', 'rejected'].includes(s)) {
      classes = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-sans font-bold uppercase tracking-wider ${classes} w-fit`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const s = status?.toLowerCase();
    let classes = 'bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50';
    if (s === 'paid' || s === 'completed') {
      classes = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (['pending', 'unpaid', 'processing'].includes(s)) {
      classes = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    } else if (['failed', 'refunded', 'cancelled'].includes(s)) {
      classes = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[9px] font-sans font-extrabold uppercase tracking-wider ${classes}`}>
        {status}
      </span>
    );
  };

  const getTimelineIcon = (status: string, reached: boolean) => {
    if (!reached) return <Clock className="w-3.5 h-3.5 text-zinc-350 dark:text-zinc-650" />;
    
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450" />;
      case 'shipped':
        return <Truck className="w-3.5 h-3.5 text-primary dark:text-primary" />;
      case 'cancelled':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-450" />;
      default:
        return <CheckCircle className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' at ' + new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <main className="min-h-screen bg-zinc-50/40 dark:bg-zinc-950 pb-16 font-sans">
      <div className="container py-8 md:py-10">
        {/* Back Button */}
        <button
          onClick={handleBackToOrders}
          className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-6 transition-colors font-sans uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-xl md:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">Order #{order.order_id}</h1>
                  <p className="text-xs text-zinc-450 dark:text-zinc-400 font-bold font-sans mt-1">{formatDate(order.created_at)}</p>
                </div>
                {getStatusBadge(order.order_status)}
              </div>

              {/* Status Section Grid */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                {/* <div className="space-y-1">
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Payment status</p>
                  <div className="pt-0.5">{getPaymentBadge(order.payment_status)}</div>
                </div> */}
                {order.applied_coupon_code && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Coupon applied</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit border border-emerald-500/20">{order.applied_coupon_code}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-6">
              <h2 className="font-display text-base font-extrabold text-zinc-900 dark:text-zinc-50 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">Order Items</h2>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-zinc-100/60 dark:border-zinc-800/60 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="font-extrabold text-zinc-900 dark:text-zinc-50 text-sm leading-snug">{item.product_name}</p>
                        {(item.selected_color || item.selected_size) && (
                          <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider mt-1.5 bg-zinc-50 dark:bg-zinc-850 px-2 py-0.5 rounded-md w-fit border border-zinc-100/50 dark:border-zinc-800/50">
                            {[item.selected_color, item.selected_size].filter(Boolean).join(' / ')}
                          </p>
                        )}
                        <p className="text-xs text-zinc-400 dark:text-zinc-550 font-bold mt-2">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-extrabold text-zinc-900 dark:text-zinc-50 text-sm">{formatPriceExact(parseFloat(item.price) * item.quantity)}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">{formatPriceExact(parseFloat(item.price))} each</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-450 dark:text-zinc-500 italic">No items in this order</p>
                )}
              </div>

              {/* Gift Options */}
              {(order.applied_gift_wrap_detail || order.applied_gift_card_detail) && (
                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-5 space-y-4">
                  <h3 className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Gift Options</h3>
                  {order.applied_gift_wrap_detail && (
                    <div className="flex gap-4 pb-3 border-b border-zinc-100/60 dark:border-zinc-800/60 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{order.applied_gift_wrap_detail.wrap_name}</p>
                        <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-0.5">Premium Gift Wrap</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-zinc-900 dark:text-zinc-50 text-sm">{formatPriceExact(order.applied_gift_wrap_detail.charges)}</p>
                      </div>
                    </div>
                  )}
                  {order.applied_gift_card_detail && (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{order.applied_gift_card_detail.card_name}</p>
                        <p className="text-xs text-zinc-455 dark:text-zinc-500 mt-0.5">Custom Greeting Card</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-zinc-900 dark:text-zinc-50 text-sm">{formatPriceExact(order.applied_gift_card_detail.discount)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-4">
              <h2 className="font-display text-base font-extrabold text-zinc-900 dark:text-zinc-50 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">Shipping Address</h2>
              {order.shipping_address_detail ? (
                <div className="text-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-100/50 dark:border-zinc-800/50">
                      <MapPin className="w-4 h-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="font-extrabold text-zinc-900 dark:text-zinc-50 text-sm leading-none mb-1.5">{order.shipping_address_detail.full_name}</p>
                      <p className="text-zinc-550 dark:text-zinc-400 font-semibold leading-relaxed">
                        {order.shipping_address_detail.address_line1}
                        {order.shipping_address_detail.address_line2 && (
                          <>
                            <br />
                            {order.shipping_address_detail.address_line2}
                          </>
                        )}
                        <br />
                        {order.shipping_address_detail.city}, {order.shipping_address_detail.state} {order.shipping_address_detail.postal_code}
                        <br />
                        {order.shipping_address_detail.country}
                      </p>
                    </div>
                  </div>
                  {order.shipping_address_detail.phone && (
                    <div className="flex items-center gap-3 pt-3 border-t border-zinc-100/60 dark:border-zinc-800/60">
                      <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-855 border border-zinc-100/50 dark:border-zinc-800/50">
                        <Phone className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <p className="text-zinc-550 dark:text-zinc-400 text-xs font-bold">{order.shipping_address_detail.phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-450 dark:text-zinc-500 italic">No shipping address available</p>
              )}
            </div>

            {/* Status Timeline */}
            {order.status_timeline && order.status_timeline.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-6">
                <h2 className="font-display text-base font-extrabold text-zinc-900 dark:text-zinc-50 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">Order Status Timeline</h2>
                <div className="space-y-8 relative pl-8 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800/80">
                  {order.status_timeline.map((item, index) => {
                    const isReached = item.status?.toLowerCase() === 'confirmed' ? item.ordered_at !== null : item.reached_at !== null;
                    const displayDate = item.status?.toLowerCase() === 'confirmed' ? item.ordered_at : item.reached_at;
                    const StatusIcon = getStatusIcon(item.status);
                    return (
                      <div key={index} className="relative flex gap-4 min-w-0">
                        <div className="absolute -left-8 top-0 w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-900 z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isReached
                              ? 'bg-primary/10 text-primary border border-primary/25 shadow-[0_0_12px_rgba(59,130,246,0.12)]'
                              : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-400 dark:text-zinc-650 border border-zinc-200 dark:border-zinc-800'
                          }`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5 pl-1">
                          <h4 className={`font-sans text-sm font-extrabold tracking-tight capitalize ${
                            isReached ? 'text-primary' : 'text-zinc-400 dark:text-zinc-500'
                          }`}>
                            {item.status}
                          </h4>
                          {isReached ? (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold mt-1">
                              {formatDate(displayDate)}
                            </p>
                          ) : (
                            <p className="text-[11px] text-zinc-400/80 dark:text-zinc-650 font-semibold mt-1">
                              Pending
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancellation Details */}
            {order.order_status?.toLowerCase() === 'cancelled' && order.cancellation_detail && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200 dark:border-rose-950/30 bg-rose-50/30 dark:bg-rose-950/10 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-4">
                <h2 className="font-display text-base font-extrabold text-rose-600 dark:text-rose-400 pb-3 border-b border-rose-200 dark:border-rose-950/30">Cancellation Details</h2>
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-sans font-bold tracking-widest uppercase">Cancelled By</p>
                    <p className="text-sm font-extrabold text-rose-700 dark:text-rose-300 capitalize">{order.cancellation_detail.cancelled_by}</p>
                  </div>
                  {order.cancellation_detail.reason && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-sans font-bold tracking-widest uppercase">Reason</p>
                      <p className="text-sm text-rose-700 dark:text-rose-300 font-semibold leading-relaxed">{order.cancellation_detail.reason}</p>
                    </div>
                  )}
                  {order.cancellation_detail.message && (
                    <div className="space-y-1 pt-2 border-t border-rose-200 dark:border-rose-950/30">
                      <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-sans font-bold tracking-widest uppercase">Message</p>
                      <p className="text-sm text-rose-700 dark:text-rose-300 font-semibold leading-relaxed">{order.cancellation_detail.message}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tracking Information */}
            {(order.tracking_number || order.courier_name) && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-4">
                <h2 className="font-display text-base font-extrabold text-zinc-900 dark:text-zinc-50 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">Tracking Information</h2>
                <div className="grid sm:grid-cols-2 gap-6 text-xs">
                  {order.courier_name && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Courier Partner</p>
                      <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{order.courier_name}</p>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Tracking Number</p>
                      <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{order.tracking_number}</p>
                    </div>
                  )}
                  {order.courier_tracking_url && (
                    <div className="sm:col-span-2 pt-2 border-t border-zinc-100/50 dark:border-zinc-800/50">
                      <a
                        href={order.courier_tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-primary/20 hover:border-primary/45 bg-white hover:bg-primary/5 dark:bg-zinc-900 dark:hover:bg-primary/10 text-xs font-bold text-primary transition-all duration-300 shadow-sm"
                      >
                        Track Shipment Package →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-6">
              <h3 className="font-display text-base font-extrabold text-zinc-900 dark:text-zinc-50 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">Order Summary</h3>

              <div className="space-y-3 text-xs border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                <div className="flex justify-between font-medium text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-sans font-bold text-zinc-900 dark:text-zinc-50">{formatPriceExact(parseFloat(order.total_amount) - parseFloat(order.gst || '0') - parseFloat(order.discount_amount || '0') - parseFloat(order.gift_wrap_charges || '0') - parseFloat(order.gift_card_discount || '0') - parseFloat(order.token_shortfall_charge || '0'))}</span>
                </div>
                {parseFloat(order.discount_amount || '0') > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-450">
                    <span>Discount</span>
                    <span className="font-sans">-{formatPriceExact(parseFloat(order.discount_amount))}</span>
                  </div>
                )}
                {parseFloat(order.gift_wrap_charges || '0') > 0 && (
                  <div className="flex justify-between font-medium text-zinc-500 dark:text-zinc-400">
                    <span>Gift Wrap Charges</span>
                    <span className="font-sans font-bold text-zinc-900 dark:text-zinc-50">{formatPriceExact(parseFloat(order.gift_wrap_charges))}</span>
                  </div>
                )}
                {parseFloat(order.gift_card_discount || '0') > 0 && (
                  <div className="flex justify-between font-medium text-zinc-500 dark:text-zinc-400">
                    <span>Greeting Card</span>
                    <span className="font-sans font-bold text-zinc-900 dark:text-zinc-50">{formatPriceExact(parseFloat(order.gift_card_discount))}</span>
                  </div>
                )}
                {order.gst && parseFloat(order.gst) > 0 && (
                  <div className="flex justify-between font-medium text-zinc-500 dark:text-zinc-400">
                    <span>GST</span>
                    <span className="font-sans font-bold text-zinc-900 dark:text-zinc-50">{formatPriceExact(parseFloat(order.gst))}</span>
                  </div>
                )}
                {order.token_shortfall_charge && parseFloat(order.token_shortfall_charge) > 0 && (
                  <div className="flex justify-between font-medium text-zinc-500 dark:text-zinc-400">
                    <span>Points Shortage Charge</span>
                    <span className="font-sans font-bold text-zinc-900 dark:text-zinc-50">+{formatPriceExact(parseFloat(order.token_shortfall_charge))}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-extrabold text-sm text-zinc-900 dark:text-zinc-50">
                <span>Total</span>
                <span className="font-sans text-base">{formatPriceExact(parseFloat(order.total_amount))}</span>
              </div>

              {/* Cancel Order Button */}
              {canCancelOrder() && (
                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                  {!showCancelConfirm ? (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full px-4 py-3 text-xs font-bold font-sans tracking-wide text-rose-600 hover:text-rose-700 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-200 dark:border-rose-950/30 rounded-2xl transition-all duration-300 shadow-sm"
                    >
                      Cancel Order
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-rose-500/5 border border-rose-200 dark:border-rose-950/30 rounded-2xl">
                        <p className="text-[11px] font-bold text-rose-600 leading-normal">Are you sure you want to cancel this order? This action cannot be undone.</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-450 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase block">Reason for cancellation (optional)</label>
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Please tell us why you're cancelling this order..."
                          className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none font-sans font-medium"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowCancelConfirm(false);
                            setCancelReason('');
                          }}
                          className="flex-1 px-3 py-2.5 text-xs font-bold border border-zinc-200 dark:border-zinc-850 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all duration-300 text-zinc-700 dark:text-zinc-350"
                        >
                          Keep Order
                        </button>
                        <button
                          onClick={handleCancelOrder}
                          disabled={cancelling}
                          className="flex-1 px-3 py-2.5 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all duration-300 disabled:opacity-60 shadow-sm"
                        >
                          {cancelling ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetailView;
