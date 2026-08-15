import api from './api';
import { cartService } from './cart.service';
import { useAuthStore } from '@/store/useAuthStore';

// Subscribe to auth store changes to update cache
useAuthStore.subscribe((state) => {
  if (state.customerId && state.customerId !== cachedCustomerId) {
    cachedCustomerId = state.customerId;
  }
});

export interface AddToWishlistRequest {
  product: string;
  customer:string;
}

export interface WishlistItem {
  id: string;
  created_at: string;
  updated_at: string;
  customer: string;
  product: string;
  product_detail?: {
    id: string;
    name_en: string;
    name_ar: string;
    sku: string;
    price_inr: string;
    price_gbp: string | null;
    price_usd: string;
    sale_price_inr: string | null;
    sale_price_gbp: string | null;
    sale_price_usd: string | null;
    stock: number;
    colors: string[];
    sizes: string[];
    image: {
      id: string;
      url: string;
      color: string;
    };
  };
}

export interface WishlistResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WishlistItem[];
}

// Cache customer ID to avoid multiple API calls
let cachedCustomerId: string | null = null;

const getCustomerId = async (): Promise<string | null> => {
  // First try to get customer ID from auth store (persisted in localStorage)
  try {
    const authState = useAuthStore.getState();
    
    // Use customerId if available (this is the correct customer_id from register response)
    if (authState.customerId) {
      cachedCustomerId = authState.customerId;
      return cachedCustomerId;
    }
    
    // Fallback to user.id if customerId is not set
    if (authState.user?.id) {
      console.warn('[wishlist] customerId not found, falling back to user.id');
      cachedCustomerId = authState.user.id;
      return cachedCustomerId;
    }
  } catch (authError) {
    console.error('[wishlist] Failed to get customer ID from auth store:', authError);
  }

  // Fallback: Get customer ID from cart API
  try {
    const cartData = await cartService.listCarts();
    if (cartData.results && cartData.results.length > 0) {
      cachedCustomerId = cartData.results[0].customer;
      return cachedCustomerId;
    }
  } catch (cartError) {
    console.error('[wishlist] Failed to get customer ID from cart:', cartError);
  }

  console.warn('[wishlist] Unable to get customer ID from any source');
  return null;
};

export const wishlistService = {
  // Clear cached customer ID (useful when switching users)
  clearCache: () => {
    cachedCustomerId = null;
  },

  // Add item to wishlist
  addItem: async (data: AddToWishlistRequest): Promise<WishlistItem> => {
    const customerId = await getCustomerId();

    // Require customer id: if we don't have it, fail early with a clear message
    if (!customerId) {
      console.error('[wishlist] Cannot add to wishlist: customer ID not found.');
      console.error('[wishlist] Auth state:', useAuthStore.getState());
      throw new Error('Customer ID not found. Please sign in or create a profile before adding to wishlist.');
    }

    const payload = {
      customer: customerId,
      product: data.product,
    };


    try {
      const response = await api.post('/customers/wishlists/', payload);
      return response.data;
    } catch (error: any) {
      console.error('[wishlist] API error:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      });
      throw error;
    }
  },

  // Get all wishlist items
  getWishlist: async (): Promise<WishlistResponse> => {
    const customerId = await getCustomerId();
    const params: any = {};
    
    if (customerId) {
      params.customer = customerId;
    }
    
    const response = await api.get('/customers/wishlists/', { params });
    return response.data;
  },

  // Remove item from wishlist
  removeItem: async (wishlistItemId: string): Promise<void> => {
    await api.delete(`/customers/wishlists/${wishlistItemId}/`);
  },
};

export default wishlistService;
