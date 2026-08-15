import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import couponService, { ApplyCouponResponse } from '@/services/coupon.service';
import giftCardService from '@/services/giftcard.service';
import { useSettingsStoreBase } from '@/store/useSettingsStore';
import { toast } from 'sonner';

export interface GiftOptions {
  giftWrap: boolean;
  greetingCard?: string;
  selectedWrapId?: string;
  combo: boolean;
  message?: string;
}

export interface BuyNowProduct {
  productId: string;
  quantity: number;
  color: string;
  size: string;
  productName: string;
  productImage: string;
  required_points?: number;
  price_inr?: string;
  price_usd?: string;
  price_gbp?: string;
  sale_price_inr?: string;
  sale_price_usd?: string;
  sale_price_gbp?: string;
}

export interface CouponData {
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  originalAmount: string;
  discountedAmount: string;
  discountApplied: string;
}

interface CheckoutState {
  couponCode: string;
  couponDiscount: number;
  couponData: CouponData | null;
  isApplyingCoupon: boolean;
  giftOptions: GiftOptions;
  buyNowProduct: BuyNowProduct | null;
  setCouponCode: (code: string) => void;
  setCouponDiscount: (discount: number) => void;
  applyCoupon: (code: string, amount: string) => Promise<boolean>;
  removeCoupon: () => void;
  setGiftOptions: (options: GiftOptions) => void;
  getGiftTotal: () => number;
  setBuyNowProduct: (product: BuyNowProduct | null) => void;
}

export const useCheckoutStore = create<CheckoutState>(
  persist(
    (set, get) => ({
      couponCode: '',
      couponDiscount: 0,
      couponData: null,
      isApplyingCoupon: false,
      giftOptions: { giftWrap: false, combo: false },
      buyNowProduct: null,

      setCouponCode: (code) => set({ couponCode: code }),
      setCouponDiscount: (discount) => set({ couponDiscount: discount }),
      setBuyNowProduct: (product) => {
        // Clear coupon when buy-now product changes
        set({ buyNowProduct: product, couponCode: '', couponDiscount: 0, couponData: null });
      },

      applyCoupon: async (code, amount) => {
        if (!code.trim()) {
          set({ couponDiscount: 0, couponCode: '', couponData: null });
          toast.error('Please enter a coupon code');
          return false;
        }

        set({ isApplyingCoupon: true });

        try {
          const response = await couponService.applyCoupon(code, amount);
          
          // Calculate discount percentage
          const originalAmount = parseFloat(response.original_amount);
          const discountAmount = parseFloat(response.discount_applied);
          const discountPercentage = originalAmount > 0 ? (discountAmount / originalAmount) * 100 : 0;

          const couponData: CouponData = {
            code: code.trim(),
            type: response.coupon_type,
            value: response.coupon_value,
            originalAmount: response.original_amount,
            discountedAmount: response.discounted_amount,
            discountApplied: response.discount_applied,
          };

          set({
            couponDiscount: Math.round(discountPercentage),
            couponCode: code.trim(),
            couponData,
            isApplyingCoupon: false,
          });

          toast.success(`Coupon applied! You saved ${response.discount_applied}`);
          return true;
        } catch (error: any) {
          set({ couponDiscount: 0, couponCode: '', couponData: null, isApplyingCoupon: false });
          const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Invalid coupon code';
          toast.error(errorMessage);
          return false;
        }
      },

      removeCoupon: () => {
        set({ couponCode: '', couponDiscount: 0, couponData: null });
        toast.success('Coupon removed');
      },

      setGiftOptions: (options) => set({ giftOptions: options }),

      getGiftTotal: () => {
        const { giftOptions } = get();
        const settingsStore = useSettingsStoreBase.getState();
        const currency = settingsStore.currency || 'INR';
        
        const getPriceForCurrency = (item: any): number => {
          const priceField = currency === 'INR' ? 'price_inr' :
                             currency === 'GBP' ? 'price_gbp' :
                             currency === 'USD' ? 'price_usd' : 'price_inr';
          const price = item[priceField];
          return price && price !== 'null' ? parseFloat(String(price)) : 0;
        };

        // Fetch prices from localStorage cache if available
        let giftWrapPrice = 0;
        let greetingCardPrice = 0;

        try {
          const wrapsCache = localStorage.getItem('gift_wraps_cache');
          const cardsCache = localStorage.getItem('gift_cards_cache');

          if (wrapsCache) {
            const wraps = JSON.parse(wrapsCache);
            if (giftOptions.selectedWrapId) {
              const selectedWrap = wraps.find((w: any) => w.id === giftOptions.selectedWrapId);
              giftWrapPrice = selectedWrap ? getPriceForCurrency(selectedWrap) : (wraps.length > 0 ? getPriceForCurrency(wraps[0]) : 0);
            } else if (wraps.length > 0) {
              giftWrapPrice = getPriceForCurrency(wraps[0]);
            }
          }

          if (cardsCache) {
            const cards = JSON.parse(cardsCache);
            if (giftOptions.greetingCard) {
              const selectedCard = cards.find((c: any) => c.id === giftOptions.greetingCard);
              greetingCardPrice = selectedCard ? getPriceForCurrency(selectedCard) : (cards.length > 0 ? getPriceForCurrency(cards[0]) : 0);
            } else if (cards.length > 0) {
              greetingCardPrice = getPriceForCurrency(cards[0]);
            }
          }
        } catch (err) {
          console.error('Error parsing gift cache:', err);
        }

        // Fallback to hardcoded prices if cache is not available
        if (giftWrapPrice === 0) giftWrapPrice = 100;
        if (greetingCardPrice === 0) greetingCardPrice = 95;

        if (giftOptions.combo) {
          return Math.round((giftWrapPrice + greetingCardPrice) * 0.9); // 10% discount
        }
        
        let total = 0;
        if (giftOptions.giftWrap) total += giftWrapPrice;
        if (giftOptions.greetingCard) total += greetingCardPrice;
        return total;
      },
    }),
    {
      name: 'checkout_storage',
      partialize: (state) => ({
        buyNowProduct: state.buyNowProduct,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
        couponData: state.couponData,
        giftOptions: state.giftOptions,
      }),
    }
  )
);
