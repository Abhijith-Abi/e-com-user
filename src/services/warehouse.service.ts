import api from './api';

export interface Warehouse {
  id: string;
  warehouse_name: string;
  warehouse_address: string;
  warehouse_location: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  warehouse_details: Record<string, any>;
  delivery_to: any[];
  flag_image: string;
}

export interface WarehousesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Warehouse[];
}

const WAREHOUSE_STORAGE_KEY = 'selected_warehouse_id';

const warehouseService = {
  // Get all warehouses from API
  getWarehouses: async (): Promise<WarehousesResponse> => {
    const response = await api.get<WarehousesResponse>('/warehouses/');
    return response.data;
  },

  // Get active warehouse and store in localStorage (with force refresh option)
  getActiveWarehouseId: async (forceRefresh: boolean = false): Promise<string> => {
    try {
      // Check if warehouse ID is already in localStorage (unless force refresh)
      if (!forceRefresh) {
        const storedId = localStorage.getItem(WAREHOUSE_STORAGE_KEY);
        if (storedId) {
          return storedId;
        }
      }

      // Fetch warehouses from API
      const data = await warehouseService.getWarehouses();
      
      if (!data.results || data.results.length === 0) {
        throw new Error('No warehouses found in API response');
      }

      // Find the first active warehouse that's not deleted
      const activeWarehouse = data.results.find(w => w.is_active && !w.is_deleted);

      if (!activeWarehouse) {
        throw new Error('No active warehouse found');
      }

      // Store the warehouse ID in localStorage
      localStorage.setItem(WAREHOUSE_STORAGE_KEY, activeWarehouse.id);
      console.log('Warehouse initialized:', activeWarehouse.id, activeWarehouse.warehouse_name);
      return activeWarehouse.id;
    } catch (error) {
      console.error('Error getting active warehouse:', error);
      throw error;
    }
  },

  // Get single warehouse by ID
  getWarehouseById: async (id: string): Promise<Warehouse> => {
    const response = await api.get<Warehouse>(`/warehouses/${id}/`);
    return response.data;
  },

  // Clear stored warehouse ID
  clearStoredWarehouseId: () => {
    localStorage.removeItem(WAREHOUSE_STORAGE_KEY);
  },

  // Get stored warehouse ID without API call
  getStoredWarehouseId: (): string | null => {
    return localStorage.getItem(WAREHOUSE_STORAGE_KEY);
  },

  // Manually set warehouse ID (for debugging/testing)
  setWarehouseId: (id: string): void => {
    localStorage.setItem(WAREHOUSE_STORAGE_KEY, id);
    console.log('Warehouse ID manually set to:', id);
  },
};

export default warehouseService;
