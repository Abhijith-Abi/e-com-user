import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect } from 'react';

const WishlistTab = () => {
  const { formatPrice } = useSettingsStore();
  const { wishlistItems, isLoading, loadWishlist, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const items = wishlistItems.filter((item) => item.product_detail);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <h2 className="font-display text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Wishlist</h2>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-wider uppercase bg-zinc-50 dark:bg-zinc-800/50 px-2.5 py-1 rounded-lg border border-zinc-100/50 dark:border-zinc-800/50">
          {items.length} Items
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-4">
          <svg className="animate-spin h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-zinc-400 font-sans text-xs tracking-wider uppercase font-semibold">Loading wishlist items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-50/40 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-850 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 bg-zinc-100/50 dark:bg-zinc-850 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100/50">
            <Heart className="w-6 h-6 text-zinc-450 dark:text-zinc-500" />
          </div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Your Wishlist is Empty</p>
          <p className="text-xs text-zinc-450 dark:text-zinc-400 mb-5">Explore our store and add items that catch your eye!</p>
          <Button asChild variant="outline" size="sm" className="rounded-xl border-zinc-200 text-zinc-700 font-sans font-bold text-xs tracking-wide py-4 transition-all duration-300">
            <Link to="/shop">Explore Products</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {items.map((item) => {
              const detail = item.product_detail!;
              return (
                <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-4 rounded-2xl flex gap-4 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300 group">
                  <Link to={`/product/${detail.id}`} className="w-20 h-20 bg-zinc-50/50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850 overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-sm">
                    <img
                      src={detail.image.url}
                      alt={detail.name_en}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <Link to={`/product/${detail.id}`} className="font-display text-sm font-extrabold text-zinc-900 dark:text-zinc-50 hover:underline line-clamp-1 leading-snug">
                        {detail.name_en}
                      </Link>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-0.5 tracking-wider">{detail.sku}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50">
                        {formatPrice(parseFloat(detail.sale_price_inr || detail.price_inr))}
                        {detail.sale_price_inr && (
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-550 font-bold line-through ml-2">
                            {formatPrice(parseFloat(detail.price_inr))}
                          </span>
                        )}
                      </p>
                      
                      <button
                        onClick={() => toggleWishlist(item.product)}
                        className="p-1.5 rounded-lg border border-zinc-100 hover:border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700 text-zinc-450 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 shadow-sm flex-shrink-0"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button asChild variant="outline" className="gap-2 rounded-xl border-zinc-200 text-zinc-700 font-sans font-bold text-xs tracking-wide py-4 transition-all duration-300">
            <Link to="/wishlist">
              View Full Wishlist <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </>
      )}
    </div>
  );
};

export default WishlistTab;
