import { useEffect, useState } from 'react';
import offerService, { Coupon } from '@/services/offer.service';
import { useSettingsStore } from '@/store/useSettingsStore';

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { region } = useSettingsStore();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await offerService.getCoupons(region || 'INDIA');
        setCoupons(response.results || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError('Failed to load coupons');
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [region]);

  return { coupons, loading, error };
};
