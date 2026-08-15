import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '@/services/cart.service';
import { useSettingsStoreBase } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';

export interface CartItem {
  productId: string;
  color: string;
  size: string;
  quantity: number;
  // Additional fields from API response or when adding to cart
  cartItemId?: string;
  productName?: string;
  productNameAr?: string;
  // optional price snapshot (string) from server, e.g. "500.00"
  priceSnapshot?: string | null;
  productImage?: string;
  // Price fields for each currency
  price_inr?: string;
  price_usd?: string;
  price_gbp?: string;
  sale_price_inr?: string;
  sale_price_usd?: string;
  sale_price_gbp?: string;
  // Points required for the product
  required_points?: number;
  // Stock available for the product
  stock?: number;
}

// Helper functions for pending cart items
const PENDING_CART_KEY = 'hov_pending_cart_items';

const savePendingCartItem = (item: CartItem) => {
  try {
    const existing = JSON.parse(localStorage.getItem(PENDING_CART_KEY) || '[]');
    const existingIndex = existing.findIndex(
      (i: CartItem) => i.productId === item.productId && i.color === item.color && i.size === item.size
    );
    
    if (existingIndex >= 0) {
      existing[existingIndex].quantity += item.quantity;
    } else {
      existing.push(item);
    }
    
    localStorage.setItem(PENDING_CART_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to save pending cart item:', error);
  }
};

const getPendingCartItems = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_CART_KEY) || '[]');
  } catch (error) {
    console.error('Failed to get pending cart items:', error);
    return [];
  }
};

const clearPendingCartItems = () => {
  try {
    localStorage.removeItem(PENDING_CART_KEY);
  } catch (error) {
    console.error('Failed to clear pending cart items:', error);
  }
};

const getPendingCartItemsCount = (): number => {
  try {
    const items = JSON.parse(localStorage.getItem(PENDING_CART_KEY) || '[]');
    return items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
  } catch (error) {
    console.error('Failed to get pending cart items count:', error);
    return 0;
  }
};

interface CartState {
  cartItems: CartItem[];
  cartId: string | null;
  cart_count: number;
  subtotal: number;
  total_amount: number;
  total_required_points: number;
  gst_amount: number;
  isAddingToCart: boolean;
  addToCart: (item: CartItem) => Promise<void>;
  // Load a single cart by id and replace local cart
  loadCartFromServer: (cartId: string) => Promise<void>;
  // Load list of carts and populate the store (uses first cart in results)
  loadCartList: () => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  // New method to process pending cart items after login
  processPendingCartItems: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cartItems: [],
      cartId: null,
      cart_count: 0,
      subtotal: 0,
      total_amount: 0,
      total_required_points: 0,
      gst_amount: 0,
      isAddingToCart: false,
      
      addToCart: async (item) => {
        set({ isAddingToCart: true });
        
        try {
          // Check if user is authenticated
          const isAuthenticated = useAuthStore.getState().isAuthenticated;
          if (!isAuthenticated) {
            // Save item to pending cart items
            savePendingCartItem(item);
            set({ isAddingToCart: false });
            
            // Show toast notification
            import('sonner').then(({ toast }) => {
              toast.success('Item saved! Please sign in to complete your purchase.');
            });
            
            // Redirect to login page
            window.location.href = '/signin';
            return;
          }
          
          // Get current currency from settings store
          const currency = useSettingsStoreBase.getState().currency;
          
          // Call the API to add item to cart
          await cartService.addItem({
            product: item.productId,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
            currency,
          });
          
          // Update local state after successful API call
          set((state) => {
            const existingIndex = state.cartItems.findIndex(
              (i) => i.productId === item.productId && i.color === item.color && i.size === item.size
            );
            
            let newItems;
            if (existingIndex >= 0) {
              newItems = [...state.cartItems];
              newItems[existingIndex] = {
                ...newItems[existingIndex],
                quantity: newItems[existingIndex].quantity + item.quantity,
              };
            } else {
              newItems = [...state.cartItems, {
                productId: item.productId,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                productImage: item.productImage,
                productName: item.productName,
                productNameAr: item.productNameAr,
                required_points: item.required_points,
              }];
            }
            
            return {
              cartItems: newItems,
              cart_count: newItems.length,
              isAddingToCart: false,
            };
          });
        } catch (error: any) {
          set({ isAddingToCart: false });
          throw error;
        }
      },

        // Load cart from server and replace local cartItems
        loadCartFromServer: async (cartId: string) => {
          try {
            const data = await cartService.getCart(cartId);
            // Map API response items to local CartItem shape
            const items = (data.items || []).map((it: any) => {
              const prod = it.product;
              const productId = prod && typeof prod === 'object' ? prod.id : prod;
              return {
                productId,
                color: it.selected_color || it.color || '',
                size: it.selected_size || it.size || '',
                quantity: Number(it.quantity) || 1,
                priceSnapshot: it.price_snapshot || null,
                cartItemId: it.id,
                productName: prod?.name_en || undefined,
                productNameAr: prod?.name_ar || undefined,
                productImage: prod?.image?.url || prod?.primary_image || undefined,
                price_inr: prod?.price_inr,
                price_usd: prod?.price_usd,
                price_gbp: prod?.price_gbp,
                sale_price_inr: prod?.sale_price_inr,
                sale_price_usd: prod?.sale_price_usd,
                sale_price_gbp: prod?.sale_price_gbp,
                required_points: prod?.required_points,
                stock: prod?.stock,
              };
            });
            // Use values from API response
            const cartCount = data.cart_count !== undefined ? data.cart_count : items.reduce((s, i) => s + i.quantity, 0);
            const subtotal = data.subtotal || 0;
            const totalAmount = data.total_amount || 0;
            const totalRequiredPoints = data.total_required_points || 0;
            // Calculate GST from API response (total - subtotal) or use explicit GST field
            const gstAmount = data.gst_amount || data.tax_amount || (totalAmount && subtotal ? totalAmount - subtotal : 0);
            
            set({ 
              cartItems: items, 
              cart_count: cartCount,
              subtotal,
              total_amount: totalAmount,
              total_required_points: totalRequiredPoints,
              gst_amount: gstAmount
            });
          } catch (err: any) {
            // Silently fail on cart load
          }
        },

