import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductImage {
  image: string;
  stock?: number;
  color?: string;
  sizes?: Array<{ size: string; stock: number }>;
}

interface ProductImageGalleryProps {
  images: (string | ProductImage)[];
  productName: string;
  initialSelectedIndex?: number;
  onImageSelect?: (index: number) => void;
}

const ProductImageGallery = ({ images, productName, initialSelectedIndex = 0, onImageSelect }: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Helper to get image URL from string or object
  const getImageUrl = (img: string | ProductImage): string => {
    return typeof img === 'string' ? img : img.image;
  };

  // Helper to get stock from image object - sum from sizes array, fallback to image stock
  const getImageStock = (img: string | ProductImage): number => {
    if (typeof img === 'string') return 0;
    // If sizes array exists and has items, sum their stock
    if (img.sizes && img.sizes.length > 0) {
      return img.sizes.reduce((total, size) => total + (size.stock || 0), 0);
    }
    // Otherwise use image-level stock
    return img.stock || 0;
  };

  // Update selected index when initialSelectedIndex changes
  useEffect(() => {
    setSelectedIndex(initialSelectedIndex);
  }, [initialSelectedIndex]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }, []);

  const handlePrev = () => {
    const newIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
    onImageSelect?.(newIndex);
  };

  const handleNext = () => {
    const newIndex = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(newIndex);
    onImageSelect?.(newIndex);
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    onImageSelect?.(index);
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] custom-scrollbar">
        {images.map((img, i) => {
          const imageUrl = getImageUrl(img);
          const stock = getImageStock(img);
          const isOutOfStock = stock === 0;

          return (
            <button
              key={i}
              onClick={() => handleThumbnailClick(i)}
              className={`flex-shrink-0 w-16 h-20 lg:w-20 lg:h-24 rounded-sm overflow-hidden border-2 transition-all relative group ${
                selectedIndex === i
                  ? 'border-primary opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={imageUrl}
                alt={`${productName} view ${i + 1}`}
                className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-50' : ''}`}
                loading="lazy"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center p-1">
                  <span className="text-[7px] font-sans font-bold text-destructive-foreground bg-destructive px-1.5 py-1 rounded whitespace-nowrap">
                    Out of Stock
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Image with Zoom */}
      <div className="flex-1 relative group">
        <div
          ref={imageRef}
          className="aspect-[3/4] rounded-sm overflow-hidden bg-secondary cursor-crosshair relative"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={getImageUrl(images[selectedIndex])}
            alt={`${productName} - view ${selectedIndex + 1}`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-[2.5]' : 'scale-100'
            }`}
            style={
              isZoomed
                ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                : undefined
            }
            draggable={false}
          />

          {/* Zoom hint */}
          <div className={`absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-full p-2 transition-opacity ${isZoomed ? 'opacity-0' : 'opacity-70 group-hover:opacity-100'}`}>
            <ZoomIn className="w-4 h-4 text-foreground" />
          </div>
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  selectedIndex === i ? 'bg-primary w-4' : 'bg-background/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
