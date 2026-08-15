import '@aejkatappaja/phantom-ui';

export const BannerSkeleton = () => {
  return (
    <phantom-ui loading={true} animation="shimmer">
      <div className="w-full h-[400px] rounded-lg bg-gray-200" />
    </phantom-ui>
  );
};
