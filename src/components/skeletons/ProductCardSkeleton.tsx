import '@aejkatappaja/phantom-ui';

export const ProductCardSkeleton = () => {
  return (
    <phantom-ui loading={true} animation="shimmer">
      <div className="space-y-3">
        <div className="aspect-square w-full rounded-lg bg-gray-200" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="h-6 w-1/3 bg-gray-200 rounded" />
      </div>
    </phantom-ui>
  );
};
