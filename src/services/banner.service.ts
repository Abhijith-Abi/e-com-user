import api from './api';

export interface Banner {
  id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  headline_en: string;
  headline_ar: string;
  sub_paragraph_en: string;
  sub_text_en: string;
  sub_text_ar: string;
  cta_label_en: string;
  cta_label_ar: string;
  link: string;
  device: 'mobile' | 'desktop' | 'both';
  status: 'active' | 'inactive';
  image?: string;
}

export interface BannersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Banner[];
}

export interface BannerFilters {
  device?: 'mobile' | 'desktop' | 'both';
  ordering?: string;
  page?: number;
  search?: string;
  status?: 'active' | 'inactive';
  warehouse?: string;
}

export interface Testimonial {
  id: string;
  warehouse_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  name_en: string;
  name_ar: string;
  review_en: string;
  review_ar: string;
  content_en: string;
  content_ar: string;
  city_en: string;
  city_ar: string;
  status: 'active' | 'inactive';
  warehouse: string;
}

export interface TestimonialsResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Testimonial[];
}

const bannerService = {
  // Get all banners with optional filters
  getBanners: async (filters?: BannerFilters): Promise<BannersResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.device) params.append('device', filters.device);
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.warehouse) params.append('warehouse', filters.warehouse);
    
    const queryString = params.toString();
    const url = `/banners/banners/${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<BannersResponse>(url);
    return response.data;
  },

  // Get banners for a specific warehouse
  getWarehouseBanners: async (warehouseId: string, filters?: Omit<BannerFilters, 'warehouse'>): Promise<BannersResponse> => {
    return bannerService.getBanners({ ...filters, warehouse: warehouseId });
  },

  // Get single banner by ID
  getBannerById: async (id: string): Promise<Banner> => {
    const response = await api.get<Banner>(`/banners/${id}/`);
    return response.data;
  },

  // Get testimonials
  getTestimonials: async (): Promise<TestimonialsResponse> => {
    const response = await api.get<Testimonial[] | TestimonialsResponse>('/banners/testimonials/');
    
    // Handle both array and paginated response formats
    if (Array.isArray(response.data)) {
      return { results: response.data };
    }
    return response.data;
  },
};

export default bannerService;
