
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStoreBase } from '@/store/useSettingsStore';
import { getWarehouseFromCurrency } from '@/lib/currency';

const api = axios.create({
  baseURL: 'https://ecom.abisolutions.online/api/v1/',
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request Interceptor: Attach Token and Warehouse ID
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Public endpoints that don't require authentication
const publicEndpoints = [
  '/warehouses',
  '/categories',
  '/products',
  '/banners',
];

const isPublicEndpoint = (url: string) => {
  return publicEndpoints.some(endpoint => url.includes(endpoint));
};

// Response Interceptor: Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Do not clear session or redirect to home page if the error occurred during login or signup requests.
    // However, refresh token requests should still trigger logout if they fail with 401/unauthorized.
    const isAuthRequest = url.includes('/auth/token/') && !url.includes('/auth/token/refresh/');
    const isRegisterRequest = url.includes('/auth/register/');
    const isAuthOrRegister = isAuthRequest || isRegisterRequest;

    // Handle 401 Unauthorized and 500 Internal Server Error
    if (!isAuthOrRegister && (status === 401 || status === 500 || !error.response)) {
      // Clear auth store
      useAuthStore.getState().logout();
      
      // Clear other stores
      try {
        localStorage.removeItem('hov_cart_storage');
        localStorage.removeItem('hov_wishlist_storage');
        localStorage.removeItem('hov_checkout_storage');
        localStorage.removeItem('hov_settings_storage');
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }

      // Reload the page
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default api;
