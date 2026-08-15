import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/services/category.service';

const DesktopNav = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { categories, loading } = useCategories();

  // Split into parent categories and their children
  const parentCategories = categories.filter((c) => c.parent === null);
  const getChildren = (parentId: string): Category[] =>
    categories.filter((c) => c.parent === parentId);

  if (loading || parentCategories.length === 0) return null;

  return (
    <nav className="hidden md:block border-b border-border bg-background relative">
      <div className="container">
        <ul className="flex items-center gap-8">
          {parentCategories.map((parent, idx) => {
            const children = getChildren(parent.id);
            return (
              <li
                key={parent.id}
                className="relative"
                onMouseEnter={() => setOpenIndex(idx)}
                onMouseLeave={() => setOpenIndex(null)}
              >
                <button className="flex items-center gap-1.5 py-3 text-sm font-sans tracking-wide hover:text-accent-foreground transition-colors">
                  {parent.name_en}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
                </button>

                {openIndex === idx && (
                  <div className="absolute left-0 top-full bg-background border border-border shadow-xl min-w-[220px] z-50 py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    <Link
                      to={`/shop?category=${parent.slug}`}
                      className="block px-5 py-2.5 text-sm font-sans font-medium text-accent-foreground hover:bg-secondary transition-colors sticky top-0 bg-background border-b border-border"
                    >
                      View All {parent.name_en}
                    </Link>
                    {children.length > 0 && (
                      <>
                        <p className="px-5 py-2 text-xs text-muted-foreground tracking-widest uppercase font-medium">
                          Categories
                        </p>
                        {children.map((child) => (
                          <Link
                            key={child.id}
                            to={`/shop?category=${child.slug}`}
                            className="block px-5 py-2.5 text-sm font-sans text-foreground hover:bg-secondary transition-colors"
                          >
                            {child.name_en}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default DesktopNav;
