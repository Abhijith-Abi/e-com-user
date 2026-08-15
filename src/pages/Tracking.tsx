import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Clock, ExternalLink, Search, User, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import trackingService from '@/services/tracking.service';

interface TimelineEvent {
  step: number;
  status: string;
  timestamp: string | null;
  message: string;
  current: boolean;
}

interface OrderDetail {
  order_id: string;
  tracking_number: string | null;
  product_name: string;
  product_uid: string;
  order_status: string;
  selected_size: string;
  selected_color: string;
  quantity: number;
  price: string;
  order_date: string;
  timeline: TimelineEvent[];
}

const Tracking = () => {
  const { user, customerId } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<OrderDetail[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const statusConfig: Record<string, { label: string; color: string; step: number }> = {
    PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700', step: 1 },
    CONFIRMED: { label: 'Confirmed', color: 'bg-primary/20 text-primary', step: 2 },
    PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-700', step: 3 },
    SHIPPED: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', step: 4 },
    DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700', step: 5 },
  };

const StatusTimeline = ({ timeline }: { timeline: TimelineEvent[] }) => {
  const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStep = Math.max(...timeline.filter(t => t.timestamp).map(t => t.step), 1);

  return (
    <div className="flex items-center gap-0 w-full mt-4">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const active = stepNum <= currentStep;
        const current = stepNum === currentStep;
        return (
          <div key={step} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-3 h-3 rounded-full border-2 transition-colors ${
                  active ? 'bg-primary border-primary' : 'bg-background border-muted-foreground/30'
                } ${current ? 'ring-2 ring-primary/20' : ''}`}
              />
              <p
                className={`text-[10px] mt-1.5 text-center leading-tight ${
                  active ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {step}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mt-[-12px] ${
                  stepNum < currentStep ? 'bg-primary' : 'bg-muted-foreground/20'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-8">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-display text-xl font-bold mb-2">Sign In Required</h1>
          <p className="text-sm text-muted-foreground mb-6">Please sign in to track your orders and view your history.</p>
          <Button asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  // When search query or user/customer changes, reset page to 1 (don't fetch here)
  React.useEffect(() => {
    if (user && customerId) {
      setCurrentPage(1);
    }
  }, [user, customerId, searchQuery]);

  // Fetch user orders when page changes or when search query changes (after page reset)
  React.useEffect(() => {
    if (user && customerId) {
      fetchUserOrders();
    }
  }, [user, customerId, currentPage, searchQuery]);

  const fetchUserOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError(null);
      if (!customerId) {
        setOrdersError('Customer ID not found');
        return;
      }
      const response = await trackingService.getCustomerOrders(customerId, currentPage, pageSize, searchQuery);
      // Based on your API response structure: { status, message, pagination, data }
      setUserOrders(response.data || []);
      setTotalCount(response.pagination?.total_items || 0);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setOrdersError('Failed to load your orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes('DELIVERED')) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (statusUpper.includes('SHIPPED') || statusUpper.includes('IN TRANSIT')) return <Truck className="w-5 h-5 text-primary" />;
    if (statusUpper.includes('PROCESSING')) return <Clock className="w-5 h-5 text-yellow-500" />;
    if (statusUpper.includes('CONFIRMED')) return <CheckCircle2 className="w-5 h-5 text-primary" />;
    return <Package className="w-5 h-5 text-gray-500" />;
  };

  const filteredOrders = userOrders;

  return (
    <main className="min-h-screen bg-secondary/30">
      <section className="bg-primary text-primary-foreground py-10 md:py-14">
        <div className="container max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase mb-3 text-accent">Order Status</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">Track Your Shipment</h1>
          <p className="text-sm opacity-80 mb-6">Enter your order number or tracking ID to see real-time updates on your delivery.</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Order Number or Tracking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background text-foreground"
            />
          </div>
        </div>
      </section>

      <section className="container py-8 md:py-12 max-w-3xl mx-auto">
        {ordersError && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-md mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{ordersError}</p>
          </div>
        )}

        {loadingOrders ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-display font-bold mb-1">No Orders Found</p>
            <p className="text-sm text-muted-foreground">
              {userOrders.length === 0 ? 'You have no orders yet.' : 'We couldn\'t find any orders matching your search query.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.order_status] || statusConfig['PENDING'];
              const isSelected = selectedOrderId === order.order_id;

              return (
                <div key={order.order_id} className="bg-background rounded-sm p-5 md:p-6 border border-border/50">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-display text-sm font-bold">{order.order_id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.order_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })} at {new Date(order.order_date).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-1">
                    {order.product_name} ({order.selected_color}, {order.selected_size})
                  </p>
                  <p className="text-sm font-semibold">₹{order.price}</p>

                  {/* Timeline */}
                  <StatusTimeline timeline={order.timeline} />

                  {/* Timeline details */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrderId(isSelected ? null : order.order_id)}
                      className="text-xs"
                    >
                      {isSelected ? 'Hide Timeline' : 'View Timeline'}
                    </Button>

                    {/* Timeline events */}
                    {isSelected && order.timeline && order.timeline.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs font-semibold text-foreground">Order Timeline</p>
                        {order.timeline.map((event, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              {getStatusIcon(event.status)}
                              {idx < order.timeline.length - 1 && (
                                <div className="w-0.5 h-8 bg-border mt-1" />
                              )}
                            </div>
                            <div className="pb-2">
                              <p className="text-xs font-semibold text-foreground">{event.status}</p>
                              <p className="text-xs text-muted-foreground">{event.message}</p>
                              {event.timestamp && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(event.timestamp).toLocaleString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Tracking;
