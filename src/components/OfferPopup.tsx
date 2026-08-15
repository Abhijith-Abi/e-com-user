import { useState, useEffect, useRef } from 'react';
import { X, Gift } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import offerService, { type Coupon } from '@/services/offer.service';

const OfferPopup = () => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  // Wait for store hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fetch coupons when user logs in
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const fetchCoupon = async () => {
      try {
        const response = await offerService.getCoupons('INDIA');
        const coupons = response.results || [];
        
        if (coupons.length > 0) {
          const firstCoupon = coupons[0];
          setCoupon(firstCoupon);
          
          const dismissed = sessionStorage.getItem('offer_dismissed');
          if (!dismissed) {
            timer = setTimeout(() => {
              setShow(true);
            }, 1500);
          }
        } else {
          setShow(false);
        }
      } catch (error) {
        console.error('[OfferPopup] Failed to fetch coupons:', error);
        setShow(false);
      }
    };

    if (hydrated && isAuthenticated) {
      fetchCoupon();
    } else {
      setShow(false);
      setCoupon(null);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthenticated, hydrated]);

  // Show popup when coupon is set and not dismissed
  useEffect(() => {
    if (coupon && !show) {
      const dismissed = sessionStorage.getItem('offer_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShow(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [coupon, show]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('offer_dismissed', 'true');
  };

  const handleCopy = () => {
    if (coupon) {
      navigator.clipboard.writeText(coupon.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!show || !coupon) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div ref={backgroundRef} className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-background border border-border shadow-2xl max-w-md w-full rounded-sm overflow-hidden animate-fade-in">
        {/* Header band */}
        <div className="bg-primary text-primary-foreground px-6 py-4 text-center">
          <Gift className="w-8 h-8 mx-auto mb-2" />
          <h2 className="font-display text-xl md:text-2xl">Special Offer</h2>
        </div>

        <div className="p-6 text-center space-y-4">
          <p className="text-muted-foreground font-sans text-sm">Unlock exclusive savings on your next purchase. Copy the code below and apply it at checkout.</p>

          {coupon && (
            <>
              <div className="flex items-center justify-center gap-3">
                <div className="border-2 border-dashed border-accent px-6 py-3 rounded-sm">
                  <span className="font-display text-xl tracking-widest">{coupon.coupon_code}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-4 py-3 bg-primary text-primary-foreground text-xs font-sans tracking-wider hover:opacity-90 transition-opacity"
                >
                  {copied ? 'COPIED' : 'COPY CODE'}
                </button>
              </div>

              {coupon.coupon_type === 'percentage' && coupon.coupon_value && (
                <p className="text-sm font-semibold text-green-600">
                  {parseFloat(coupon.coupon_value as any)}% OFF
                </p>
              )}

              {coupon.coupon_type === 'fixed' && coupon.coupon_value && (
                <p className="text-sm font-semibold text-green-600">
                  ₹{parseFloat(coupon.coupon_value as any)} OFF
                </p>
              )}
            </>
          )}

          <p className="text-[11px] text-muted-foreground font-sans">* Terms and conditions apply. Offer valid for a limited time only.</p>

          <button
            onClick={handleClose}
            className="w-full border border-border py-3 text-sm font-sans tracking-wider hover:bg-secondary transition-colors"
          >
            CONTINUE SHOPPING
          </button>
        </div>

        <button onClick={handleClose} className="absolute top-3 end-3 text-primary-foreground/80 hover:text-primary-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default OfferPopup;
