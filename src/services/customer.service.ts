import api from './api';

export interface CustomerAddress {
  id: string;
  customer: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product: string;
  product_name: string;
  quantity: number;
  price: string;
}

export interface CustomerOrder {
  id: string;
  order_id: string;
  currency: string;
  total_amount: string;
  tax_amount: string;
  payment_status: string;
  order_status: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  user_full_name: string;
  user_email: string;
  user_phone: string | null;
  full_name: string;
  email: string;
  phone: string;
  preferred_language: string;
  preferred_currency: string;
  country: string;
  is_suspended: boolean;
  is_active: boolean;
  points?: number;
  orders: CustomerOrder[];
  addresses: CustomerAddress[];
  created_at: string;
  updated_at: string;
}

export interface CreateProfileRequest {
  user?: string;
  preferred_language?: string;
  preferred_currency?: string;
  is_active?: boolean;
}

export const customerService = {
  // Get customer profile by ID
  getProfile: async (profileId: string): Promise<CustomerProfile> => {
    const response = await api.get(`/customers/profiles/${profileId}/`);
    return response.data;
  },

  // List profiles (to find existing profile when /me/ fails)
  listProfiles: async (): Promise<CustomerProfile[]> => {
    const response = await api.get('/customers/profiles/');
    return response.data?.results ?? response.data;
  },

  // Create customer profile
  createProfile: async (data: CreateProfileRequest): Promise<any> => {
    const response = await api.post('/customers/profiles/', data);
    return response.data;
  },

  // Update customer profile
  updateProfile: async (profileId: string, data: Partial<CustomerProfile>): Promise<CustomerProfile> => {
    const response = await api.patch(`/customers/profiles/${profileId}/`, data);
    return response.data;
  },

  // Address methods
  createAddress: async (data: Omit<CustomerAddress, 'id' | 'created_at' | 'updated_at' | 'customer' | 'is_active'>): Promise<CustomerAddress> => {
    const response = await api.post('/customers/addresses/', data);
    return response.data;
  },

  updateAddress: async (addressId: string, data: Partial<CustomerAddress>): Promise<CustomerAddress> => {
    const response = await api.patch(`/customers/addresses/${addressId}/`, data);
    return response.data;
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    await api.delete(`/customers/addresses/${addressId}/`);
  },
};

export default customerService;
