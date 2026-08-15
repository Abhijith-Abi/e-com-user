import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Minus, Plus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useProduct } from '@/hooks/useProduct';
import { useProducts } from '@/hooks/useProducts';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCartStore } from '@/store/useCartStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useWishlistWithAuth } from '@/hooks/useWishlistWithAuth';
import { cartService } from '@/services/cart.service';
import warehouseService from '@/services/warehouse.service';
import ProductCard from '@/components/ProductCard';
import ProductImageGallery from '@/components/ProductImageGallery';
import SizeGuideDialog from '@/components/SizeGuideDialog';
import ErrorState from '@/components/ErrorState';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id);
  const { products: relatedProductsData } = useProducts({ status: 'active' });
  const { formatPriceRaw, currency, warehouseId } = useSettingsStore();
  const { addToCart, isAddingToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistWithAuth();
  const { setBuyNowProduct } = useCheckoutStore();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [resolvedWarehouseId, setResolvedWarehouseId] = useState<string>('');

  // Get stock for the selected color (or from sizes if no color exists)
  const getSelectedColorStock = (): number => {
    if (!product?.images) return 0;

    // Check if any image has a non-empty color
    const hasColors = product.images.some(img => img.color && img.color.trim() !== '');

    // If no colors exist, get stock from the first image's sizes array
    if (!hasColors) {
      const image = product.images[0];
      if (!image) return 0;
      if (image.sizes && image.sizes.length > 0) {
        return image.sizes.reduce((total, size) => total + (size.stock || 0), 0);
      }
      return image.stock || 0;
    }

    if (!selectedColor) return 0;
    
    const normalizedColor = selectedColor.toUpperCase().trim();
    const colorImage = product.images.find(img => 
      img.color && img.color.toUpperCase().trim() === normalizedColor
    );
    
    if (!colorImage) return 0;
    
    // If sizes array exists, sum all sizes for this color
    if (colorImage.sizes && colorImage.sizes.length > 0) {
      return colorImage.sizes.reduce((total, size) => total + (size.stock || 0), 0);
    }
    
    // Otherwise return image-level stock
    return colorImage.stock || 0;
  };

  const stock = getSelectedColorStock();
  const lowStockThreshold = product?.low_stock_threshold || 5;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= lowStockThreshold;
  const maxQuantity = stock;

  // Parse sizes and colors - handle both string and array formats
  const sizes = product?.sizes 
    ? (typeof product.sizes === 'string' 
        ? product.sizes.split(',').map(s => s.trim()).filter(Boolean)
        : Array.isArray(product.sizes) 
          ? product.sizes 
          : [])
    : [];
    
  // Get colors in the order they appear in images
  const getColorsInImageOrder = () => {
    if (!product?.images || product.images.length === 0) return [];
    
    const colorOrder: string[] = [];
    const seenColors = new Set<string>();
    
    // First, add colors in the order they appear in images
    product.images.forEach(img => {
      if (img.color && !seenColors.has(img.color)) {
        colorOrder.push(img.color);
        seenColors.add(img.color);
      }
    });
    
    // Then add any remaining colors from product.colors that aren't in images
    if (product.colors) {
      const productColors = typeof product.colors === 'string'
        ? product.colors.split(',').map(c => c.trim()).filter(Boolean)
        : Array.isArray(product.colors)
          ? product.colors
          : [];
      
      productColors.forEach(color => {
        if (!seenColors.has(color)) {
          colorOrder.push(color);
          seenColors.add(color);
        }
      });
    }
    
    return colorOrder;
  };

  const colors = getColorsInImageOrder();
  
  // Build image gallery from product images - show all images
  const productImages = product?.images && product.images.length > 0
    ? product.images
    : product?.primary_image
    ? [{ image: product.primary_image }]
    : [];

  // If colors exist, default selectedColor to the first option when product loads
  useEffect(() => {
    if (!selectedColor && colors.length > 0) {
      setSelectedColor(colors[0]);
    }
  }, [colors, selectedColor]);

  // Resolve warehouse ID on component mount
  useEffect(() => {
    const resolveWarehouse = async () => {
      try {
        const id = await warehouseService.getActiveWarehouseId();
        setResolvedWarehouseId(id);
      } catch (err) {
        console.error('Failed to resolve warehouse:', err);
      }
    };
    resolveWarehouse();
  }, []);

  // Find image index by matching the color field from the image object
  const findImageIndexForColor = (color: string) => {
    if (!color || !product?.images || product.images.length === 0) return -1;
    
    const normalizedSelectedColor = color.toUpperCase().trim();
    
    // Find the index of the image that matches the selected color
    const index = product.images.findIndex(img => 
      img.color && img.color.toUpperCase().trim() === normalizedSelectedColor
    );
    
    return index;
  };

  // Update selectedImageIndex when color changes
  useEffect(() => {
    const idx = findImageIndexForColor(selectedColor);
    if (idx >= 0) {
      setSelectedImageIndex(idx);
    } else {
      setSelectedImageIndex(0);
    }
  }, [selectedColor, product?.images]);

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <p className="font-sans text-muted-foreground animate-pulse">Loading collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-20 flex justify-center">
        <ErrorState 
          title="Product Unavailable"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl mb-4">Product not found</h1>
        <p className="text-muted-foreground mb-8">The item you are looking for might have been removed.</p>
        <Link to="/shop" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full text-sm font-sans">
          Return to Shop
        </Link>
      </div>
    );
  }

  const productName = product.name_en;
  const productDescription = product.description_en;
  
  // Get price based on selected currency
  const getPriceForCurrency = (priceType: 'regular' | 'sale') => {
    const priceField = priceType === 'regular' 
      ? (currency === 'INR' ? 'price_inr' : 
         currency === 'GBP' ? 'price_gbp' : 
         currency === 'USD' ? 'price_usd' : 'price_inr')
      : (currency === 'INR' ? 'sale_price_inr' : 
         currency === 'GBP' ? 'sale_price_gbp' : 
         currency === 'USD' ? 'sale_price_usd' : 'sale_price_inr');
    
    return product[priceField] ? parseFloat(product[priceField]) : null;
  };
  
  const productPrice = getPriceForCurrency('regular') || 0;
  const salePrice = getPriceForCurrency('sale');

  // Get related products from the same category
  const relatedProducts = relatedProductsData
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const wishlisted = isWishlisted(product.id);

  // Get the image URL for the selected color
  const getImageForSelectedColor = (): string => {
    if (!selectedColor || !product?.images) {
      const firstImage = productImages[0];
      return typeof firstImage === 'string' ? firstImage : firstImage?.image || '';
    }
    
    const normalizedColor = selectedColor.toUpperCase().trim();
    const colorImage = product.images.find(img => 
      img.color && img.color.toUpperCase().trim() === normalizedColor
    );
    
    if (colorImage?.image) return colorImage.image;
    
    const firstImage = productImages[0];
    return typeof firstImage === 'string' ? firstImage : firstImage?.image || '';
  };

  // Get stock for a specific size in the selected color (or from image sizes if no color)
  const getSizeStockForColor = (size: string): number => {
    if (!product?.images) return 0;

    // Check if any image has a non-empty color
    const hasColors = product.images.some(img => img.color && img.color.trim() !== '');

    // If no colors exist, get size stock from the first image
    if (!hasColors) {
      const image = product.images[0];
      if (!image) return 0;
      if (image.sizes && image.sizes.length > 0) {
        const sizeObj = image.sizes.find(s => s.size === size);
        return sizeObj ? sizeObj.stock : 0;
      }
      return image.stock || 0;
    }

    if (!selectedColor) return 0;
    
    const normalizedColor = selectedColor.toUpperCase().trim();
    const colorImage = product.images.find(img => 
      img.color && img.color.toUpperCase().trim() === normalizedColor
    );
    
    if (!colorImage) return 0;
    
    // If sizes array exists, find the stock for this size
    if (colorImage.sizes && colorImage.sizes.length > 0) {
      const sizeObj = colorImage.sizes.find(s => s.size === size);
      return sizeObj ? sizeObj.stock : 0;
    }
    
    // Otherwise return image-level stock
    return colorImage.stock || 0;
  };

  // Get total stock for a specific color
  const getColorStock = (color: string): number => {
    if (!product?.images) return 0;
    
    const normalizedColor = color.toUpperCase().trim();
    const colorImage = product.images.find(img => 
      img.color && img.color.toUpperCase().trim() === normalizedColor
    );
    
    if (!colorImage) return 0;
    
    // If sizes array exists, sum all sizes
    if (colorImage.sizes && colorImage.sizes.length > 0) {
      return colorImage.sizes.reduce((total, size) => total + (size.stock || 0), 0);
    }
    
    // Otherwise return image-level stock
    return colorImage.stock || 0;
  };

  // Handle thumbnail click - update color based on selected image
  const handleImageSelect = (index: number) => {
    if (product?.images && product.images[index]) {
      const imageColor = product.images[index].color;
      if (imageColor && colors.includes(imageColor)) {
        setSelectedColor(imageColor);
        // Reset quantity when color changes
        setQuantity(1);
      }
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Reset quantity when color changes to ensure it doesn't exceed new color's stock
    setQuantity(1);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    // Reset quantity when size changes to ensure it doesn't exceed new size's stock
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    // Check if size is required and not selected
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    try {
      await addToCart({
        productId: product.id,
        color: selectedColor || colors[0] || '',
        size: selectedSize || sizes[0] || '',
        quantity,
        productImage: getImageForSelectedColor(),
        productName: productName,
        required_points: product.required_points,
      });
      toast.success(`${productName} added to cart`);
    } catch (error) {
      // Error is already handled in the store
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <main>
      {/* Breadcrumb */}
      <div className="container py-4">
        <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className={`w-3 h-3`} />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className={`w-3 h-3`} />
          <span className="text-foreground">{productName}</span>
        </div>
      </div>

      {/* Product */}
      <div className="container pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <ProductImageGallery 
            images={productImages} 
            productName={productName} 
            initialSelectedIndex={selectedImageIndex}
            onImageSelect={handleImageSelect}
          />

          {/* Details */}
          <div className="flex flex-col justify-center space-y-6">
            {product.is_new && (
              <span className="self-start bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-3 py-1 font-sans">
                New Arrival
              </span>
            )}

            {isOutOfStock && (
              <span className="self-start bg-destructive text-destructive-foreground text-[10px] tracking-widest uppercase px-3 py-1 font-sans font-bold">
                Out of Stock
              </span>
            )}

            {isLowStock && !isOutOfStock && (
              <span className="self-start bg-orange-500 text-white text-[10px] tracking-widest uppercase px-3 py-1 font-sans font-bold">
                Low Stock
              </span>
            )}

            <div>
              <h1 className="text-2xl md:text-3xl font-display mb-2">{productName}</h1>
              {productDescription && (
                <p className="text-muted-foreground font-sans text-sm leading-relaxed">{productDescription}</p>
              )}
              {product.required_points && (
                <p className="text-primary font-sans text-sm font-medium mt-2">
                  {product.required_points} Points Required
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                {salePrice ? (
                  <>
                    <span className="text-2xl font-display">
                      {formatPriceRaw(salePrice * quantity)}
                    </span>
                    <span className="text-muted-foreground line-through font-sans">
                      {formatPriceRaw(productPrice * quantity)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-display">
                    {formatPriceRaw(productPrice * quantity)}
                  </span>
                )}
              </div>
            </div>

            {/* Color */}
            {colors.length > 0 && (
              <div>
                <p className="text-xs font-sans tracking-widest uppercase text-muted-foreground mb-3">
                  Colour{selectedColor && ` — ${selectedColor}`}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => {
                    const colorStock = getColorStock(color);
                    const isColorOutOfStock = colorStock === 0;
                    
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        disabled={isColorOutOfStock}
                        className={`px-4 py-2 text-xs font-sans border rounded-sm transition-colors ${
                          selectedColor === color 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : isColorOutOfStock
                            ? 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            : 'border-border hover:bg-secondary'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-sans tracking-widest uppercase text-muted-foreground">Size</p>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs font-sans underline text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map(size => {
                    const sizeStock = getSizeStockForColor(size);
                    const isSizeOutOfStock = sizeStock === 0;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        disabled={isSizeOutOfStock}
                        className={`w-12 h-12 text-xs font-sans border rounded-sm transition-colors ${
                          selectedSize === size 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : isSizeOutOfStock
                            ? 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            : 'border-border hover:bg-secondary'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-xs font-sans tracking-widest uppercase text-muted-foreground mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border w-fit">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isOutOfStock}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-sans text-sm min-w-[40px] text-center">{quantity}</span>
                  <button 
                    onClick={() => {
                      // Use size-specific stock if size is selected, otherwise use total stock
                      const maxQty = selectedSize ? getSizeStockForColor(selectedSize) : stock;
                      setQuantity(Math.min(maxQty, quantity + 1));
                    }} 
                    className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isOutOfStock || quantity >= (selectedSize ? getSizeStockForColor(selectedSize) : stock)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs font-sans text-muted-foreground">
                  {stock > 0 ? ` in stock` : 'Out of stock'}
                </span>
              </div>
              {isLowStock && !isOutOfStock && (
                <p className="text-xs font-sans text-orange-600 mt-2">⚠️ Limited stock available</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || isOutOfStock}
                className="flex-1 bg-primary text-primary-foreground py-4 text-sm font-sans tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={() => {
                  toggleWishlist(product.id);
                }}
                className={`w-14 border flex items-center justify-center transition-colors ${wishlisted ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-secondary'}`}
                aria-label="Add to Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* <button
              onClick={async () => {
                if (isOutOfStock) {
                  toast.error('This item is out of stock');
                  return;
                }
                // Check if size is required and not selected
                if (sizes.length > 0 && !selectedSize) {
                  toast.error('Please select a size');
                  return;
                }

                setBuyingNow(true);
                try {
                  // Call buy-checkout API
                  const response = await cartService.buyCheckout({
                    product: product.id,
                    quantity,
                    warehouse: resolvedWarehouseId,
                    currency,
                    payment_method: 'cod',
                    color: selectedColor || colors[0] || '',
                    size: selectedSize || sizes[0] || '',
                  });

                  // Store the response and navigate to checkout
                  if (response) {
                    toast.success('Proceeding to checkout');
                    navigate('/checkout');
                  }
                } catch (error: any) {
                  console.error('Buy checkout error:', error);
                  const msg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to proceed to checkout';
                  toast.error(msg);
                } finally {
                  setBuyingNow(false);
                }
              }}
              disabled={isOutOfStock || buyingNow}
              className="w-full border border-primary py-4 text-sm font-sans tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors text-center block disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOutOfStock ? 'Out of Stock' : buyingNow ? 'Processing...' : 'Buy it Now'}
            </button>  */}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container pb-16 md:pb-24">
          <h2 className="text-2xl font-display mb-8">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <SizeGuideDialog open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </main>
  );
};

export default ProductDetail;
