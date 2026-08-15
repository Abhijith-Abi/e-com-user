import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import categoryService, { Category } from '@/services/category.service';
import { useSettingsStore } from '@/store/useSettingsStore';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all categories without status filter
      const response = await categoryService.getCategories();
      
      setRawResponse(response);
      setCategories(response.results);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16 text-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

    return (
        <div className="container py-10 md:py-20">
            <div className="flex items-center justify-between mb-8 md:mb-12">
                <h1 className="font-display text-3xl md:text-5xl">All Categories</h1>
                <button
                    onClick={fetchCategories}
                    disabled={loading}
                    className="px-6 py-2 border border-border rounded-full text-sm font-sans hover:bg-secondary transition-colors disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            
            {categories.length === 0 && !loading ? (
                <div className="text-center py-24 border border-dashed border-border rounded-3xl">
                    <p className="text-muted-foreground font-display text-xl mb-2">No categories found</p>
                    <p className="text-sm text-muted-foreground font-sans">
                        Our collections are being updated. Please check back later.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/shop?category=${category.slug}`}
                            className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-secondary border border-border hover:shadow-2xl transition-all duration-500"
                        >
                            {category.image ? (
                                <img 
                                    src={category.image} 
                                    alt={category.name_en}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                                    <span className="text-primary font-display text-4xl opacity-20 uppercase tracking-tighter">
                                        {category.name_en.charAt(0)}
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h2 className="font-display text-2xl text-white mb-1">
                                    {category.name_en}
                                </h2>
                                {category.sub_heading && (
                                    <p className="text-xs text-white/70 font-sans tracking-wide uppercase">
                                        {category.sub_heading}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Categories;
