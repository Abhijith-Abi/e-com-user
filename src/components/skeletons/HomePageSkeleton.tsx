import '@aejkatappaja/phantom-ui';
import { BannerSkeleton } from './BannerSkeleton';
import { CategoryCardSkeleton } from './CategoryCardSkeleton';
import { ProductCardSkeleton } from './ProductCardSkeleton';

export const HomePageSkeleton = () => {
  return (
    <div className="space-y-12">
      <BannerSkeleton />
      
      <div className="container mx-auto px-4">
        <div className="h-8 w-48 mb-6 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="h-8 w-48 mb-6 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
