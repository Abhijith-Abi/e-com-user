import '@aejkatappaja/phantom-ui';
import { ProductCardSkeleton } from './ProductCardSkeleton';

export const ShopPageSkeleton = () => {
  return (
    <phantom-ui loading={true} animation="shimmer">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden md:block w-64 space-y-4">
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="h-40 w-full bg-gray-200 rounded" />
            <div className="h-40 w-full bg-gray-200 rounded" />
          </aside>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="h-10 w-32 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </phantom-ui>
  );
};
