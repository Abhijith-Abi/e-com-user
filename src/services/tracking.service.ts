import api from './api';
import orderService, { OrderDetail } from './order.service';

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface ShipmentTracking {
  id: string;
  order_id: string;
  tracking_number: string;
  courier_name: string;
  courier_tracking_url: string;
  status: string;
  estimated_delivery: string | null;
  last_updated: string;
  events: TrackingEvent[];
}

// Interface for your API response structure
export interface CustomerOrdersResponse {
  status: number;
  message: string;
  pagination: {
    current_page: number;
    total_pages: number;
    page_size: number;
    total_items: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
  data: Array<{
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
    timeline: Array<{
      step: number;
      status: string;
      timestamp: string | null;
      message: string;
      current: boolean;
    }>;
  }>;
}

const trackingService = {
  // Get customer orders with pagination using customer UUID
  getCustomerOrders: async (customerUuid: string, page: number = 1, pageSize: number = 10, search?: string): Promise<OrdersResponse> => {
    let url = `/orders/customer/${customerUuid}/items/?page=${page}&page_size=${pageSize}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Get tracking information for an order
  trackOrder: async (orderId: string): Promise<ShipmentTracking> => {
    try {
      // Fetch the order details which contains tracking info
      const order = await orderService.getOrder(orderId);
      
      // Build tracking object from order data
      const tracking: ShipmentTracking = {
        id: order.id,
        order_id: order.order_id,
        tracking_number: order.tracking_number || '',
        courier_name: order.courier_name || '',
        courier_tracking_url: order.courier_tracking_url || '',
        status: order.order_status || '',
        estimated_delivery: null,
        last_updated: order.updated_at,
        events: order.status_timeline?.map((timeline) => ({
          timestamp: timeline.reached_at || timeline.ordered_at || new Date().toISOString(),
          status: timeline.status,
          location: '',
          description: '',
        })) || [],
      };
      
      return tracking;
    } catch (error) {
      throw error;
    }
  },

  // Get tracking by tracking number
  trackByNumber: async (trackingNumber: string): Promise<ShipmentTracking> => {
    const response = await api.get(`/tracking/${trackingNumber}/`);
    return response.data;
  },
};

export default trackingService;
