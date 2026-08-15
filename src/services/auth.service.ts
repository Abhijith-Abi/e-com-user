import api from './api';
import customerService from './customer.service';
import axios from 'axios';

export interface LoginRequest {
  email: string;
  password: string;
  full_name?: string; // Optional: used when auto-login after registration
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  country?: string;
  phone?: number;
  preferred_language?: string;
  is_normal_user?: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  selected_warehouse: string | null;
  selected_warehouse_name: string | null;
  selected_warehouse_location: string | null;
  is_verified: boolean;
  is_active: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  role: string;
  user: User;
  customer_id?: string;
  selected_warehouse_id?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  full_name: string;
  customer_id?: string;
  customer?: {
    id: string;
  };
  is_verified?: boolean;
  detail?: string;
}

export interface RefreshTokenResponse {
  access: string;
}

// Helper function to decode JWT token
const decodeJWT = (token: string | undefined): any => {
  if (!token) {
    console.error('Token is undefined');
    return null;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/token/', credentials);
    
    
    if (!response.data || !response.data.access) {
      throw new Error('Invalid login response');
    }
    
    // Decode the access token to get user_id as fallback
    const tokenPayload = decodeJWT(response.data.access);
    
    // Try several possible JWT claims for the user id
    const userIdFromToken = tokenPayload?.user_id || tokenPayload?.sub || tokenPayload?.id || tokenPayload?.user?.id || '';

    // Use the user object from response if available, otherwise construct one
    const user: User = response.data.user || {
      id: userIdFromToken,
      email: credentials.email || '',
      full_name: credentials.full_name || (credentials.email ? credentials.email.split('@')[0] : 'User'),
      role: response.data.role || 'customer',
      selected_warehouse: null,
      selected_warehouse_name: null,
      selected_warehouse_location: null,
      is_verified: true,
      is_active: true,
    };
    
    // Ensure we have an ID
    if (!user.id && userIdFromToken) {
      user.id = userIdFromToken;
    }
    
    return {
      ...response.data,
      user,
      role: response.data.role || 'customer',
    };
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register/', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Get customer ID from the register response or fallback to fetching from API
  getCustomerIdFromRegister: (registerResponse: RegisterResponse): string | null => {
    // Try different possible locations where customer_id might be
    return registerResponse.customer_id || 
           registerResponse.customer?.id || 
           registerResponse.id || 
           null;
  },

  // Fetch customer ID from the backend (fallback if not in register response)
  fetchCustomerId: async (userId: string): Promise<string | null> => {
    try {
      const profiles = await customerService.listProfiles();
      
      if (profiles && profiles.length > 0) {
        const customerId = profiles[0].id;
        return customerId;
      }
    } catch (error) {
      console.error('[auth] Failed to fetch customer ID:', error);
    }
    return null;
  },

  // Verify email address using the received OTP code
  verifyEmail: async (email: string, otpCode: string): Promise<any> => {
    const response = await api.post('/auth/verify-email/', {
      email,
      otp_code: otpCode,
    });
    return response.data;
  },

  // Resend email verification OTP
  resendOtp: async (email: string): Promise<any> => {
    const response = await api.post('/auth/resend-otp/', { email });
    return response.data;
  },

  // Verify customer card with mobile and last 5 digits of card
  verifyCustomerCard: async (mobile: string, lastFiveDigits: string): Promise<any> => {
    const formData = new FormData();
    formData.append('mobile', mobile);
    formData.append('last_five_digits', lastFiveDigits);

    const response = await axios.post('/sales-api/verify-customer-card/', formData);
    return response.data;
  },
};

export default authService;
