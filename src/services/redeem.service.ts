import api from './api';

export interface Wallet {
  id: string;
  customer: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  wallet: string;
  bill_number: string;
  bill_image: string;
  bill_amount: string;
  bill_code: string;
  status: 'pending' | 'approved' | 'rejected';
  points_awarded: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}


export interface Transaction {
  id: string;
  wallet: string;
  customer_email: string;
  transaction_type: 'credit' | 'debit';
  points: number;
  balance_after: number;
  description: string;
  bill_upload: string | null;
  order: string | null;
  created_at: string;
}

export interface RedeemCheckResponse {
  points_to_redeem: number;
  discount_amount: string;
  order_total: string;
  final_total: string;
  wallet_balance: number;
  is_valid: boolean;
  error: string | null;
}

export interface RedeemSettings {
  id: string;
  points_per_currency_unit: string;
  min_points_to_redeem: number;
  max_redeem_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const redeemService = {
  // Get wallet balance
  getWallet: async (): Promise<Wallet> => {
    const response = await api.get('/redeem/wallet/');
    return response.data;
  },

  // List bills
  listBills: async (): Promise<Bill[]> => {
    const response = await api.get('/redeem/bills/');
    return Array.isArray(response.data) ? response.data : response.data?.results || [];
  },

  // Upload bill
  uploadBill: async (file: File): Promise<Bill> => {
    const formData = new FormData();
    formData.append('bill_image', file);
    const response = await api.post('/redeem/bills/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get transactions
  getTransactions: async (page?: number): Promise<any> => {
    const params = page ? { page } : {};
    const response = await api.get('/redeem/transactions/', { params });
    return response.data;
  },

  // Preview discount
  checkDiscount: async (pointsToRedeem: number, orderTotal: string): Promise<RedeemCheckResponse> => {
    const response = await api.post('/redeem/check/', {
      points_to_redeem: pointsToRedeem,
      order_total: orderTotal,
    });
    return response.data;
  },

  // Apply points to existing order
  applyPointsToOrder: async (orderId: string, pointsToRedeem: number): Promise<RedeemCheckResponse> => {
    const response = await api.post(`/redeem/apply/${orderId}/`, {
      points_to_redeem: pointsToRedeem,
    });
    return response.data;
  },

  // Get redeem settings
  getSettings: async (): Promise<RedeemSettings[]> => {
    const response = await api.get('/redeem/settings/');
    return Array.isArray(response.data) ? response.data : response.data?.results || [];
  },
};

export default redeemService;
