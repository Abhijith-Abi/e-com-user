import { useQuery } from '@tanstack/react-query';
import productService from '@/services/product.service';
import { useSettingsStoreBase } from '@/store/useSettingsStore';

interface UseBestSellersOptions {
  category?: string;
  sub_category?: string;
  type?: string;
  months?: number;
  limit?: number;
  status?: string;
}

export const useBestSellers = (options?: UseBestSellersOptions) => {
  const currency = useSettingsStoreBase((state) => state.currency);

  const { data, isLoading, error } = useQuery({
    queryKey: ['bestSellers', currency, options, 'v2'], // Added version to force cache invalidation
    queryFn: () => productService.getBestSellers({
      ...options,
      status: options?.status || 'active', // Default to active status
    }),
    staleTime: 0, // Temporarily disable cache to force fresh data
    cacheTime: 0, // Don't cache the result
  });

  // Client-side filtering as backup to ensure no out_of_stock products are shown
  const filteredProducts = (data?.results || []).filter(product => 
    product.status === 'active' && product.status !== 'out_of_stock'
  );

  return {
    products: filteredProducts,
    loading: isLoading,
    error: error?.message || null,
  };
};
