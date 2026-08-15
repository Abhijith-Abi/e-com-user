import api from './api';
import warehouseService from './warehouse.service';

// Helper to get warehouse ID - first from localStorage, then fetch if needed
const getWarehouseId = async (): Promise<string> => {
  try {
    const storedId = warehouseService.getStoredWarehouseId();
    if (storedId) {
      return storedId;
    }
    return await warehouseService.getActiveWarehouseId();
  } catch (error) {
    console.error('Error getting warehouse ID:', error);
    throw error;
  }
};

export interface Offer {
  id: string;
  heading_en: string;
  heading_ar: string;
  sub_heading_en: string;
  sub_heading_ar: string;
  cta_button_en: string;
  cta_button_ar: string;
  image: string;
  is_active: boolean;
  is_deleted: boolean;
  status: string;
  warehouse: string;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  coupon_code: string;
  coupon_type?: string;
  coupon_value?: string | number;
  discount_percentage?: number;
  discount_amount?: number;
  description_en?: string;
  description_ar?: string;
  region: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OffersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Offer[];
}

export interface CouponsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Coupon[];
}

const offerService = {
  // Get offers for the current warehouse
  getOffers: async (): Promise<OffersResponse> => {
    const warehouseId = await getWarehouseId();
    const url = `/warehouses/${warehouseId}/offers/`;
    
    const response = await api.get<OffersResponse>(url);
    return response.data;
  },

  // Get active coupons for a region
  getCoupons: async (region: string = 'INDIA'): Promise<CouponsResponse> => {
    const response = await api.get<CouponsResponse>(`/coupons/?region=${region}&status=active`);
    return response.data;
  },
};

export default offerService;
