import { useQuery } from '@tanstack/react-query';
import productService from '@/services/product.service';
import { useSettingsStoreBase } from '@/store/useSettingsStore';

interface UseFeaturedProductsOptions {
  status?: string;
  limit?: number;
}

export const useFeaturedProducts = (options?: UseFeaturedProductsOptions) => {
  const currency = useSettingsStoreBase((state) => state.currency);

  const { data, isLoading, error } = useQuery({
    queryKey: ['featuredProducts', currency, options, 'v2'], // Added version for cache invalidation
    queryFn: () => productService.getProducts({
      status: options?.status || 'active',
      is_featured: true,
    }),
    staleTime: 0, // Temporarily disable cache
    cacheTime: 0, // Don't cache
  });

  // Client-side filtering as backup
  const filteredProducts = (data?.results || []).filter(product => 
    product.status === 'active' && product.status !== 'out_of_stock'
  );

  return {
    products: filteredProducts,
    loading: isLoading,
    error: error?.message || null,
  };
};
