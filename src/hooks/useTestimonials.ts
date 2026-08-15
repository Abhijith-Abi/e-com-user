import { useQuery } from '@tanstack/react-query';
import bannerService, { Testimonial } from '@/services/banner.service';

export const useTestimonials = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => bannerService.getTestimonials(),
  });

  return {
    testimonials: data?.results || [],
    loading: isLoading,
    error: error?.message || null,
  };
};
