import { useEffect, useState } from 'react';
import warehouseService, { type Warehouse } from '@/services/warehouse.service';

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        const response = await warehouseService.getWarehouses();
        setWarehouses(response.results);
        setError(null);
      } catch (err) {
        console.error('Error fetching warehouses:', err);
        setError('Failed to load warehouses');
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  return { warehouses, loading, error };
};
