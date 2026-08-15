import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistService, type WishlistItem } from '@/services/wishlist.service';
import { toast } from 'sonner';

interface WishlistState {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  loadWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      isLoading: false,
      
      loadWishlist: async () => {
        try {
          set({ isLoading: true });
          const data = await wishlistService.getWishlist();
          set({ wishlistItems: data.results || [], isLoading: false });
        } catch (error: any) {
          console.error('Failed to load wishlist:', error);
          set({ isLoading: false });
          // Don't show error toast for auth issues
          if (error.response?.status !== 401) {
            toast.error('Failed to load wishlist');
          }
        }
      },

      toggleWishlist: async (productId) => {
        const state = get();
        const existingItem = state.wishlistItems.find(item => item.product === productId);
        
        try {
          
          if (existingItem) {
            // Remove from wishlist
            await wishlistService.removeItem(existingItem.id);
            set((state) => ({
              wishlistItems: state.wishlistItems.filter(item => item.product !== productId),
            }));
            toast.success('Removed from wishlist');
          } else {
            // Add to wishlist
            const newItem = await wishlistService.addItem({
              product: productId,
              customer: ''
            });
            set((state) => ({
              wishlistItems: [...state.wishlistItems, newItem],
            }));
            toast.success('Added to wishlist');
          }
        } catch (error: any) {
          console.error('[wishlist store] Failed to toggle wishlist:', error);
          // If the service threw a missing-customer error, prompt the user to sign in
          if (error?.message?.includes('Customer ID not found')) {
            toast.error('Please sign in to add items to your wishlist');
          } else {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update wishlist';
            toast.error(errorMessage);
          }
        }
      },

      isWishlisted: (productId) => {
        return get().wishlistItems.some(item => item.product === productId);
      },

      clearWishlist: () => set({ wishlistItems: [], isLoading: false }),
    }),
    {
      name: 'hov_wishlist_storage',
    }
  )
);
