import { Gift, MessageSquare, Package, CreditCard, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useRef, useState, useEffect } from 'react';
import giftCardService, { type GiftCard, type GiftWrap } from '@/services/giftcard.service';

const ItemSlider = ({
  selectedItem,
  onSelectItem,
  items,
  currency,
  formatPrice,
  itemNameField = 'card_name',
}: {
  selectedItem: string | undefined;
  onSelectItem: (id: string) => void;
  items: (GiftCard | GiftWrap)[];
  currency: string;
  formatPrice: (price: number) => string;
  itemNameField?: 'card_name' | 'wrap_name';
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getItemPrice = (item: GiftCard | GiftWrap): number => {
    const priceField = currency === 'INR' ? 'price_inr' :
                       currency === 'GBP' ? 'price_gbp' :
                       currency === 'USD' ? 'price_usd' : 'price_inr';
    const price = (item as any)[priceField];
    return price && price !== 'null' ? parseFloat(String(price)) : 0;
  };

  const isOutOfStock = (item: GiftCard | GiftWrap): boolean => {
    return (item as any).units === 0;
  };

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = dir === 'left' ? -220 : 220;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground font-sans py-2">
        No items available
      </p>
    );
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className={`absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors`}
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className={`absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors`}
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map(item => {
          const isSelected = selectedItem === item.id;
          const itemPrice = getItemPrice(item);
          const itemName = (item as any)[itemNameField];
          const outOfStock = isOutOfStock(item);
          return (
            <button
              key={item.id}
              onClick={() => !outOfStock && onSelectItem(item.id)}
              disabled={outOfStock}
              className={`relative flex-shrink-0 w-[110px] rounded-sm overflow-hidden border-2 transition-all ${outOfStock ? 'opacity-50 cursor-not-allowed border-border' : isSelected ? 'border-primary shadow-md' : 'border-border hover:border-muted-foreground/40'}`}
            >
              <img
                src={item.image}
                alt={itemName}
                className="w-full aspect-[4/5] object-cover"
              />
              {outOfStock && (
                <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                  <span className="text-xs font-sans font-bold text-background">Out of Stock</span>
                </div>
              )}
              {isSelected && !outOfStock && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="py-1.5 px-1 bg-background">
                <span className={`text-[10px] font-sans font-medium leading-tight block ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {itemName}
                </span>
                <span className={`text-[9px] font-sans leading-tight block mt-0.5 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {formatPrice(itemPrice)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const GiftPackingSection = () => {
  const { formatPrice, formatPriceRaw, currency } = useSettingsStore();
  const { giftOptions, setGiftOptions } = useCheckoutStore();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [giftWraps, setGiftWraps] = useState<GiftWrap[]>([]);

  useEffect(() => {
    giftCardService.getGiftCards()
      .then(res => {
        const activeCards = res.results.filter(c => c.status === 'active' && !c.is_deleted);
        setGiftCards(activeCards);
        localStorage.setItem('gift_cards_cache', JSON.stringify(activeCards));
        
        // Check if selected greeting card is out of stock
        if (giftOptions.greetingCard) {
          const selectedCard = activeCards.find(c => c.id === giftOptions.greetingCard);
          if (!selectedCard || selectedCard.units === 0) {
            // Remove out of stock card from selection
            setGiftOptions({ ...giftOptions, greetingCard: undefined, combo: false });
          }
        }
      })
      .catch(err => console.error('Failed to fetch gift cards:', err));
    
    giftCardService.getGiftWraps()
      .then(res => {
        const activeWraps = res.results.filter(w => w.status === 'active' && !w.is_deleted);
        setGiftWraps(activeWraps);
        localStorage.setItem('gift_wraps_cache', JSON.stringify(activeWraps));
        
        // Check if selected gift wrap is out of stock
        if (giftOptions.selectedWrapId) {
          const selectedWrap = activeWraps.find(w => w.id === giftOptions.selectedWrapId);
          if (!selectedWrap || selectedWrap.units === 0) {
            // Remove out of stock wrap from selection
            setGiftOptions({ ...giftOptions, selectedWrapId: undefined, giftWrap: false, combo: false });
          }
        }
      })
      .catch(err => console.error('Failed to fetch gift wraps:', err));
  }, []);

  // Get price for current currency from gift card
  const getGiftCardPrice = (card: GiftCard): number => {
    const priceField = currency === 'INR' ? 'price_inr' :
                       currency === 'GBP' ? 'price_gbp' :
                       currency === 'USD' ? 'price_usd' : 'price_inr';
    const price = (card as any)[priceField];
    return price && price !== 'null' ? parseFloat(String(price)) : 0;
  };

  // Get price for current currency from gift wrap
  const getGiftWrapPrice = (wrap: GiftWrap): number => {
    const priceField = currency === 'INR' ? 'price_inr' :
                       currency === 'GBP' ? 'price_gbp' :
                       currency === 'USD' ? 'price_usd' : 'price_inr';
    const price = (wrap as any)[priceField];
    return price && price !== 'null' ? parseFloat(String(price)) : 0;
  };

  // Get the first active gift wrap price for wrap option
  const giftWrapPrice = giftWraps.length > 0 ? getGiftWrapPrice(giftWraps[0]) : 0;
  const giftCardPrice = giftCards.length > 0 ? getGiftCardPrice(giftCards[0]) : 0;
  const GIFT_WRAP_PRICE = giftWrapPrice;
  const GREETING_CARD_PRICE = giftCardPrice;
  const COMBO_PRICE = giftWrapPrice + giftCardPrice - Math.round((giftWrapPrice + giftCardPrice) * 0.1); // Combo with 10% discount

  // Get the selected wrap's price
  const getSelectedWrapPrice = (): number => {
    const selectedWrap = giftWraps.find(w => w.id === (giftOptions.selectedWrapId || giftWraps[0]?.id));
    return selectedWrap ? getGiftWrapPrice(selectedWrap) : GIFT_WRAP_PRICE;
  };

  // Get the selected greeting card's price
  const getSelectedCardPrice = (): number => {
    const selectedCard = giftCards.find(c => c.id === giftOptions.greetingCard);
    return selectedCard ? getGiftCardPrice(selectedCard) : GREETING_CARD_PRICE;
  };

  const handleToggleWrap = () => {
    setGiftOptions({ ...giftOptions, giftWrap: !giftOptions.giftWrap, combo: false });
  };

  const handleToggleCard = () => {
    if (giftOptions.greetingCard) {
      setGiftOptions({ ...giftOptions, greetingCard: undefined, combo: false });
    } else {
      // Don't auto-select a card, let user choose
      setGiftOptions({ ...giftOptions, greetingCard: '', combo: false });
    }
  };

  const handleSelectCard = (cardId: string) => {
    setGiftOptions({ ...giftOptions, greetingCard: cardId });
  };

  const handleSelectWrap = (wrapId: string) => {
    setGiftOptions({ ...giftOptions, selectedWrapId: wrapId });
  };

  const handleToggleCombo = () => {
    const newCombo = !giftOptions.combo;
    setGiftOptions({
      ...giftOptions,
      combo: newCombo,
      giftWrap: newCombo ? true : giftOptions.giftWrap,
      greetingCard: newCombo ? giftOptions.greetingCard : giftOptions.greetingCard,
    });
  };

  const handleMessageChange = (msg: string) => {
    setGiftOptions({ ...giftOptions, message: msg });
  };

  const getGiftTotal = () => {
    const selectedWrapPrice = getSelectedWrapPrice();
    const selectedCardPrice = getSelectedCardPrice();
    
    if (giftOptions.combo) {
      return Math.round((selectedWrapPrice + selectedCardPrice) * 0.9); // 10% discount
    }
    
    let total = 0;
    if (giftOptions.giftWrap) total += selectedWrapPrice;
    if (giftOptions.greetingCard) total += selectedCardPrice;
    return total;
  };

  const giftTotal = getGiftTotal();

  return (
    <div className="border border-border rounded-sm p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <Gift className="w-5 h-5 text-accent-foreground" />
        <h3 className="font-display text-lg">Gift Packing</h3>
      </div>
      <p className="text-xs text-muted-foreground font-sans">Make your gift special with our premium packing options.</p>

      {/* Gift Wrap Option */}
      <label className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${giftOptions.giftWrap && !giftOptions.combo ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}>
        <input type="checkbox" checked={giftOptions.giftWrap && !giftOptions.combo} onChange={handleToggleWrap} className="mt-0.5 accent-primary" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-sans font-medium">Add Gift Wrap</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-sans mt-0.5">Premium wrap with a decorative ribbon.</p>
        </div>
  <span className="text-sm font-sans font-medium whitespace-nowrap">+{formatPriceRaw(getSelectedWrapPrice())}</span>
      </label>

      {giftOptions.giftWrap && !giftOptions.combo && (
        <div className="space-y-2">
          <p className="text-xs font-sans text-muted-foreground">Select Gift Wrap Style</p>
          <ItemSlider selectedItem={giftOptions.selectedWrapId || giftWraps[0]?.id} onSelectItem={handleSelectWrap} items={giftWraps} currency={currency} formatPrice={formatPrice} itemNameField="wrap_name" />
        </div>
      )}

      {/* Greeting Card Option */}
      <label className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${giftOptions.greetingCard && !giftOptions.combo ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}>
        <input type="checkbox" checked={!!giftOptions.greetingCard && !giftOptions.combo} onChange={handleToggleCard} className="mt-0.5 accent-primary" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-sans font-medium">Add Greeting Card</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-sans mt-0.5">A beautiful card with your custom message.</p>
        </div>
        {giftOptions.greetingCard && !giftOptions.combo && (
          <span className="text-sm font-sans font-medium whitespace-nowrap">+{formatPriceRaw(getSelectedCardPrice())}</span>
        )}
      </label>

      {giftOptions.greetingCard && !giftOptions.combo && (
        <div className="space-y-2">
          <p className="text-xs font-sans text-muted-foreground">Select Card Design</p>
          <ItemSlider selectedItem={giftOptions.greetingCard} onSelectItem={handleSelectCard} items={giftCards} currency={currency} formatPrice={formatPrice} itemNameField="card_name" />
        </div>
      )}

      {/* Combo Option */}
      <label className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors ${giftOptions.combo ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}>
        <input type="checkbox" checked={giftOptions.combo} onChange={handleToggleCombo} className="mt-0.5 accent-primary" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-sans font-medium">Gift Combo (Wrap + Card)</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-sans mt-0.5">Get both gift wrap and a greeting card at a discounted price.</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-sm font-sans line-through text-muted-foreground">+{formatPriceRaw(getSelectedWrapPrice() + getSelectedCardPrice())}</span>
            <span className="text-sm font-sans font-medium whitespace-nowrap">+{formatPriceRaw(Math.round((getSelectedWrapPrice() + getSelectedCardPrice()) * 0.9))}</span>
          </div>
          <p className="text-[10px] text-green-600 font-sans">Save 10%</p>
        </div>
      </label>

      {giftOptions.combo && (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-sans text-muted-foreground">Select Wrap Style</p>
            <ItemSlider selectedItem={giftOptions.selectedWrapId || giftWraps[0]?.id} onSelectItem={handleSelectWrap} items={giftWraps} currency={currency} formatPrice={formatPrice} itemNameField="wrap_name" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-sans text-muted-foreground">Select Card Design</p>
            <ItemSlider selectedItem={giftOptions.greetingCard} onSelectItem={handleSelectCard} items={giftCards} currency={currency} formatPrice={formatPrice} itemNameField="card_name" />
          </div>
        </div>
      )}

      {/* Custom Message */}
      {(giftOptions.giftWrap || giftOptions.greetingCard || giftOptions.combo) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <label className="text-xs font-sans text-muted-foreground">Custom Message</label>
          </div>
          <textarea
            value={giftOptions.message || ''}
            onChange={e => handleMessageChange(e.target.value)}
            placeholder="Write your personal message here..."
            maxLength={200}
            rows={3}
            className="w-full border border-border px-3 py-2.5 text-xs font-sans bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <p className="text-[10px] text-muted-foreground font-sans text-right">
            {(giftOptions.message || '').length}/200
          </p>
        </div>
      )}

      {giftTotal > 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-xs font-sans text-muted-foreground">Gift Packing Charges</span>
          <span className="text-sm font-sans font-medium">{formatPrice(giftTotal)}</span>
        </div>
      )}
    </div>
  );
};

export default GiftPackingSection;
