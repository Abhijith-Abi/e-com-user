import { useEffect, useState } from 'react';
import trackingService, { ShipmentTracking } from '@/services/tracking.service';

export const useShipmentTracking = (orderId: string | null) => {
  const [tracking, setTracking] = useState<ShipmentTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setTracking(null);
      return;
    }

    const fetchTracking = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await trackingService.trackOrder(orderId);
        setTracking(data);
      } catch (err: any) {
        console.error('Error fetching tracking:', err);
        setError(err.message || 'Failed to fetch tracking information');
        setTracking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [orderId]);

  return { tracking, loading, error };
};
