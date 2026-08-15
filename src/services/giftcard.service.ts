import api from './api';
import warehouseService from './warehouse.service';

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

export interface GiftCard {
  id: string;
  card_name: string;
  category_name: string;
  image: string;
  status: string;
  is_active: boolean;
  is_deleted: boolean;
  units: number;
  warehouse: string;
  category: string;
  price_inr?: string;
  price_usd?: string;
  price_gbp?: string;
  created_at: string;
  updated_at: string;
}

export interface GiftWrap {
  id: string;
  wrap_name: string;
  image: string;
  status: string;
  is_active: boolean;
  is_deleted: boolean;
  units: number;
  warehouse: string;
  price_inr?: string;
  price_usd?: string;
  price_gbp?: string;
  created_at: string;
  updated_at: string;
}

export interface GiftCardsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GiftCard[];
}

export interface GiftWrapsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GiftWrap[];
}

const giftCardService = {
  getGiftCards: async (): Promise<GiftCardsResponse> => {
    const warehouseId = await getWarehouseId();
    const response = await api.get<GiftCardsResponse>(
      `/warehouses/${warehouseId}/gift-cards/cards/`
    );
    return response.data;
  },
  getGiftWraps: async (): Promise<GiftWrapsResponse> => {
    const warehouseId = await getWarehouseId();
    const response = await api.get<GiftWrapsResponse>(
      `/warehouses/${warehouseId}/gift-cards/wraps/`
    );
    return response.data;
  },
};

export default giftCardService;
