import { useNavigate } from 'react-router-dom';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export const useWishlistWithAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { toggleWishlist: storeToggleWishlist, ...rest } = useWishlistStore();

  const toggleWishlist = async (productId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your wishlist');
      navigate('/signin');
      return;
    }

    // Call the store's toggleWishlist method
    await storeToggleWishlist(productId);
  };

  return {
    toggleWishlist,
    ...rest,
  };
};
