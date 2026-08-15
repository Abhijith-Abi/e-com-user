import { Link } from 'react-router-dom';
import { Package, ChevronRight, Download, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import orderService from '@/services/order.service';
import api from '@/services/api';
import { toast } from 'sonner';

interface Props {
  profile: any;
  loading: boolean;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: string;
  selected_color?: string;
  selected_size?: string;
  created_at: string;
}

interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Order {
  id: string;
  order_id: string;
  total_amount: string;
  tax_amount: string;
  discount_amount: string;
  order_status: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
  customer_name: string;
  customer_email: string;
  shipping_address_detail?: ShippingAddress;
  courier_name?: string;
  courier_tracking_url?: string;
  tracking_number?: string;
  invoice_id?: string; // Add invoice_id field
  token_shortfall_charge?: string;
}

interface GroupedOrder {
  orderId: string;
  id: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  customerName: string;
  shippingAddress?: ShippingAddress;
  invoiceId?: string; // Add invoice_id field
  tokenShortfallCharge?: number;
}

const OrdersTab = ({ profile, loading }: Props) => {
  const { formatPriceExact } = useSettingsStore();
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async (url?: string) => {
      setOrdersLoading(true);
      try {
        let response;
        if (url) {
          const apiResponse = await api.get(url.replace(api.defaults.baseURL, ''));
          response = apiResponse.data;
        } else {
          response = await orderService.getAllOrders();
        }
        
        const orders = response.results || response || [];

        const mappedOrders: GroupedOrder[] = (Array.isArray(orders) ? orders : []).map((order: Order) => ({
          orderId: order.order_id || order.id,
          id: order.id,
          totalAmount: parseFloat(order.total_amount || '0'),
          orderStatus: order.order_status || 'pending',
          paymentStatus: order.payment_status || 'pending',
          createdAt: order.created_at || new Date().toISOString(),
          items: order.items || [],
          customerName: order.customer_name || '',
          shippingAddress: order.shipping_address_detail,
          invoiceId: order.invoice_id,
          tokenShortfallCharge: parseFloat(order.token_shortfall_charge || '0'),
        }));

        mappedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setGroupedOrders(mappedOrders);
        setTotalCount(response.count || mappedOrders.length);
        setNextUrl(response.next || null);
        setPreviousUrl(response.previous || null);
      } catch (error: any) {
        console.error('Failed to fetch orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setOrdersLoading(false);
      }
    };

    if (!loading) {
      fetchOrders();
    }
  }, [loading]);

  const handleNextPage = () => {
    if (nextUrl) {
      setCurrentPage(prev => prev + 1);
      const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
          const apiResponse = await api.get(nextUrl.replace(api.defaults.baseURL, ''));
          const response = apiResponse.data;
          const orders = response.results || response || [];

          const mappedOrders: GroupedOrder[] = (Array.isArray(orders) ? orders : []).map((order: Order) => ({
            orderId: order.order_id || order.id,
            id: order.id,
            totalAmount: parseFloat(order.total_amount || '0'),
            orderStatus: order.order_status || 'pending',
            paymentStatus: order.payment_status || 'pending',
            createdAt: order.created_at || new Date().toISOString(),
            items: order.items || [],
            customerName: order.customer_name || '',
            shippingAddress: order.shipping_address_detail,
            invoiceId: order.invoice_id,
            tokenShortfallCharge: parseFloat(order.token_shortfall_charge || '0'),
          }));

          mappedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setGroupedOrders(mappedOrders);
          setNextUrl(response.next || null);
          setPreviousUrl(response.previous || null);
        } catch (error: any) {
          console.error('Failed to fetch orders:', error);
          toast.error('Failed to load orders');
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  };

  const handlePreviousPage = () => {
    if (previousUrl) {
      setCurrentPage(prev => Math.max(1, prev - 1));
      const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
          const apiResponse = await api.get(previousUrl.replace(api.defaults.baseURL, ''));
          const response = apiResponse.data;
          const orders = response.results || response || [];

          const mappedOrders: GroupedOrder[] = (Array.isArray(orders) ? orders : []).map((order: Order) => ({
            orderId: order.order_id || order.id,
            id: order.id,
            totalAmount: parseFloat(order.total_amount || '0'),
            orderStatus: order.order_status || 'pending',
            paymentStatus: order.payment_status || 'pending',
            createdAt: order.created_at || new Date().toISOString(),
            items: order.items || [],
            customerName: order.customer_name || '',
            shippingAddress: order.shipping_address_detail,
            invoiceId: order.invoice_id,
            tokenShortfallCharge: parseFloat(order.token_shortfall_charge || '0'),
          }));

          mappedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          setGroupedOrders(mappedOrders);
          setNextUrl(response.next || null);
          setPreviousUrl(response.previous || null);
        } catch (error: any) {
          console.error('Failed to fetch orders:', error);
          toast.error('Failed to load orders');
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }) + ' at ' + new Date(dateString).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleDownloadInvoice = async (order: GroupedOrder) => {
    setDownloadingOrderId(order.id);
    try {
      // Use UUID (order.id) and invoiceId if available
      const blob = await orderService.downloadInvoice(order.id, order.invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${order.orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      const msg = error.response?.data?.detail || error.message || 'Failed to download invoice';
      toast.error(msg);
    } finally {
      setDownloadingOrderId(null);
    }
  };

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
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-sans font-bold uppercase tracking-wider ${classes}`}>
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
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-sans font-extrabold uppercase tracking-wider ${classes}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <h2 className="font-display text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          My Orders
        </h2>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-wider uppercase bg-zinc-50 dark:bg-zinc-800/50 px-2.5 py-1 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50">
          {totalCount} Total
        </span>
      </div>

      {ordersLoading || loading ? (
        <div className="flex items-center gap-2 py-4">
          <svg className="animate-spin h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-zinc-400 font-sans text-xs tracking-wider uppercase font-semibold">Loading orders history...</p>
        </div>
      ) : groupedOrders.length > 0 ? (
        <>
          <div className="space-y-6">
            {groupedOrders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-5 rounded-2xl transition-all duration-300 hover:border-zinc-200 dark:hover:border-zinc-700/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100/80 dark:border-zinc-800/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
                        Order #{order.orderId.slice(0, 8)}
                      </p>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <p className="text-[10px] text-zinc-450 dark:text-zinc-400 font-bold font-sans mt-1">
                      Ordered on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50">{formatPriceExact(order.totalAmount)}</p>
                      {order.tokenShortfallCharge && order.tokenShortfallCharge > 0 ? (
                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 mt-0.5">
                          Shortage: +{formatPriceExact(order.tokenShortfallCharge)}
                        </p>
                      ) : null}
                      {/* <div className="mt-1">{getPaymentBadge(order.paymentStatus)}</div>  */}
                    </div>
                    <Link to={`/order/${order.id}`} className="p-2 rounded-xl border border-zinc-100 hover:border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all duration-300">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Order items preview */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Items ordered</p>
                    <div className="space-y-2 bg-zinc-50/40 dark:bg-zinc-900/50 border border-zinc-100/30 dark:border-zinc-850 p-4 rounded-xl">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100/10 dark:border-zinc-800/10 last:border-0 last:pb-0">
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{item.product_name}</p>
                            {(item.selected_color || item.selected_size) && (
                              <p className="text-[10px] text-zinc-455 dark:text-zinc-400 font-bold mt-0.5">
                                {[item.selected_color, item.selected_size].filter(Boolean).join(' / ')}
                              </p>
                            )}
                          </div>
                          <p className="text-zinc-950 dark:text-zinc-50 font-semibold whitespace-nowrap ml-2">
                            {item.quantity} × {formatPriceExact(parseFloat(item.price || '0'))}
                          </p>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-1.5 text-right uppercase tracking-wider">
                          + {order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer and Shipping Info with Download Button */}
                <div className="border-t border-zinc-100/85 dark:border-zinc-800/85 pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  {order.shippingAddress ? (
                    <div className="text-xs space-y-1">
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Shipping to</p>
                      <p className="font-bold text-zinc-900 dark:text-zinc-50">{order.shippingAddress.full_name}</p>
                      <p className="text-zinc-400 dark:text-zinc-500 text-[10px] leading-relaxed">
                        {order.shippingAddress.address_line1}
                        {order.shippingAddress.address_line2 && `, ${order.shippingAddress.address_line2}`}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs space-y-1">
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase">Shipping Details</p>
                      <p className="text-zinc-400 dark:text-zinc-500 italic">No address details available</p>
                    </div>
                  )}
                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    disabled={downloadingOrderId === order.id}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition-all duration-300 disabled:opacity-50 whitespace-nowrap flex-shrink-0 shadow-sm"
                  >
                    {downloadingOrderId === order.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        Invoice PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalCount > 10 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-zinc-150 dark:border-zinc-800">
              <p className="text-xs text-zinc-450 dark:text-zinc-400 font-bold font-sans">
                Showing {groupedOrders.length} of {totalCount} orders
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={!previousUrl}
                  className="px-3.5 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-850 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-bold font-sans">
                  Page {currentPage}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!nextUrl}
                  className="px-3.5 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-850 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-850 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-zinc-50/40 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-850 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 bg-zinc-100/50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100/50">
            <Package className="w-6 h-6 text-zinc-450 dark:text-zinc-500" />
          </div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">No Orders Yet</p>
          <p className="text-xs text-zinc-450 dark:text-zinc-400">Once you make a purchase, your orders will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
