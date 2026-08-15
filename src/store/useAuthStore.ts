import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  customerId: string | null;
  isSebastianCardUser?: boolean;
  sebastianCardData?: any;
  setAuth: (user: User, accessToken: string, refreshToken: string, customerId?: string) => void;
  setAccessToken: (token: string) => void;
  setCustomerId: (customerId: string) => void;
  logout: () => void;
  // Legacy support
  login: (profile: { name: string; email: string }) => void;
  setSebastianCardAuth: (
    customerData: any,
    accessToken?: string,
    refreshToken?: string,
    backendUser?: User,
    customerId?: string
  ) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      customerId: null,
      isSebastianCardUser: false,
      sebastianCardData: null,
      setAuth: (user, accessToken, refreshToken, customerId) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true, customerId: customerId || null, isSebastianCardUser: false, sebastianCardData: null });
        
        // Process any pending cart items after successful login
        setTimeout(() => {
          import('./useCartStore').then(({ useCartStore }) => {
            useCartStore.getState().processPendingCartItems();
          });
        }, 100);
      },
      setAccessToken: (token) => set({ accessToken: token }),
      setCustomerId: (customerId) => set({ customerId }),
      logout: () => {
        // Clear auth state
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, customerId: null, isSebastianCardUser: false, sebastianCardData: null });
        
        // Clear auth, cart and wishlist from localStorage
        // This ensures clean state for next user
        localStorage.removeItem('hov_auth_storage');
        localStorage.removeItem('hov_cart_storage');
        localStorage.removeItem('hov_wishlist_storage');

        // Force page reload to reset all stores
        window.location.href = '/';
      },
      // Legacy support for existing code
      login: (profile) => {
        set({
          user: {
            id: '',
            email: profile.email,
            full_name: profile.name,
            role: 'customer',
            selected_warehouse: null,
            selected_warehouse_name: null,
            selected_warehouse_location: null,
            is_verified: true,
            is_active: true,
          },
          isAuthenticated: true,
          isSebastianCardUser: false,
          sebastianCardData: null,
        });
        
        // Process any pending cart items after successful login
        setTimeout(() => {
          import('./useCartStore').then(({ useCartStore }) => {
            useCartStore.getState().processPendingCartItems();
          });
        }, 100);
      },
      setSebastianCardAuth: (customerData, accessToken, refreshToken, backendUser, customerId) => {
        set({
          user: backendUser || {
            id: String(customerData.id),
            email: customerData.email || '',
            full_name: customerData.customer_name,
            role: 'customer',
            selected_warehouse: null,
            selected_warehouse_name: null,
            selected_warehouse_location: null,
            is_verified: true,
            is_active: true,
          },
          accessToken: accessToken || null,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          customerId: customerId || String(customerData.id),
          isSebastianCardUser: true,
          sebastianCardData: customerData,
        });
        
        // Process any pending cart items after successful login
        setTimeout(() => {
          import('./useCartStore').then(({ useCartStore }) => {
            useCartStore.getState().processPendingCartItems();
          });
        }, 100);
      },
    }),
    {
      name: 'hov_auth_storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        customerId: state.customerId,
        isSebastianCardUser: state.isSebastianCardUser,
        sebastianCardData: state.sebastianCardData,
      }),
    }
  )
);
