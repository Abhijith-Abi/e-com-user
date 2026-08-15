import api from './api';

export interface AddToCartRequest {
  product: string;
  quantity: number;
  color?: string;
  size?: string;
  currency?: string;
}

export interface BuyDirectRequest {
  product: string;
  quantity: number;
  color?: string;
  size?: string;
  currency?: string;
}

export interface BuyCheckoutRequest {
  product: string;
  quantity: number;
  warehouse: string;
  currency: string;
  payment_method: string;
  address_id?: string;
  coupon_code?: string;
  color?: string;
  size?: string;
}

export interface CartItemResponse {
  id: string;
  product_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  quantity: number;
  price_snapshot: string;
  cart: string;
  stock: string;
  product: string;
}

export const cartService = {
  addItem: async (data: AddToCartRequest): Promise<CartItemResponse> => {
    const response = await api.post('/cart/carts/add_item/', data);
    return response.data;
  },
  // Get cart details by cart id
  getCart: async (id: string): Promise<any> => {
    const response = await api.get(`/cart/carts/${id}/`);
    return response.data;
  },
  // List carts (paginated)
  listCarts: async (): Promise<any> => {
    const response = await api.get('/cart/carts/');
    return response.data;
  },
  // Delete cart item
  deleteItem: async (itemId: string): Promise<void> => {
    await api.delete(`/cart/items/${itemId}/`);
  },
  // Update cart item quantity
  updateItem: async (itemId: string, quantity: number): Promise<CartItemResponse> => {
    const response = await api.patch(`/cart/items/${itemId}/`, { quantity });
    return response.data;
  },
  // Checkout a cart
  checkout: async (cartId: string, warehouse: string, currency: string, paymentMethod: string, couponCode?: string): Promise<any> => {
    const payload: any = { warehouse, currency, payment_method: paymentMethod };
    if (couponCode) payload.coupon_code = couponCode;
    const response = await api.post(`/cart/carts/${cartId}/checkout/`, payload);
    return response.data;
  },
  // Buy product directly without adding to cart
  buyDirect: async (data: BuyDirectRequest): Promise<any> => {
    const response = await api.post('/cart/buy/', data);
    return response.data;
  },

  // Buy product directly with checkout (buy-checkout endpoint)
  buyCheckout: async (data: BuyCheckoutRequest): Promise<any> => {
    const response = await api.post('/cart/items/buy-checkout/', data);
    return response.data;
  },
};
