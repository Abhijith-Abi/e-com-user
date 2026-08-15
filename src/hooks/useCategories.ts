import { useQuery } from '@tanstack/react-query';
import categoryService, { Category, CategoryFilters } from '@/services/category.service';
import { useSettingsStoreBase } from '@/store/useSettingsStore';

export const useCategories = (filters?: CategoryFilters) => {
  const currency = useSettingsStoreBase((state) => state.currency);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories', currency, filters],
    queryFn: async () => {
      const result = await categoryService.getCategories(filters);
      return result;
    },
  });

  return {
    categories: data?.results || [],
    loading: isLoading,
    error: error?.message || null,
  };
};
