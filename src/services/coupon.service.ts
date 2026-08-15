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

export interface ApplyCouponRequest {
  coupon_code: string;
  region: string;
  amount: string;
}

export interface ApplyCouponResponse {
  coupon_code: string;
  coupon_type: 'percentage' | 'fixed';
  coupon_value: string;
  original_amount: string;
  discounted_amount: string;
  discount_applied: string;
  warehouse_id: string;
}

const couponService = {
  // Apply coupon and get discount
  applyCoupon: async (couponCode: string, amount: string, region: string = 'INDIA'): Promise<ApplyCouponResponse> => {
    const warehouseId = await getWarehouseId();
    const url = `/warehouses/${warehouseId}/coupons/apply-coupon/`;
    
    const payload: ApplyCouponRequest = {
      coupon_code: couponCode.trim(),
      region,
      amount,
    };

    try {
      const response = await api.post<ApplyCouponResponse>(url, payload);
      return response.data;
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  },
};

export default couponService;
