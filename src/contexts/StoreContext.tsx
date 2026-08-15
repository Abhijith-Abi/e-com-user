import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'INR';

const currencySymbols: Record<Currency, string> = {
  INR: '₹',
};

const exchangeRates: Record<Currency, number> = {
  INR: 1,
};

export interface CartItem {
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface GiftOptions {
  giftWrap: boolean;
  greetingCard?: string;
  combo: boolean;
  message?: string;
}


interface StoreContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceINR: number) => string;
  currencySymbol: string;
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  wishlistItems: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  couponCode: string;
  setCouponCode: (code: string) => void;
  couponDiscount: number;
  applyCoupon: (code: string) => boolean;
  user: UserProfile | null;
  login: (profile: UserProfile) => void;
  logout: () => void;
  giftOptions: GiftOptions;
  setGiftOptions: (options: GiftOptions) => void;
  getGiftTotal: () => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_KEY = 'iqra_cart';
const WISHLIST_KEY = 'iqra_wishlist';
const USER_KEY = 'iqra_user';

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  });
  const [wishlistItems, setWishlistItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  });
  const [giftOptions, setGiftOptions] = useState<GiftOptions>({ giftWrap: false, combo: false });

  const getGiftTotal = () => {
    if (giftOptions.combo) return 249;
    let total = 0;
    if (giftOptions.giftWrap) total += 199;
    if (giftOptions.greetingCard) total += 99;
    return total;
  };

  const login = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };


  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, []);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistItems)); }, [wishlistItems]);

  const formatPrice = (priceINR: number) => {
    const converted = Math.round(priceINR * exchangeRates[currency]);
    return `${currencySymbols[currency]}${converted.toLocaleString()}`;
  };

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.findIndex(i => i.productId === item.productId && i.color === item.color && i.size === item.size);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + item.quantity };
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (index: number) => setCartItems(prev => prev.filter((_, i) => i !== index));
  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map((item, i) => i === index ? { ...item, quantity } : item));
  };
  const clearCart = () => setCartItems([]);


  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleWishlist = (productId: string) => {
    setWishlistItems(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };
  const isWishlisted = (productId: string) => wishlistItems.includes(productId);

  const applyCoupon = (code: string) => {
    const upperCode = code.toUpperCase().trim();
    if (upperCode === 'WELCOME10') { setCouponDiscount(10); setCouponCode(upperCode); return true; }
    if (upperCode === 'FLAT20') { setCouponDiscount(20); setCouponCode(upperCode); return true; }
    if (upperCode === 'IQRA15') { setCouponDiscount(15); setCouponCode(upperCode); return true; }
    setCouponDiscount(0); setCouponCode(''); return false;
  };

  return (
    <StoreContext.Provider value={{
      currency, setCurrency,
      formatPrice,
      currencySymbol: currencySymbols[currency],
      cartItems, addToCart, removeFromCart, updateCartQuantity, clearCart,
      cartCount,
      wishlistItems, toggleWishlist, isWishlisted,
      couponCode, setCouponCode, couponDiscount, applyCoupon,
      user, login, logout,
      giftOptions, setGiftOptions, getGiftTotal,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
