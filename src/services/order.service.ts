import api from './api';
import warehouseService from './warehouse.service';

export interface NewAddressPayload {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PlaceOrderPayload {
  warehouse: string;
  currency: string;
  payment_method: string;
  coupon_code?: string;
  address_id?: string;
  new_address?: NewAddressPayload;
  gift_wrap_id?: string;
  gift_card_id?: string;
  gift_message?: string;
}

export interface OrderResponse {
  id: string;
  order_id: string;
  total_amount: string;
  order_status: string;
  payment_status: string;
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: string;
  product: string;
  order: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  selected_color?: string;
  selected_size?: string;
}

export interface ShippingAddress {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface StatusTimeline {
  status: string;
  reached_at: string | null;
  ordered_at?: string | null;
}

export interface GiftWrapDetail {
  id: string;
  wrap_name: string;
  charges: number;
}

export interface GiftCardDetail {
  id: string;
  card_name: string;
  discount: number;
}

export interface CancellationDetail {
  cancelled_by: string;
  reason?: string;
  message?: string;
}

export interface OrderDetail {
  id: string;
  order_id: string;
  items: OrderItem[];
  total_amount: string;
  tax_amount: string;
  discount_amount: string;
  currency: string;
  payment_status: string;
  order_status: string;
  customer: string;
  customer_name: string;
  customer_email: string;
  warehouse: string;
  created_at: string;
  updated_at: string;
  shipping_address_detail: ShippingAddress;
  applied_coupon_code: string | null;
  status_timeline: StatusTimeline[];
  payment_timeline: StatusTimeline[];
  tracking_number: string | null;
  courier_name: string | null;
  courier_tracking_url: string | null;
  applied_gift_wrap_detail: GiftWrapDetail | null;
  applied_gift_card_detail: GiftCardDetail | null;
  gift_wrap_charges: string;
  gift_card_discount: string;
  gst: string;
  invoice_id?: string;
  token_shortfall_charge?: string;
  cancellation_detail?: CancellationDetail | null;
}

export interface OrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderDetail[];
}

const orderService = {
  // Get active warehouse to use for orders
  getActiveWarehouse: async () => {
    const warehouses = await warehouseService.getWarehouses();
    const activeWarehouse = warehouses.results.find(w => w.is_active);
    
    if (!activeWarehouse) {
      throw new Error('No active warehouse found');
    }
    
    return activeWarehouse;
  },

  placeOrder: async (cartId: string, payload: PlaceOrderPayload): Promise<OrderResponse> => {
    // Always use the warehouse ID from API (stored in localStorage)
    const warehouseId = await warehouseService.getActiveWarehouseId();
    payload.warehouse = warehouseId;
    
    const response = await api.post(`/cart/carts/${cartId}/checkout/`, payload);
    return response.data;
  },

  // Get all order items for current user
  getOrders: async (): Promise<OrdersResponse> => {
    const response = await api.get('/orders/items/');
    return response.data;
  },

  // Get orders by order status
  getOrdersByStatus: async (orderStatus: string): Promise<OrdersResponse> => {
    const response = await api.get(`/orders/?order_status=${orderStatus}`);
    return response.data;
  },

  // Get orders by payment status
  getOrdersByPaymentStatus: async (paymentStatus: string): Promise<OrdersResponse> => {
    const response = await api.get(`/orders/?payment_status=${paymentStatus}`);
    return response.data;
  },

  // Get single order by ID
  getOrder: async (orderId: string): Promise<OrderDetail> => {
    const response = await api.get(`/orders/records/${orderId}/`);
    return response.data;
  },

  // Get all orders (replaces warehouse-specific endpoint)
  getAllOrders: async (): Promise<OrdersResponse> => {
    const response = await api.get(`/orders/records/?page_size=10`);
    return response.data;
  },

  // Download invoice PDF
  downloadInvoice: async (orderId: string, invoiceId?: string): Promise<Blob> => {
    // If invoiceId is provided, use the full endpoint structure
    const endpoint = invoiceId 
      ? `/orders/records/${orderId}/invoice/${invoiceId}`
      : `/orders/records/${orderId}/invoice/`;
    
    const response = await api.get(endpoint, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason?: string): Promise<OrderDetail> => {
    const payload: any = { order_id: orderId };
    if (reason) {
      payload.reason = reason;
    }
    const response = await api.post(`/orders/records/cancel/`, payload);
    return response.data;
  },

  // Buy product directly without adding to cart
  buyDirect: async (productId: string, quantity: number, color?: string, size?: string): Promise<OrderResponse> => {
    const warehouseId = await warehouseService.getActiveWarehouseId();
    const response = await api.post('/cart/items/buy/', {
      product: productId,
      quantity,
      color: color || '',
      size: size || '',
      warehouse: warehouseId,
    });
    return response.data;
  },
};

export default orderService;
