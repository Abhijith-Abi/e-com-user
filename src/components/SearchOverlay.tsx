import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import productService, { Product } from '@/services/product.service';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onToggle }) => {
  const { currency, formatPriceRaw } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  // Debounced search function
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await productService.searchProducts(query, 8);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const getPriceValue = (product: Product): number => {
    const priceKey = `price_${currency.toLowerCase()}` as keyof Product;
    const salePriceKey = `sale_price_${currency.toLowerCase()}` as keyof Product;
    
    const salePrice = product[salePriceKey];
    const price = product[priceKey];
    
    return parseFloat(String(salePrice || price || '0'));
  };

  const handleSearch = (e?: React.FormEvent, queryOverride?: string) => {
    e?.preventDefault();
    const finalQuery = queryOverride || searchQuery;
    if (finalQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(finalQuery.trim())}`);
      onClose();
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger search on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onToggle();
      }
      
      // Close on Escape if open
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onToggle]);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure the element is rendered and autoFocus works
      const timer = setTimeout(() => {
        const input = document.getElementById('search-input');
        if (input) (input as HTMLInputElement).focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 pt-20 md:pt-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-2xl bg-background rounded-[2.5rem] shadow-2xl p-8 md:p-12 animate-in fade-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto border border-border">
        <button 
          onClick={onClose}
          className={cn(
            "absolute top-4 p-2 hover:bg-secondary rounded-full transition-colors z-10",
            "right-4"
          )}
          aria-label="Close search"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSearch} className="flex items-center gap-4 border-b-2 border-primary pb-3">
            <Search className="w-8 h-8 text-primary flex-shrink-0" />
            <input 
              id="search-input"
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent text-2xl md:text-3xl font-display outline-none w-full"
            />
            {isSearching && <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />}
          </form>

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="space-y-4">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">
                    Results: {searchResults.length}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {searchResults.map((product) => {
                      const img = product.primary_image || product.images?.find((i) => i.is_primary)?.image || product.images?.[0]?.image;
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="group text-start hover:opacity-75 transition-opacity"
                        >
                          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-secondary mb-2">
                            {img ? (
                              <img
                                src={img}
                                alt={product.name_en}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-secondary" />
                            )}
                          </div>
                          <p className="text-xs font-display truncate">{product.name_en}</p>
                          <p className="text-[10px] font-sans text-muted-foreground">
                            {formatPriceRaw(getPriceValue(product))}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    className="w-full py-3.5 text-sm font-sans font-bold text-primary hover:text-accent-foreground transition-all border border-primary rounded-full hover:bg-primary/5 shadow-lg shadow-primary/5"
                  >
                    View All Results
                  </button>
                </>
              ) : !isSearching && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No products found.
                </p>
              )}
            </div>
          )}

          {/* Trending could be fetched from API in future */}
          {!searchQuery.trim() && (
            <div className="py-8 text-center">
              <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">
                Search for products, categories, or collections
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
