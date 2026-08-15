import { useQuery } from '@tanstack/react-query';
import bannerService, { Banner, BannerFilters } from '@/services/banner.service';

export const useBanners = (filters?: BannerFilters) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['banners', filters],
    queryFn: () => bannerService.getBanners(filters),
  });

  return {
    banners: data?.results || [],
    loading: isLoading,
    error: error?.message || null,
  };
};
