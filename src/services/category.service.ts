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

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  parent: string | null;
  status: string;
  is_active: boolean;
  is_major: boolean;
  sub_heading?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriesResponse {
  count?: number;
  results?: Category[];
}

export interface CategoryFilters {
  status?: string;
  parent?: string;
  search?: string;
  ordering?: string;
}

const categoryService = {
  // Get all categories with optional filters
  getCategories: async (filters?: CategoryFilters): Promise<CategoriesResponse> => {
    const warehouseId = await getWarehouseId();
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.parent) params.append('parent', filters.parent);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.ordering) params.append('ordering', filters.ordering);
    
    const queryString = params.toString();
    const url = `/warehouses/${warehouseId}/categories/${queryString ? '?' + queryString : ''}`;
    
    const response = await api.get<Category[] | CategoriesResponse>(url);
    
    // Handle both array and paginated response formats
    if (Array.isArray(response.data)) {
      return { results: response.data };
    }
    return response.data;
  },

  // Get single category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    const warehouseId = await getWarehouseId();
    const response = await api.get<Category>(`/warehouses/${warehouseId}/categories/${id}/`);
    return response.data;
  },
};

export default categoryService;
