import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useEffect, useState } from 'react';
import type { Product } from '@/services/product.service';
import ProductCard from '@/components/ProductCard';
import ErrorState from '@/components/ErrorState';

const Wishlist = () => {
  const { wishlistItems, loadWishlist } = useWishlistStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setError(null);
        await loadWishlist();
      } catch (err: any) {
        console.error('Failed to load wishlist:', err);
        setError(err.message || 'Failed to load your wishlist. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [loadWishlist]);

  // Convert wishlist items to Product format
  useEffect(() => {
    if (!loading && wishlistItems.length > 0) {
      const convertedProducts: Product[] = wishlistItems
        .filter(item => item.product_detail)
        .map(item => {
          const detail = item.product_detail!;
          
          // Calculate total stock from sizes array
          let totalStock = detail.stock || 0;
          if (detail.sizes && detail.sizes.length > 0) {
            totalStock = detail.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
          }
          
          return {
            id: detail.id,
            name_en: detail.name_en,
            sku: detail.sku,
            price_inr: detail.price_inr,
            price_gbp: detail.price_gbp,
            price_usd: detail.price_usd,
            sale_price_inr: detail.sale_price_inr,
            sale_price_gbp: detail.sale_price_gbp,
            sale_price_usd: detail.sale_price_usd,
            stock: totalStock,
            colors: detail.colors,
            sizes: detail.sizes,
            primary_image: detail.image.url,
            images: [{
              id: detail.image.id,
              image: detail.image.url,
              is_primary: true,
              color: detail.image.color,
              stock: totalStock,
              sizes: detail.sizes,
              created_at: '',
              updated_at: '',
            }],
            category: '',
            is_featured: false,
            status: 'active',
            created_at: item.created_at,
            updated_at: item.updated_at,
            is_active: true,
            is_deleted: false,
          } as Product;
        });
      
      setProducts(convertedProducts);
    } else if (!loading) {
      setProducts([]);
    }
  }, [wishlistItems, loading]);

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse font-sans">Loading your favorites...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center p-6">
        <ErrorState 
          title="Wishlist Unavailable"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Heart className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl mb-2">Your wishlist is empty</h1>
        <p className="text-muted-foreground font-sans text-sm mb-6">Looks like you haven't added anything to your wishlist yet.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-sans tracking-wider hover:opacity-90 transition-opacity">
          Explore Products <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-display mb-2">Wishlist</h1>
        <p className="text-muted-foreground font-sans text-sm mb-8">{products.length} Items</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Wishlist;
