import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Banknote, Smartphone, ChevronRight, CheckCircle, Plus, Download, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useAuthStore } from '@/store/useAuthStore';
import customerService, { type CustomerAddress } from '@/services/customer.service';
import orderService, { type NewAddressPayload } from '@/services/order.service';
import redeemService from '@/services/redeem.service';
import warehouseService from '@/services/warehouse.service';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import ErrorState from '@/components/ErrorState';
import GiftPackingSection from '@/components/GiftPackingSection';
import { validateAddress, validateAddressField, type AddressFormData } from '@/lib/validations';

const emptyNewAddress: NewAddressPayload = {
  full_name: '', phone: '', address_line1: '', address_line2: '',
  city: '', state: '', postal_code: '', country: 'India',
};

const Checkout = () => {
  const { cartItems, cartId, clearCart, loadCartList, subtotal: apiSubtotal, total_amount: apiTotalAmount, total_required_points: apiTotalPoints, gst_amount: apiGstAmount } = useCartStore();
  const { formatPrice, formatPriceExact, currency, warehouseId } = useSettingsStore();
  const { couponDiscount, couponCode, couponData, isApplyingCoupon, applyCoupon, removeCoupon, buyNowProduct, setBuyNowProduct, giftOptions, getGiftTotal, setGiftOptions } = useCheckoutStore();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [placedOrderItems, setPlacedOrderItems] = useState<any[]>([]);
  const [couponInput, setCouponInput] = useState(couponCode);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [pointsPerUnit, setPointsPerUnit] = useState<number>(1);

  // Address state
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressMode, setAddressMode] = useState<'default' | 'existing' | 'new'>('default');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [newAddress, setNewAddress] = useState<NewAddressPayload>(emptyNewAddress);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Warehouse
  const [resolvedWarehouseId, setResolvedWarehouseId] = useState(warehouseId || '');
  const previousItemsRef = useRef<string>('');

  // Use buy-now product if available, otherwise use cart items
  const itemsToCheckout = buyNowProduct ? [buyNowProduct] : cartItems;

  useEffect(() => {
    const load = async () => {
      // Load cart from server first
      try {
        setError(null);
        await loadCartList();
      } catch (err: any) {
        console.error('Failed to load cart:', err);
        setError(err.message || 'Failed to initialize checkout. Please try again.');
      }

      try {
        const authState = useAuthStore.getState();
        if (authState.isSebastianCardUser && authState.sebastianCardData) {
          const card = authState.sebastianCardData;
          const sebastianAddr: CustomerAddress = {
            id: 'sebastian-card-address',
            customer: String(card.id),
            full_name: card.customer_name,
            phone: card.mobile,
            address_line1: card.address,
            address_line2: card.address_line2 || '',
            city: card.city,
            state: card.district || '',
            postal_code: card.pincode,
            country: 'India',
            is_default: true,
            is_active: true,
            created_at: card.activated_at || '',
            updated_at: card.activated_at || '',
          };
          setAddresses([sebastianAddr]);
          setSelectedAddressId('sebastian-card-address');
          setAddressMode('default');
        } else {
          const list = await customerService.listProfiles();
          const profile = list?.[0] ?? null;
          if (profile) {
            if (profile.addresses?.length) {
              setAddresses(profile.addresses);
              const def = profile.addresses.find((a) => a.is_default);
              if (def) setSelectedAddressId(def.id);
            }
          }
        }
      } catch {
        // no addresses
      } finally {
        setLoadingAddresses(false);
      }

      // Fetch wallet balance to get available points
      try {
        const wallet = await redeemService.getWallet();
        if (wallet?.balance) {
          setUserPoints(wallet.balance);
        }
      } catch (err) {
        console.error('Failed to fetch wallet:', err);
      }

      // Fetch redeem settings to get points per currency unit
      try {
        const settings = await redeemService.getSettings();
        if (settings && settings.length > 0) {
          setPointsPerUnit(parseFloat(settings[0].points_per_currency_unit));
        }
      } catch (err) {
        console.error('Failed to fetch redeem settings:', err);
      }

      // Resolve warehouse if not already set
      if (!warehouseId) {
        try {
          const resolvedId = await warehouseService.getActiveWarehouseId();
          setResolvedWarehouseId(resolvedId);
        } catch {
          console.error('Could not resolve warehouse');
        }
      }
    };
    load();
  }, [warehouseId, loadCartList]);

  // Log cartId when it changes
  useEffect(() => {
  }, [cartId]);

  // Clear coupon only when cart items actually change (not on every render)
  useEffect(() => {
    const currentItemsKey = itemsToCheckout.map(item => `${item.productId}-${item.quantity}`).join('|');
    
    if (previousItemsRef.current && previousItemsRef.current !== currentItemsKey && couponData) {
      removeCoupon();
    }
    
    previousItemsRef.current = currentItemsKey;
  }, [itemsToCheckout, couponData, removeCoupon]);

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

  // Helper to get gift item details from cache
  const getGiftItemDetails = (type: 'wrap' | 'card', id?: string) => {
    try {
      const cacheKey = type === 'wrap' ? 'gift_wraps_cache' : 'gift_cards_cache';
      const cache = localStorage.getItem(cacheKey);
      if (!cache) return null;
      
      const items = JSON.parse(cache);
      const nameField = type === 'wrap' ? 'wrap_name' : 'card_name';
      const priceField = currency === 'INR' ? 'price_inr' :
                         currency === 'GBP' ? 'price_gbp' :
                         currency === 'USD' ? 'price_usd' : 'price_inr';
      
      if (id) {
        const item = items.find((i: any) => i.id === id);
        return item ? { name: item[nameField], price: parseFloat(item[priceField] || 0) } : null;
      }
      
      return items.length > 0 ? { name: items[0][nameField], price: parseFloat(items[0][priceField] || 0) } : null;
    } catch (err) {
      return null;
    }
  };

  // Always use frontend calculations for accurate pricing
  const subtotal = itemsToCheckout.reduce((sum, item) => {
    const salePrice = getPriceForCurrency(item, 'sale');
    const regularPrice = getPriceForCurrency(item, 'regular') || 0;
    const price = salePrice || regularPrice;
    return sum + (price * item.quantity);
  }, 0);
  
  const totalPoints = itemsToCheckout.reduce((sum, item) => {
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

  // Check if user has enough points for items that require points
  let canBuyWithPointsOnly = true;
  
  if (totalPoints > 0) {
    canBuyWithPointsOnly = userPoints >= totalPoints;
  }

  const validateAddressFieldInput = (field: string, value: string) => {
    const result = validateAddressField(field as keyof AddressFormData, value);
    
    if (result.success) {
      const newErrors = { ...addressErrors };
      delete newErrors[field];
      setAddressErrors(newErrors);
    } else {
      setAddressErrors((prev) => ({
        ...prev,
        [field]: result.error,
      }));
    }
  };

  const handlePlaceOrder = async () => {
    // For buy-now, we don't need cartId
    if (!buyNowProduct && !cartId) {
      toast.error('Cart not found. Please try again.');
      console.error('No cartId available');
      return;
    }
    if (!resolvedWarehouseId) {
      toast.error('Warehouse not available. Please try again.');
      console.error('No warehouse ID');
      return;
    }

    // Validate address selection
    if (addressMode === 'default') {
      const defaultAddr = addresses.find((a) => a.is_default);
      if (!defaultAddr) {
        toast.error('Please select a delivery address.');
        return;
      }
    } else if (addressMode === 'existing') {
      if (!selectedAddressId) {
        toast.error('Please select a delivery address.');
        return;
      }
    } else if (addressMode === 'new') {
      const result = validateAddress(newAddress);
      
      if (!result.success) {
        setAddressErrors(result.errors);
        toast.error('Please fix the errors in the address form.');
        return;
      }
    } else {
      toast.error('Please select a delivery address.');
      return;
    }

    setPlacing(true);
    try {
      const payload: any = {
        warehouse: resolvedWarehouseId,
        currency,
        payment_method: paymentMethod,
        coupon_code: couponCode || undefined,
      };

      const authState = useAuthStore.getState();
      if (authState.isSebastianCardUser && authState.sebastianCardData && addressMode === 'default') {
        const card = authState.sebastianCardData;
        payload.new_address = {
          full_name: card.customer_name,
          phone: card.mobile,
          address_line1: card.address,
          address_line2: card.address_line2 || '',
          city: card.city,
          state: card.district || '',
          postal_code: card.pincode,
          country: 'India',
        };
      } else if (addressMode === 'existing') {
        payload.address_id = selectedAddressId;
      } else if (addressMode === 'new') {
        payload.new_address = newAddress;
      }

      // Add gift options if selected
      if (giftOptions.combo) {
        // Combo: both wrap and card
        if (giftOptions.selectedWrapId) {
          payload.gift_wrap_id = giftOptions.selectedWrapId;
        }
        if (giftOptions.greetingCard) {
          payload.gift_card_id = giftOptions.greetingCard;
        }
      } else {
        // Individual selections
        if (giftOptions.giftWrap && giftOptions.selectedWrapId) {
          payload.gift_wrap_id = giftOptions.selectedWrapId;
        }
        if (giftOptions.greetingCard) {
          payload.gift_card_id = giftOptions.greetingCard;
        }
      }
      
      if (giftOptions.message) {
        payload.gift_message = giftOptions.message;
      }

      console.log('Order payload:', payload);

      const order = await orderService.placeOrder(cartId || '', payload);
      setPlacedOrderId(order.id);
      // Store items before clearing cart
      setPlacedOrderItems(itemsToCheckout);
      if (!buyNowProduct) {
        clearCart();
      }
      setBuyNowProduct(null);
      // Clear gift options after successful order
      setGiftOptions({ giftWrap: false, combo: false });
      setOrderPlaced(true);
    } catch (error: any) {
      console.error('Checkout error:', error);
      const msg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to place order';
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!placedOrderId) {
      toast.error('Order ID not found.');
      return;
    }

    setDownloadingInvoice(true);
    try {
      const blob = await orderService.downloadInvoice(placedOrderId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${placedOrderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      const msg = error.response?.data?.detail || error.message || 'Failed to download invoice';
      toast.error(msg);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (orderPlaced) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
        <h1 className="font-display text-2xl mb-2">Order Confirmed!</h1>
        {placedOrderId && <p className="text-sm text-muted-foreground mb-4">Order #{placedOrderId}</p>}
        
        {/* Order Items */}
        <div className="mb-6 w-full max-w-md">
          <div className="bg-secondary/30 rounded-sm p-4 space-y-3">
            {placedOrderItems.map((item, i) => (
              <div key={i} className="text-left border-b border-secondary last:border-b-0 pb-3 last:pb-0">
                <p className="text-base font-display font-semibold text-foreground mb-1">{item.productName || item.productId}</p>
                <p className="text-xs text-muted-foreground">{item.color} / {item.size} × {item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground font-sans text-sm mb-6">Your order has been placed successfully. You will receive a confirmation email shortly.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
            className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 text-sm font-sans tracking-wider hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {downloadingInvoice ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Invoice
              </>
            )}
          </button>
          <Link to="/shop" className="bg-primary text-primary-foreground px-6 py-3 text-sm font-sans tracking-wider hover:opacity-90 transition-opacity">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center p-6">
        <ErrorState 
          title="Checkout Error"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  if (itemsToCheckout.length === 0) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-display text-2xl mb-2">Your cart is empty</h1>
        <Link to="/shop" className="text-sm font-sans underline">Continue Shopping</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground mb-8">
          <Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link>
          <ChevronRight className={`w-3 h-3`} />
          <span className="text-foreground">Checkout</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-display mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">

            {/* Delivery Address */}
            <section>
              <h2 className="font-display text-lg mb-4">Shipping Address</h2>

              {loadingAddresses ? (
                <p className="text-sm text-muted-foreground">Loading addresses...</p>
              ) : (
                <div className="space-y-3">
                  {/* Option: use default */}
                  {addresses.some((a) => a.is_default) && (
                    <label className={`flex items-start gap-3 border rounded-sm p-4 cursor-pointer transition-colors ${addressMode === 'default' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}>
                      <input type="radio" name="addressMode" checked={addressMode === 'default'} onChange={() => setAddressMode('default')} className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Use default address</p>
                        {(() => {
                          const def = addresses.find((a) => a.is_default);
                          return def ? (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {def.full_name} · {def.address_line1}, {def.city}, {def.state} {def.postal_code}
                            </p>
                          ) : null;
                        })()}
                      </div>
                    </label>
                  )}

                  {/* Option: pick existing */}
                  {addresses.length > 0 && (
                    <div className={`border rounded-sm transition-colors ${addressMode === 'existing' ? 'border-primary' : 'border-border'}`}>
                      <label className="flex items-center gap-3 p-4 cursor-pointer">
                        <input type="radio" name="addressMode" checked={addressMode === 'existing'} onChange={() => setAddressMode('existing')} />
                        <p className="text-sm font-medium">Choose a saved address</p>
                      </label>
                      {addressMode === 'existing' && (
                        <div className="px-4 pb-4 space-y-2">
                          {addresses.map((addr) => (
                            <label key={addr.id} className={`flex items-start gap-3 border rounded-sm p-3 cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}>
                              <input type="radio" name="selectedAddress" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-0.5" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{addr.full_name}</p>
                                  {addr.is_default && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Default</span>}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{addr.phone}</p>
                                <p className="text-xs text-muted-foreground">
                                  {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}, {addr.state} {addr.postal_code}, {addr.country}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Option: new address */}
                  <div className={`border rounded-sm transition-colors ${addressMode === 'new' ? 'border-primary' : 'border-border'}`}>
                    <label className="flex items-center gap-3 p-4 cursor-pointer">
                      <input type="radio" name="addressMode" checked={addressMode === 'new'} onChange={() => setAddressMode('new')} />
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <p className="text-sm font-medium">Add new address</p>
                      </div>
                    </label>
                    {addressMode === 'new' && (
                      <div className="px-4 pb-4 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground tracking-widest uppercase mb-1 block">Full Name *</label>
                            <Input 
                              value={newAddress.full_name} 
                              onChange={(e) => {
                                setNewAddress((p) => ({ ...p, full_name: e.target.value }));
                                validateAddressFieldInput('full_name', e.target.value);
                              }} 
                              className="bg-secondary/50" 
                            />
                            {addressErrors.full_name && (
                              <p className="text-[10px] text-destructive mt-1">{addressErrors.full_name}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground tracking-widest uppercase mb-1 block">Phone *</label>
                            <Input 
                              value={newAddress.phone} 
                              maxLength={10} 
                              onChange={(e) => {
                                setNewAddress((p) => ({ ...p, phone: e.target.value }));
                                validateAddressFieldInput('phone', e.target.value);
                              }} 
                              placeholder="10-digit number" 
                              className="bg-secondary/50" 
                            />
                            {addressErrors.phone && (
                              <p className="text-[10px] text-destructive mt-1">{addressErrors.phone}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground tracking-widest uppercase mb-1 block">Address Line 1 *</label>
                          <Input 
                            value={newAddress.address_line1} 
                            onChange={(e) => {
                              setNewAddress((p) => ({ ...p, address_line1: e.target.value }));
                              validateAddressFieldInput('address_line1', e.target.value);
                            }} 
                            className="bg-secondary/50" 
                          />
                          {addressErrors.address_line1 && (
                            <p className="text-[10px] text-destructive mt-1">{addressErrors.address_line1}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground tracking-widest uppercase mb-1 block">Address Line 2</label>
                          <Input 
                            value={newAddress.address_line2} 
                            onChange={(e) => setNewAddress((p) => ({ ...p, address_line2: e.target.value }))} 
                            className="bg-secondary/50" 
                          />
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground tracking-widest uppercase mb-1 block">City *</label>
                            <Input 
                              value={newAddress.city} 
                              onChange={(e) => {
                                setNewAddress((p) => ({ ...p, city: e.target.value }));
                                validateAddressFieldInput('city', e.target.value);
                              }} 
                              className="bg-secondary/50" 
                            />
                            {addressErrors.city && (
                              <p className="text-[10px] text-destructive mt-1">{addressErrors.city}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground tracking-widest uppercase mb-1 block">State *</label>
                            <Input 
                              value={newAddress.state} 
                              onChange={(e) => {
                                setNewAddress((p) => ({ ...p, state: e.target.value }));
                                validateAddressFieldInput('state', e.target.value);
                              }} 
                              className="bg-secondary/50" 
                            />
                            {addressErrors.state && (
                              <p className="text-[10px] text-destructive mt-1">{addressErrors.state}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground tracking-widest uppercase mb-1 block">Postal Code *</label>
                            <Input 
                              value={newAddress.postal_code} 
                              maxLength={6}
                              onChange={(e) => {
                                setNewAddress((p) => ({ ...p, postal_code: e.target.value }));
                                validateAddressFieldInput('postal_code', e.target.value);
                              }} 
                              className="bg-secondary/50" 
                            />
                            {addressErrors.postal_code && (
                              <p className="text-[10px] text-destructive mt-1">{addressErrors.postal_code}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground tracking-widest uppercase mb-1 block">Country *</label>
                          <Input 
                            value={newAddress.country} 
                            onChange={(e) => {
                              setNewAddress((p) => ({ ...p, country: e.target.value }));
                              validateAddressFieldInput('country', e.target.value);
                            }} 
                            className="bg-secondary/50" 
                          />
                          {addressErrors.country && (
                            <p className="text-[10px] text-destructive mt-1">{addressErrors.country}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* No addresses yet — default to new */}
                  {addresses.length === 0 && addressMode !== 'new' && (
                    <p className="text-xs text-muted-foreground">No saved addresses found.</p>
                  )}
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="font-display text-lg mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'cod', icon: Banknote, label: 'Cash on Delivery' },
                  // { id: 'upi', icon: Smartphone, label: 'UPI Payment' },
                  // { id: 'card', icon: CreditCard, label: 'Card Payment' },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 p-4 border rounded-sm transition-colors ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
                  >
                    <method.icon className="w-5 h-5" />
                    <span className="text-sm font-sans">{method.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Gift Packing Section */}
            {/* <GiftPackingSection /> */}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-border p-6 rounded-sm sticky top-24 space-y-4">
              <h3 className="font-display text-lg">Order Summary</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {itemsToCheckout.map((item, i) => {
                  const salePrice = getPriceForCurrency(item, 'sale');
                  const regularPrice = getPriceForCurrency(item, 'regular') || 0;
                  const price = salePrice || regularPrice;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="w-14 h-14 flex-shrink-0 bg-secondary rounded-sm overflow-hidden">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display truncate">{item.productName || item.productId}</p>
                        <p className="text-[10px] text-muted-foreground font-sans">{item.color} / {item.size} × {item.quantity}</p>
                        {item.required_points && (
                          <p className="text-[10px] text-primary font-sans font-medium">{item.required_points} Points</p>
                        )}
                        <p className="text-xs font-sans font-medium">{formatPrice(price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Gift Options */}
                {(giftOptions.giftWrap || giftOptions.greetingCard || giftOptions.combo) && (
                  <div className="border-t border-border pt-3 space-y-2">
                    {giftOptions.combo && (() => {
                      const wrapDetails = getGiftItemDetails('wrap', giftOptions.selectedWrapId);
                      const cardDetails = getGiftItemDetails('card', giftOptions.greetingCard);
                      const comboPrice = wrapDetails && cardDetails 
                        ? Math.round((wrapDetails.price + cardDetails.price) * 0.9)
                        : 0;
                      return (
                        <div className="text-xs font-sans space-y-1">
                          <p className="font-medium text-foreground">Gift Combo (Wrap + Card)</p>
                          {wrapDetails && (
                            <p className="text-muted-foreground text-[10px]">Wrap: {wrapDetails.name}</p>
                          )}
                          {cardDetails && (
                            <p className="text-muted-foreground text-[10px]">Card: {cardDetails.name}</p>
                          )}
                          {giftOptions.message && (
                            <p className="text-muted-foreground text-[10px] italic">Message: "{giftOptions.message.substring(0, 30)}{giftOptions.message.length > 30 ? '...' : ''}"</p>
                          )}
                          <p className="font-medium text-foreground text-[10px] pt-1">+{formatPrice(comboPrice)}</p>
                        </div>
                      );
                    })()}
                    {giftOptions.giftWrap && !giftOptions.combo && (() => {
                      const wrapDetails = getGiftItemDetails('wrap', giftOptions.selectedWrapId);
                      return (
                        <div className="text-xs font-sans space-y-1">
                          <p className="font-medium text-foreground">Gift Wrap</p>
                          {wrapDetails && (
                            <p className="text-muted-foreground text-[10px]">{wrapDetails.name}</p>
                          )}
                          {giftOptions.message && (
                            <p className="text-muted-foreground text-[10px] italic">Message: "{giftOptions.message.substring(0, 30)}{giftOptions.message.length > 30 ? '...' : ''}"</p>
                          )}
                          {wrapDetails && (
                            <p className="font-medium text-foreground text-[10px] pt-1">+{formatPrice(wrapDetails.price)}</p>
                          )}
                        </div>
                      );
                    })()}
                    {giftOptions.greetingCard && !giftOptions.combo && (() => {
                      const cardDetails = getGiftItemDetails('card', giftOptions.greetingCard);
                      return (
                        <div className="text-xs font-sans space-y-1">
                          <p className="font-medium text-foreground">Greeting Card</p>
                          {cardDetails && (
                            <p className="text-muted-foreground text-[10px]">{cardDetails.name}</p>
                          )}
                          {giftOptions.message && (
                            <p className="text-muted-foreground text-[10px] italic">Message: "{giftOptions.message.substring(0, 30)}{giftOptions.message.length > 30 ? '...' : ''}"</p>
                          )}
                          {cardDetails && (
                            <p className="font-medium text-foreground text-[10px] pt-1">+{formatPrice(cardDetails.price)}</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-sm font-sans">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal (Product Price)</span><span>{formatPriceExact(subtotal)}</span></div>
                {missingPoints > 0 && (
                  <div className="flex justify-between text-amber-800 dark:text-amber-400 font-medium">
                    <span>Points Shortage ({missingPoints} pts)</span>
                    <span>+{formatPriceExact(missingPoints)}</span>
                  </div>
                )}
                {totalPoints > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Points Required</span><span className="text-primary font-medium">{totalPoints}</span></div>
                )}
                {couponData && discount > 0 && (
                  <div className="flex justify-between text-green-600"><span>{discountLabel}</span><span>-{formatPriceExact(discount)}</span></div>
                )}
                {giftTotal > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Gift Packing Charges</span><span>{formatPriceExact(giftTotal)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-green-600">Free</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-medium text-base">
                  <span>Total</span><span>{formatPriceExact(calcTotal)}</span>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span>{formatPriceExact(gst)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                  <span>Grand Total</span><span>{formatPriceExact(grandTotal)}</span>
                </div>
                <div className="border-t border-border pt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Available Points</span>
                    <span className="font-medium">{userPoints}</span>
                  </div>
                  {totalPoints > 0 && (
                    <div className={`flex justify-between text-xs ${userPoints >= totalPoints ? 'text-green-600' : 'text-amber-600'}`}>
                      <span>Points Required</span>
                      <span className="font-medium">{totalPoints}</span>
                    </div>
                  )}
                  {totalPoints > 0 && userPoints < totalPoints && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <p className="text-[10px] text-amber-600 font-medium">
                        Missing {totalPoints - userPoints} points are paid as cash difference: +{formatPriceExact(totalPoints - userPoints)}
                      </p>
                    </div>
                  )}
                  {totalPoints > 0 && userPoints >= totalPoints && (
                    <p className="text-[10px] text-green-600 mt-1">
                      ✓ Paid using Loyalty Points!
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter coupon code"
                  disabled={isApplyingCoupon}
                  className="flex-1 border border-border px-3 py-2 text-xs font-sans bg-background focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                />
                <button
                  onClick={() => applyCoupon(couponInput, subtotal.toFixed(2))}
                  disabled={isApplyingCoupon}
                  className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-sans hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {couponCode && couponData && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-sm space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-sans font-medium text-green-900">Coupon Applied</p>
                      <p className="text-sm font-sans font-bold text-green-700 mt-1">{couponData.code}</p>
                      <p className="text-xs font-sans text-green-600 mt-1">
                        {couponData.type === 'percentage' 
                          ? `${couponData.value}% off` 
                          : `Discount: ${couponData.discountApplied}`}
                      </p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-sans font-medium rounded-sm transition-colors flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full py-4 text-sm font-sans tracking-wider transition-opacity bg-primary text-primary-foreground hover:opacity-90 active:scale-95 disabled:opacity-60"
              >
                {placing ? 'Placing order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
