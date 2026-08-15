import { useQuery } from '@tanstack/react-query';
import productService, { ProductFilters } from '@/services/product.service';
import { useSettingsStoreBase } from '@/store/useSettingsStore';

interface UseNewProductsOptions {
  status?: string;
  category?: string;
  is_featured?: boolean;
  ordering?: string;
}

export const useNewProducts = (options?: UseNewProductsOptions) => {
  const currency = useSettingsStoreBase((state) => state.currency);
  
  const filters: ProductFilters = {
    status: options?.status || 'active',
    category: options?.category,
    is_featured: options?.is_featured,
    ordering: options?.ordering,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['newProducts', currency, filters, 'v2'], // Added version for cache invalidation
    queryFn: () => productService.getNewProducts(filters),
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
