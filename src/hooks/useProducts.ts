import { useEffect, useState, useCallback } from 'react';
import productService, { Product, ProductFilters } from '@/services/product.service';

export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reset when filters change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  }, [JSON.stringify(filters)]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts({ ...filters, page });
        
        if (page === 1) {
          setProducts(response.results);
        } else {
          setProducts(prev => [...prev, ...response.results]);
        }
        
        setCount(response.count);
        setHasMore(response.next !== null);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters), page]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  return { products, loading, error, count, hasMore, loadingMore, loadMore };
};
