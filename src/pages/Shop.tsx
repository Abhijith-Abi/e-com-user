import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import SEO from '@/components/SEO';
import { Product } from '@/services/product.service';
import { Category } from '@/services/category.service';

type SortOption = 'latest' | 'popularity' | 'price-asc' | 'price-desc';

import ErrorState from '@/components/ErrorState';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const { currency } = useSettingsStore();
  const { categories: apiCategories } = useCategories({ status: 'active', ordering: '-created_at' });
  
  // Find the selected category and determine if it's a parent or subcategory
  const selectedCategoryInfo = useMemo(() => {
    if (activeCategory === 'all') return { id: undefined, slug: undefined, isParent: false };
    const category = apiCategories.find(c => c.slug === activeCategory);
    if (!category) return { id: undefined, slug: undefined, isParent: false };
    
    return {
      id: category.id,
      slug: category.slug,
      isParent: category.parent === null,
      parent: category.parent
    };
  }, [activeCategory, apiCategories]);

  // Get parent categories and their subcategories
  const categoryStructure = useMemo(() => {
    const parents = apiCategories.filter((c: Category) => c.parent === null);
    return parents.map(parent => ({
      ...parent,
      children: apiCategories.filter((c: Category) => c.parent === parent.id)
    }));
  }, [apiCategories]);

  // State for sorting and filtering
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 120000]);
  
  // Map sort option to API ordering parameter
  const getOrderingParam = (sort: SortOption): string => {
    switch (sort) {
      case 'latest':
        return '-created_at';
      case 'popularity':
        return '-popularity';
      case 'price-asc':
        return 'price_inr';
      case 'price-desc':
        return '-price_inr';
      default:
        return '-created_at';
    }
  };

  // Fetch products from API with appropriate category filter and sorting
  const { products: apiProducts, loading: productsLoading, error: productsError, hasMore, loadingMore, loadMore } = useProducts({
    status: 'active',
    ...(selectedCategoryInfo.isParent && selectedCategoryInfo.id ? { category: selectedCategoryInfo.id } : {}),
    ...(!selectedCategoryInfo.isParent && selectedCategoryInfo.id ? { sub_category: selectedCategoryInfo.id } : {}),
    ordering: getOrderingParam(sortBy),
  });

  // Intersection Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !productsLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, productsLoading, loadMore]);

  const sortLabels: Record<SortOption, string> = {
    latest: 'Latest Arrivals',
    popularity: 'Popularity',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
  };

  // Extract unique sizes and colors from API products
  const availableSizes = useMemo(() => {
    if (!apiProducts) return [];
    const sizes = new Set<string>();
    apiProducts.forEach(p => {
      if (p.sizes) {
        const sizeArray = typeof p.sizes === 'string' 
          ? p.sizes.split(',').map(s => s.trim()).filter(Boolean)
          : p.sizes;
        sizeArray.forEach(s => sizes.add(s));
      }
    });
    return Array.from(sizes).sort();
  }, [apiProducts]);

  const availableColors = useMemo(() => {
    if (!apiProducts) return [];
    const colors = new Set<string>();
    apiProducts.forEach(p => {
      if (p.colors) {
        const colorArray = typeof p.colors === 'string' 
          ? p.colors.split(',').map(c => c.trim()).filter(Boolean)
          : p.colors;
        colorArray.forEach(c => colors.add(c));
      }
    });
    return Array.from(colors).sort();
  }, [apiProducts]);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 120000]);
  };

  // Helper to get price based on currency
  const getPrice = (product: Product) => {
    const price = currency === 'INR' ? parseFloat(product.price_inr) :
                  currency === 'GBP' ? parseFloat(product.price_gbp || '0') :
                  currency === 'USD' ? parseFloat(product.price_usd) :
                  parseFloat(product.price_inr);
    return price;
  };

  const filteredProducts = useMemo(() => {
    let result = apiProducts ? [...apiProducts] : [];

    // Filter by Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name_en.toLowerCase().includes(query) || 
        (p.description_en && p.description_en.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query))
      );
    }

    // Filter by sizes
    if (selectedSizes.length) {
      result = result.filter(p => {
        if (!p.sizes) return false;
        const sizeArray = typeof p.sizes === 'string' 
          ? p.sizes.split(',').map(s => s.trim()).filter(Boolean)
          : p.sizes;
        return sizeArray.some(s => selectedSizes.includes(s));
      });
    }

    // Filter by colors
    if (selectedColors.length) {
      result = result.filter(p => {
        if (!p.colors) return false;
        const colorArray = typeof p.colors === 'string' 
          ? p.colors.split(',').map(c => c.trim()).filter(Boolean)
          : p.colors;
        return colorArray.some(c => selectedColors.includes(c));
      });
    }

    // Filter by price range
    result = result.filter(p => {
      const price = getPrice(p);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    return result;
  }, [apiProducts, searchQuery, selectedSizes, selectedColors, priceRange, currency]);

  return (
    <main className="min-h-screen">
      <SEO title={searchQuery ? `Search: ${searchQuery}` : "Shop"} />
      {/* Header */}
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-display mb-2">
          {searchQuery ? `Search results for "${searchQuery}"` : "Shop"}
        </h1>
        <p className="text-muted-foreground font-sans text-sm">
          {productsLoading ? "Loading collection..." : productsError ? "Error loading products" : `${filteredProducts.length} Products`}
        </p>
      </div>

      {/* Category Pills */}
      <div className="container pb-6">
        <div className="flex flex-wrap gap-2">
          {/* All button */}
          <button
            onClick={() => navigate('/shop')}
            className={`px-4 py-2 text-xs font-sans font-medium rounded-full transition-colors ${
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'border border-border hover:bg-secondary'
            }`}
          >
            All
          </button>

          {/* All categories (parents and subcategories) */}
          {apiCategories.map((category: Category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/shop?category=${category.slug}`)}
              className={`px-4 py-2 text-xs font-sans font-medium rounded-full transition-colors ${
                activeCategory === category.slug
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'border border-border hover:bg-secondary'
              }`}
            >
              {category.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Sort & Filter Bar */}
      <div className="container flex items-center justify-between pb-6">
        <button
          onClick={() => setFilterOpen(true)}
          disabled={!!productsError}
          className="flex items-center gap-2 text-sm font-sans border border-border px-6 py-2.5 rounded-full hover:bg-secondary transition-colors shadow-sm disabled:opacity-50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>

        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            disabled={!!productsError}
            className="flex items-center gap-2 text-sm font-sans border border-border px-6 py-2.5 rounded-full hover:bg-secondary transition-colors shadow-sm disabled:opacity-50"
          >
            {sortLabels[sortBy]}
            <ChevronDown className="w-3 h-3" />
          </button>
          {sortOpen && (
            <div className="absolute end-0 top-full mt-2 bg-background border border-border shadow-xl min-w-[220px] z-20 rounded-2xl overflow-hidden p-1">
              {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSortBy(key); setSortOpen(false); }}
                  className={`block w-full text-start px-4 py-2.5 text-sm font-sans rounded-xl hover:bg-secondary transition-colors ${sortBy === key ? 'bg-primary/5 font-semibold text-primary' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="container pb-16">
        {productsLoading && apiProducts.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[3/4] bg-secondary/50 rounded-2xl" />
            ))}
          </div>
        ) : productsError ? (
          <div className="flex justify-center py-20">
            <ErrorState 
              title="Shop Unavailable"
              message={productsError}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="py-8 flex justify-center">
              {loadingMore && (
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              )}
            </div>

            {filteredProducts.length === 0 && !loadingMore && (
              <div className="text-center py-20">
                <p className="font-display text-xl mb-2">No products found</p>
                <p className="text-muted-foreground font-sans text-sm">Try adjusting your filters or search query.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setFilterOpen(false)} />
          <div className="absolute end-0 top-0 bottom-0 w-[85%] max-w-sm bg-background animate-slide-in-right overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-display text-lg">Filters</h3>
              <button onClick={() => setFilterOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-8">
              {/* Size */}
              <div>
                <h4 className="font-display text-sm mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.length > 0 ? (
                    availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => toggleFilter(selectedSizes, size, setSelectedSizes)}
                        className={`px-4 py-2 text-xs font-sans border rounded-full transition-colors ${selectedSizes.includes(size) ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'border-border hover:bg-secondary'}`}
                      >
                        {size}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No sizes available</p>
                  )}
                </div>
              </div>

              {/* Colour */}
              <div>
                <h4 className="font-display text-sm mb-3">Colour</h4>
                <div className="flex flex-wrap gap-2">
                  {availableColors.length > 0 ? (
                    availableColors.map(color => (
                      <button
                        key={color}
                        onClick={() => toggleFilter(selectedColors, color, setSelectedColors)}
                        className={`px-4 py-2 text-xs font-sans border rounded-full transition-colors ${selectedColors.includes(color) ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'border-border hover:bg-secondary'}`}
                      >
                        {color}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No colors available</p>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-display text-sm mb-3">Price Range</h4>
                <input
                  type="range"
                  min="0"
                  max="120000"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs font-sans text-muted-foreground mt-1">
                  <span>₹0</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="sticky bottom-0 bg-background border-t border-border p-5 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 border border-border py-3.5 rounded-full text-sm font-sans font-medium tracking-wide hover:bg-secondary transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-full text-sm font-sans font-bold tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Shop;