        // Load list of carts and populate the store using the first cart in results
        loadCartList: async () => {
          try {
            const data = await cartService.listCarts();
            const first = data?.results?.[0];
            if (!first) {
              // no carts yet
              set({ 
                cartItems: [], 
                cart_count: 0,
                subtotal: 0,
                total_amount: 0,
                total_required_points: 0
              });
              return;
            }
            
            // Get current local items to preserve color/size selections
            const currentState = (set as any).getState?.() || {};
            const localItems = currentState.cartItems || [];
            
            const items = (first.items || []).map((it: any) => {
              // Try to find matching local item to preserve color/size
              const localItem = localItems.find(
                li => li.productId === (it.product?.id || it.product)
              );
              
              return {
                cartItemId: it.id,
                productId: it.product?.id || it.product,
                productName: it.product?.name_en || '',
                productNameAr: it.product?.name_ar || '',
                productImage: it.product?.image?.url || '',
                priceSnapshot: it.price_snapshot || '0',
                color: it.selected_color || it.color || localItem?.color || (it.product?.image?.color || ''),
                size: it.selected_size || it.size || localItem?.size || '',
                quantity: Number(it.quantity) || 1,
                // Store all price fields from product
                price_inr: it.product?.price_inr,
                price_usd: it.product?.price_usd,
                price_gbp: it.product?.price_gbp,
                sale_price_inr: it.product?.sale_price_inr,
                sale_price_usd: it.product?.sale_price_usd,
                sale_price_gbp: it.product?.sale_price_gbp,
                required_points: it.product?.required_points,
                stock: it.product?.stock,
              };
            });
            
            // Use values from API response
            const cartCount = first.cart_count !== undefined ? first.cart_count : items.reduce((s, i) => s + i.quantity, 0);
            const subtotal = first.subtotal || 0;
            const totalAmount = first.total_amount || 0;
            const totalRequiredPoints = first.total_required_points || 0;
            // Calculate GST from API response (total - subtotal) or use explicit GST field
            const gstAmount = first.gst_amount || first.tax_amount || (totalAmount && subtotal ? totalAmount - subtotal : 0);
            
            console.log('Cart GST Calculation:', {
              totalAmount,
              subtotal,
              calculatedGST: totalAmount - subtotal,
              finalGST: gstAmount
            });
            
            set({ 
              cartItems: items, 
              cartId: first.id, 
              cart_count: cartCount,
              subtotal,
              total_amount: totalAmount,
              total_required_points: totalRequiredPoints,
              gst_amount: gstAmount
            });
          } catch (err: any) {
            // Silently fail on cart list load
          }
        },

      removeFromCart: async (cartItemId: string) => {
        try {
          // Call API to delete the item
          await cartService.deleteItem(cartItemId);
          
          // Reload cart data from API to get updated totals
          const state = useCartStore.getState();
          await state.loadCartList();
        } catch (error: any) {
          // Silently fail on item removal
        }
      },

      updateCartQuantity: async (cartItemId: string, quantity: number) => {
        if (quantity < 1) return;
        
        try {
          // Call API to update quantity
          await cartService.updateItem(cartItemId, quantity);
          
          // Reload cart data from API to get updated totals
          const state = useCartStore.getState();
          await state.loadCartList();
        } catch (error: any) {
          // Silently fail on quantity update
        }
      },

      clearCart: () => set({ 
        cartItems: [], 
        cart_count: 0, 
        subtotal: 0,
        total_amount: 0,
        total_required_points: 0,
        gst_amount: 0,
        isAddingToCart: false 
      }),

      processPendingCartItems: async () => {
        const pendingItems = getPendingCartItems();
        if (pendingItems.length === 0) return;

        try {
          // Get current currency from settings store
          const currency = useSettingsStoreBase.getState().currency;
          
          let successCount = 0;
          
          // Add each pending item to cart
          for (const item of pendingItems) {
            try {
              await cartService.addItem({
                product: item.productId,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
                currency,
              });
              successCount++;
            } catch (error) {
              console.error('Failed to add pending cart item:', error);
              // Continue with other items even if one fails
            }
          }
          
          // Clear pending items after processing
          clearPendingCartItems();
          
          // Show success toast if items were added
          if (successCount > 0) {
            // Import toast dynamically to avoid circular dependency
            import('sonner').then(({ toast }) => {
              const itemText = successCount === 1 ? 'item' : 'items';
              toast.success(`${successCount} ${itemText} restored to your cart`);
            });
          }
          
          // Reload cart from server to get updated state
          await useCartStore.getState().loadCartList();
        } catch (error) {
          console.error('Failed to process pending cart items:', error);
        }
      },
    }),
    {
      name: 'hov_cart_storage',
      partialize: (state) => ({
        cartItems: state.cartItems,
        cartId: state.cartId,
        cart_count: state.cart_count,
        subtotal: state.subtotal,
        total_amount: state.total_amount,
        total_required_points: state.total_required_points,
        gst_amount: state.gst_amount,
      }),
    }
  )
);
