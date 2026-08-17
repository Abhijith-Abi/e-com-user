import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistWithAuth } from '@/hooks/useWishlistWithAuth';
import type { Product } from '@/services/product.service';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { formatPriceRaw, currency } = useSettingsStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistWithAuth();
  const wishlisted = isWishlisted(product.id);

  // Stock management - use product-level stock, fallback to images array
  const calculateTotalStock = () => {
    // First check product-level stock
    if (product?.stock !== undefined && product.stock !== null) {
      return product.stock;
    }
    
    // Fallback to images array if product stock not available
    if (!product?.images || product.images.length === 0) return 0;
    return product.images.reduce((total, img) => {
      // If sizes array exists and has items, sum their stock
      if (img.sizes && img.sizes.length > 0) {
        const sizeStock = img.sizes.reduce((sizeTotal, size) => {
          return sizeTotal + (size.stock || 0);
        }, 0);
        return total + sizeStock;
      }
      // Otherwise use image-level stock
      return total + (img.stock || 0);
    }, 0);
  };

  const stock = calculateTotalStock();
  const lowStockThreshold = product?.low_stock_threshold || 5;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= lowStockThreshold;

  // Get product name based on language
  const productName = product.name_en;

  // Get price based on currency
  const price =
    currency === 'INR'
      ? parseFloat(product.price_inr || '0')
      : currency === 'GBP'
        ? parseFloat(product.price_gbp || '0')
        : currency === 'USD'
          ? parseFloat(product.price_usd || '0')
          : parseFloat(product.price_inr || '0');

  const salePriceStr =
    currency === 'INR'
      ? product.sale_price_inr
      : currency === 'GBP'
        ? product.sale_price_gbp
        : currency === 'USD'
          ? product.sale_price_usd
          : product.sale_price_inr;

  const salePrice = salePriceStr ? parseFloat(salePriceStr) : null;
  const originalPrice = salePrice ? price : null;
  const displayPrice = salePrice || price;

  // Get primary image - primary_image is a string URL from API, or fallback to images array
  const primaryImage = product.primary_image || 
                       product.images?.find(img => img.is_primary)?.image || 
                       product.images?.[0]?.image || 
                       '';

  return (
    <div className="group">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary mb-3 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={productName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {product.is_featured && (
            <span className="absolute top-3 start-3 bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-3 py-1 font-sans rounded-full">
              NEW
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground text-xs tracking-widest uppercase px-4 py-2 font-sans font-bold rounded-full">
                Out of Stock
              </span>
            </div>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="absolute top-3 start-3 bg-orange-500 text-white text-[10px] tracking-widest uppercase px-3 py-1 font-sans rounded-full">
              Low Stock
            </span>
          )}
          <button
            className={`absolute top-3 end-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${wishlisted ? 'bg-primary text-primary-foreground opacity-100' : 'bg-background/80 opacity-0 group-hover:opacity-100'}`}
            aria-label="Add to Wishlist"
            onClick={async (e) => {
              e.preventDefault();
              await toggleWishlist(product.id);
            }}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </Link>
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm md:text-base leading-tight">{productName}</h3>
        </div>
        <p className="text-xs text-muted-foreground font-sans tracking-wide">{product.sku}</p>
        {product.required_points > 0 && (
          <p className="text-xs text-primary font-sans font-medium">
            {product.required_points} Points Required
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-sans text-sm">
            <span className="font-medium">{formatPriceRaw(displayPrice)}</span>
            {originalPrice && (
              <span className="text-muted-foreground line-through text-xs">
                {formatPriceRaw(originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={async () => {
              try {
                // Find the primary image
                const primaryImageObj = product.images?.find(img => img.is_primary);
                const primaryImageUrl = primaryImageObj?.image || product.primary_image || product.images?.[0]?.image || '';
                
                // Get the color from the primary image
                const primaryColor = primaryImageObj?.color || product.colors?.[0] || '';
                
                await addToCart({ 
                  productId: product.id, 
                  color: primaryColor, 
                  size: product.sizes?.[0] || '', 
                  quantity: 1,
                  productImage: primaryImageUrl,
                  productName: productName,
                  required_points: product.required_points,
                });
                toast.success(`${productName} added to cart`);
              } catch (error) {
                // Error is already handled in the store
              }
            }}
            disabled={isOutOfStock}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add to Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
