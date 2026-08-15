import api from './api';
import warehouseService from './warehouse.service';

// Helper to get warehouse ID - first from localStorage, then fetch if needed
const getWarehouseId = async (): Promise<string> => {
  try {
    // Try to get from localStorage first
    const storedId = warehouseService.getStoredWarehouseId();
    if (storedId) {
      return storedId;
    }
    
    // If not in localStorage, fetch and store it
    return await warehouseService.getActiveWarehouseId();
  } catch (error) {
    console.error('Error getting warehouse ID:', error);
    throw error;
  }
};

export interface ProductImage {
  id: string;
  image: string;
  is_primary: boolean;
  color?: string;
  stock?: number;
  sizes?: Array<{ size: string; stock: number }>;
  created_at: string;
  updated_at: string;
}

export interface WarehouseStock {
  id: string;
  warehouse_name: string;
  stock: number;
  warehouse: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  slug?: string;
  description_en?: string;
  description_ar?: string;
  sku?: string;
  type?: string;
  price_inr: string;
  price_aed: string;
  price_usd: string;
  price_gbp?: string;
  sale_price_inr?: string;
  sale_price_aed?: string;
  sale_price_usd?: string;
  sale_price_gbp?: string;
  // Legacy fields for compatibility
  price?: number;
  compare_at_price?: number;
  primary_image?: string;
  images?: ProductImage[];
  category: string;
  category_id?: string;
  category_name?: string;
  category_name_ar?: string;
  sub_category?: string;
  subcategory?: string;
  warehouse?: string;
  warehouse_name?: string;
  sizes?: string | string[];
  colors?: string | string[];
  is_new?: boolean;
  is_featured: boolean;
  status: string;
  stock?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  weight?: string;
  warehouse_stocks?: WarehouseStock[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_deleted: boolean;
  required_points?: number;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface ProductFilters {
  status?: string;
  category?: string;
  sub_category?: string;
  category_name?: string;
  is_featured?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
}

const productService = {
  // Get new arrivals/products
  getNewProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const warehouseId = await getWarehouseId();
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString());
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.page) params.append('page', filters.page.toString());
    
    const queryString = params.toString();
    const url = `/warehouses/${warehouseId}/products/new/${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ProductsResponse>(url);
    return response.data;
  },

  // Get all products with filters
  getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const warehouseId = await getWarehouseId();
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.sub_category) params.append('sub_category', filters.sub_category);
    if (filters?.category_name) params.append('category_name', filters.category_name);
    if (filters?.is_featured !== undefined) params.append('is_featured', filters.is_featured.toString());
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = `/warehouses/${warehouseId}/products/${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ProductsResponse>(url);
    return response.data;
  },

  // Search products by query
  searchProducts: async (query: string, limit: number = 10): Promise<Product[]> => {
    const warehouseId = await getWarehouseId();
    const params = new URLSearchParams();
    params.append('search', query);
    params.append('limit', limit.toString());
    
    const url = `/warehouses/${warehouseId}/products/?${params.toString()}`;
    
    try {
      const response = await api.get<ProductsResponse>(url);
      return response.data.results;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Get single product by ID
  getProductById: async (id: string): Promise<Product> => {
    const warehouseId = await getWarehouseId();
    const url = `/warehouses/${warehouseId}/products/${id}/`;

    const response = await api.get<Product>(url);
    return response.data;
  },

  // Get best sellers for a warehouse
  getBestSellers: async (params?: {
    category?: string;
    sub_category?: string;
    type?: string;
    months?: number;
    limit?: number;
    status?: string;
  }): Promise<ProductsResponse> => {
    const warehouseId = await getWarehouseId();
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append('category', params.category);
    if (params?.sub_category) queryParams.append('sub_category', params.sub_category);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.months) queryParams.append('months', params.months.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const url = `/warehouses/${warehouseId}/products/best-sellers/${queryString ? `?${queryString}` : ''}`;
    
    // Debug logging
    console.log('Best Sellers API URL:', url);
    console.log('Best Sellers params:', params);
    
    const response = await api.get<ProductsResponse>(url);
    
    // Debug logging for response
    console.log('Best Sellers response:', response.data.results.map(p => ({ 
      name: p.name_en, 
      status: p.status,
      id: p.id 
    })));
    
    return response.data;
  },
};

export default productService;
