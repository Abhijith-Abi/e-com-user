import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Lock, ChevronRight, CheckCircle2, AlertTriangle, Truck, RefreshCw } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import redeemService from '@/services/redeem.service';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import ErrorState from '@/components/ErrorState';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartId, removeFromCart, updateCartQuantity, loadCartList, subtotal: apiSubtotal, total_amount: apiTotalAmount, total_required_points: apiTotalPoints, gst_amount: apiGstAmount } = useCartStore();
  const { formatPriceRaw, formatPriceExact, currency } = useSettingsStore();
  const { couponDiscount, couponData, getGiftTotal, removeCoupon, setGiftOptions } = useCheckoutStore();
 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [pointsPerUnit, setPointsPerUnit] = useState<number>(1);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const previousCartItemsRef = useRef<string>('');

  // Fetch cart from backend API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setError(null);
        await loadCartList();
        
        // Fetch wallet balance and redeem settings
        const wallet = await redeemService.getWallet();
        if (wallet?.balance) {
          setUserPoints(wallet.balance);
        }

        // Fetch redeem settings to get points per currency unit
        const settings = await redeemService.getSettings();
        if (settings && settings.length > 0) {
          setPointsPerUnit(parseFloat(settings[0].points_per_currency_unit));
        }
      } catch (err: any) {
        console.error('Failed to fetch cart or wallet:', err);
        setError(err.message || 'Failed to load your shopping cart. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [loadCartList]);

  // Clear coupon and gift options when cart items actually change (not just on render)
  useEffect(() => {
    const currentCartKey = cartItems.map(item => `${item.productId}-${item.quantity}`).join('|');
    
    if (previousCartItemsRef.current && previousCartItemsRef.current !== currentCartKey) {
      if (couponData) {
        removeCoupon();
      }
      // Clear gift options when cart changes
      setGiftOptions({ giftWrap: false, combo: false });
    }
    
    previousCartItemsRef.current = currentCartKey;
  }, [cartItems, couponData, removeCoupon, setGiftOptions]);

  // Get price for current currency from the product fields stored on the cart item
  const getPriceForCurrency = (item: any, priceType: 'regular' | 'sale') => {
    const priceField = priceType === 'regular'
      ? (currency === 'INR' ? 'price_inr' :
         currency === 'GBP' ? 'price_gbp' :
         currency === 'USD' ? 'price_usd' : 'price_inr')
      : (currency === 'INR' ? 'sale_price_inr' :
         currency === 'GBP' ? 'sale_price_gbp' :
         currency === 'USD' ? 'sale_price_usd' : 'sale_price_inr');

    return item[priceField] ? parseFloat(item[priceField]) : null;
  };

  // Always use frontend calculations for accurate pricing
  const subtotal = cartItems.reduce((sum, item) => {
    const salePrice = getPriceForCurrency(item, 'sale');
    const regularPrice = getPriceForCurrency(item, 'regular') || 0;
    const price = salePrice || regularPrice;
    return sum + (price * item.quantity);
  }, 0);

  const totalPoints = cartItems.reduce((sum, item) => {
    const points = item.required_points || 0;
    return sum + (points * item.quantity);
  }, 0);

  // Calculate discount based on coupon type
  let discount = 0;
  let discountLabel = '';
  if (couponData) {
    if (couponData.type === 'fixed') {
      discount = parseFloat(couponData.discountApplied);
      discountLabel = `Discount`;
    } else {
      discount = subtotal * couponDiscount / 100;
      discountLabel = `Discount (${couponDiscount}%)`;
    }
  }

  const missingPoints = (totalPoints > 0 && userPoints < totalPoints) ? (totalPoints - userPoints) : 0;
  const giftTotal = getGiftTotal();
  
  // New calculation: Subtotal = product price + missing points
  const calcSubtotal = subtotal + missingPoints;
  // Total = subtotal - discount + gift charges
  const calcTotal = calcSubtotal - discount + giftTotal;
  // GST on total
  const gst = calcTotal * 0.18;
  // Grand Total = total + GST
  const grandTotal = calcTotal + gst;

  const handleCheckout = async () => {
    if (!cartId) {
      toast.error('Cart ID not found');
      return;
    }
    navigate('/checkout');
  };

  // Since missing points are paid in cash, they can always purchase
  const hasEnoughPointsForPurchase = true;

  // Helper functions for quantity updates with loading states
  const handleQuantityUpdate = async (cartItemId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      toast.error(`Maximum available stock is ${maxStock}`);
      return;
    }
    
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await updateCartQuantity(cartItemId, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await removeFromCart(cartItemId);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-zinc-50/30 dark:bg-zinc-950">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-zinc-900 dark:text-zinc-100 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-zinc-500 dark:text-zinc-400 font-sans text-xs tracking-widest uppercase font-semibold">Loading shopping cart...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6 bg-zinc-50/30 dark:bg-zinc-950">
        <ErrorState 
          title="Cart Unavailable"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-zinc-50/40 dark:bg-zinc-950 py-16">
        <div className="max-w-md w-full p-10 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] space-y-8">
          <div className="relative w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto border border-zinc-100/50 dark:border-zinc-700/50">
            <ShoppingBag className="w-9 h-9 text-zinc-400 dark:text-zinc-300" />
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Your cart is empty</h1>
            <p className="text-zinc-400 dark:text-zinc-500 font-sans text-xs leading-relaxed max-w-xs mx-auto">
              Browse our collections to add high-quality premium apparel, Islamic essentials, and exclusive custom accessories to your catalog.
            </p>
          </div>
          <div className="pt-2">
            <Link 
              to="/shop" 
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-xl text-xs tracking-widest uppercase font-sans font-bold active:scale-[0.98] transition-all duration-300 shadow-md shadow-primary/10 hover:-translate-y-[1px]"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 py-12 md:py-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Title Section */}
        <div className="mb-10 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/60">
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-1">
            Your Bag
          </h1>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs font-sans tracking-wide">
            Review items selected for premium ordering (<span className="font-bold text-zinc-800 dark:text-zinc-200">{cartItems.length} Product{cartItems.length !== 1 ? 's' : ''}</span>)
          </p>
        </div>

        {/* 2-Column Responsive E-commerce Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-2 space-y-5">
            {cartItems.map((item, index) => {
              const productName = item.productName;
              const salePrice = getPriceForCurrency(item, 'sale');
              const regularPrice = getPriceForCurrency(item, 'regular') || 0;
              const price = salePrice || regularPrice;
              const hasDiscount = salePrice && regularPrice > salePrice;
              const isUpdating = updatingItems.has(item.cartItemId || '');
              const maxStock = item.stock || 1;
              
              return (
                <div 
                  key={item.cartItemId || index} 
                  className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300 relative group ${isUpdating ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {/* Loading overlay for updating items */}
                  {isUpdating && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 rounded-2xl flex items-center justify-center z-10">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    </div>
                  )}

                  {/* Remove Button - Positioned in the corner */}
                  <button 
                    onClick={() => item.cartItemId && handleRemoveItem(item.cartItemId)} 
                    disabled={isUpdating}
                    className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-full transition-all duration-200 flex-shrink-0 disabled:opacity-50"
                    aria-label="Remove item from bag"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex gap-4 sm:gap-6 items-start">
                    
                    {/* Product Image */}
                    <Link 
                      to={`/product/${item.productId}`} 
                      className="w-24 h-32 sm:w-28 sm:h-36 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-100/80 dark:border-zinc-800 relative block group/img"
                    >
                      {item.productImage ? (
                        <img 
                          src={item.productImage} 
                          alt={productName} 
                          className="w-full h-full object-cover group-hover/img:scale-[1.03] transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800">
                          <ShoppingBag className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                        </div>
                      )}
                    </Link>
                    
                    {/* Item Description details */}
                    <div className="flex-1 min-w-0 flex flex-col min-h-32 sm:min-h-36 justify-between pt-1">
                      
                      <div className="space-y-2 pr-6">
                        <Link 
                          to={`/product/${item.productId}`} 
                          className="font-display font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors block leading-snug"
                        >
                          {productName}
                        </Link>
                        
                        {/* Selected Variation Attributes */}
                        {(item.color || item.size) && (
                          <div className="flex flex-wrap gap-1.5">
                            {[item.color, item.size].filter(Boolean).map((attr, attrIdx) => (
                              <span 
                                key={attrIdx} 
                                className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded"
                              >
                                {attr}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Exclusive Loyalty Points Badge */}
                        {item.required_points && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 text-[10px] font-sans font-bold uppercase tracking-widest border border-amber-100/60 dark:border-amber-900/30">
                            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
                            <span>{item.required_points} Loyalty Points</span>
                          </div>
                        )}
                      </div>

                      {/* Tactile Quantity Selector and Cost Details */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-4">
                        
                        {/* Circular tactile Quantity Selector */}
                        <div className="flex items-center border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-50/50 dark:bg-zinc-900/50">
                          <button 
                            onClick={() => item.cartItemId && handleQuantityUpdate(item.cartItemId, Math.max(1, item.quantity - 1), maxStock)} 
                            disabled={isUpdating || item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Reduce quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 font-sans text-xs font-bold text-zinc-800 dark:text-zinc-200 min-w-[2rem] text-center select-none">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => item.cartItemId && handleQuantityUpdate(item.cartItemId, item.quantity + 1, maxStock)} 
                            disabled={isUpdating || item.quantity >= maxStock}
                            title={item.quantity >= maxStock ? `Maximum stock available: ${maxStock}` : ''}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Calculated price */}
                        <div className="text-right">
                          {hasDiscount && (
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 line-through block font-sans mr-0.5">
                              {formatPriceRaw(regularPrice * item.quantity)}
                            </span>
                          )}
                          <span className="font-sans text-sm sm:text-base font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                            {formatPriceRaw(price * item.quantity)}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Checkout Order Summary Card */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.015)]">
              
              <h3 className="font-display text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                Order Summary
              </h3>

              {/* Price Line items */}
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal (Product Price)</span>
                  <span className="font-bold text-zinc-850 dark:text-zinc-200">{formatPriceExact(subtotal)}</span>
                </div>

                {missingPoints > 0 && (
                  <div className="flex justify-between items-center bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/20 p-2.5 rounded-lg text-amber-800 dark:text-amber-400">
                    <span className="font-semibold text-[10px] uppercase tracking-wider">Points Shortage ({missingPoints} pts)</span>
                    <span className="font-black">+{formatPriceExact(missingPoints)}</span>
                  </div>
                )}
                
                {totalPoints > 0 && (
                  <div className="flex justify-between items-center bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/20 p-2.5 rounded-lg text-amber-800 dark:text-amber-400">
                    <span className="font-semibold">Redemption Points Required</span>
                    <span className="font-extrabold text-sm flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> 
                      {totalPoints}
                    </span>
                  </div>
                )}

                {couponData && discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 p-2.5 rounded-lg">
                    <span className="font-semibold">{discountLabel}</span>
                    <span className="font-extrabold">-{formatPriceExact(discount)}</span>
                  </div>
                )}
                
                {giftTotal > 0 && (
                  <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                    <span>Gift Wrapping</span>
                    <span className="font-bold text-zinc-850 dark:text-zinc-200">{formatPriceExact(giftTotal)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                  <span>Shipping</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full text-[10px]">
                    Free Delivery
                  </span>
                </div>

                {/* Total (before GST) */}
                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex justify-between items-center">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Total</span>
                  <span className="font-sans text-base font-black text-zinc-950 dark:text-zinc-50 tracking-tight">
                    {formatPriceExact(calcTotal)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                  <span>GST (18%)</span>
                  <span className="font-bold text-zinc-850 dark:text-zinc-200">{formatPriceExact(gst)}</span>
                </div>
                
                {/* Grand Total */}
                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex justify-between items-center">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Grand Total</span>
                  <span className="font-sans text-2xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight">
                    {formatPriceExact(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Loyalty Point Verification Card */}
              {totalPoints > 0 && (
                <div className="pt-1 font-sans">
                  {userPoints < totalPoints ? (
                    <div className="bg-amber-50/80 dark:bg-amber-950/15 border border-amber-100/80 dark:border-amber-900/30 p-4 rounded-xl space-y-3 shadow-inner">
                      <div className="flex justify-between items-center text-[10px] tracking-wider uppercase">
                        <span className="text-zinc-500 dark:text-zinc-400 font-bold">Your Available Points</span>
                        <span className="font-extrabold text-amber-800 dark:text-amber-400 bg-amber-100/30 dark:bg-amber-950/30 px-2 py-0.5 rounded-md">
                          {userPoints} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] tracking-wider uppercase bg-amber-100/40 dark:bg-amber-950/30 text-amber-855 dark:text-amber-300 p-2.5 rounded-lg border border-amber-100/30 dark:border-amber-900/20">
                        <span className="font-semibold">Points Required</span>
                        <span className="font-black">{totalPoints} pts</span>
                      </div>
                      <p className="text-[10px] text-amber-700 dark:text-amber-455 font-bold leading-normal flex items-start gap-1.5 pt-1.5 border-t border-amber-100/30 dark:border-amber-900/20">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-455 flex-shrink-0 mt-0.5 animate-pulse" />
                        <span>Insufficient points balance. The missing {totalPoints - userPoints} points are added to your cash total as {formatPriceExact(totalPoints - userPoints)}.</span>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/15 border border-emerald-100/80 dark:border-emerald-900/30 p-4 rounded-xl space-y-3 shadow-inner">
                      <div className="flex justify-between items-center text-[10px] tracking-wider uppercase">
                        <span className="text-zinc-500 dark:text-zinc-400 font-bold">Your Available Points</span>
                        <span className="font-extrabold text-emerald-800 dark:text-emerald-400 bg-emerald-100/30 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                          {userPoints} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] tracking-wider uppercase bg-emerald-100/40 dark:bg-emerald-950/30 text-emerald-855 dark:text-emerald-300 p-2.5 rounded-lg border border-emerald-100/30 dark:border-emerald-900/20">
                        <span className="font-semibold">Points Redeemed</span>
                        <span className="font-black">{totalPoints} pts</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold leading-normal flex items-center gap-1.5 pt-1.5 border-t border-emerald-100/30 dark:border-emerald-900/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>Sufficient loyalty points balance! Safe to redeem.</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Secure Checkout Button */}
              <button 
                onClick={handleCheckout}
                disabled={!hasEnoughPointsForPurchase}
                className={`w-full h-12 text-xs tracking-widest uppercase font-sans font-bold rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 ${
                  hasEnoughPointsForPurchase
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/15 hover:-translate-y-[1px] cursor-pointer'
                    : 'bg-zinc-150 text-zinc-400 dark:bg-zinc-800/80 dark:text-zinc-500 border border-zinc-200/30 dark:border-zinc-800 cursor-not-allowed opacity-60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {hasEnoughPointsForPurchase ? 'Proceed to Checkout' : 'Insufficient Points'}
              </button>

              {/* Continue Shopping Button */}
              <Link 
                to="/shop" 
                className="w-full h-12 text-xs tracking-widest uppercase font-sans font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:-translate-y-[1px] shadow-sm"
              >
                Continue Shopping
              </Link>

            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
};

export default Cart;
