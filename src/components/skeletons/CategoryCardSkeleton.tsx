import '@aejkatappaja/phantom-ui';

export const CategoryCardSkeleton = () => {
  return (
    <phantom-ui loading={true} animation="shimmer">
      <div className="space-y-2">
        <div className="aspect-video w-full rounded-lg bg-gray-200" />
        <div className="h-5 w-2/3 mx-auto bg-gray-200 rounded" />
      </div>
    </phantom-ui>
  );
};
