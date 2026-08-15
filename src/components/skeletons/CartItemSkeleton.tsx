import '@aejkatappaja/phantom-ui';

export const CartItemSkeleton = () => {
  return (
    <phantom-ui loading={true} animation="shimmer">
      <div className="flex gap-4 p-4 border rounded-lg">
        <div className="w-24 h-24 rounded bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-4 w-1/4 bg-gray-200 rounded" />
        </div>
      </div>
    </phantom-ui>
  );
};
