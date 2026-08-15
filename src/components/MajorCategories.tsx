import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/services/category.service";
import majorJewellery from "@/assets/major-jewellery.jpg";
import majorClothing from "@/assets/major-clothing.jpg";
import majorCollections from "@/assets/major-collections.jpg";

interface MajorCategoriesProps {
    categories?: Category[];
}

const MajorCategories = ({
    categories: apiCategories = [],
}: MajorCategoriesProps) => {
    // Filter major categories from API
    const majorCategories = apiCategories.filter(
        (cat) => cat.is_major && cat.image,
    );

    const displayCategories = majorCategories.slice(0, 3).map((cat, index) => ({
        name: cat.name_en,
        description: cat.sub_heading || "",
        image: cat.image!,
        link: `/shop?category=${cat.slug}`,
        span: index === 0 ? "row-span-2" : "",
        aspect:
            index === 0
                ? "aspect-square md:aspect-auto md:h-full"
                : "aspect-[16/9]",
    }));

    if (displayCategories.length === 0) {
        return (
            <section className="py-10 md:py-20 bg-secondary">
                <div className="container">
                    <div className="text-center">
                        <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans text-muted-foreground mb-2">
                            Curated Collections
                        </p>
                        <h2 className="text-2xl md:text-4xl font-display mb-4">
                            Shop by Category
                        </h2>
                        <div className="py-12 border border-dashed border-muted-foreground/20 rounded-2xl">
                            <p className="text-sm md:text-base text-muted-foreground">
                                No major categories available at the moment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10 md:py-20 bg-secondary">
            <div className="container">
                <div className="text-center mb-6 md:mb-10">
                    <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans text-muted-foreground mb-2">
                        Curated Collections
                    </p>
                    <h2 className="text-2xl md:text-4xl font-display">
                        Shop by Category
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 md:grid-rows-2 md:h-[600px]">
                    {/* First category - large left column spanning 2 rows */}
                    <div className={`${displayCategories[0].span} group`}>
                        <Link
                            to={displayCategories[0].link}
                            className="block h-full"
                        >
                            <div className="relative rounded-xl md:rounded-2xl overflow-hidden h-full min-h-[250px]">
                                <img
                                    src={displayCategories[0].image}
                                    alt={displayCategories[0].name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="absolute bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                                    <p className="text-[10px] md:text-xs font-sans text-primary-foreground/60 tracking-wider uppercase mb-1">
                                        {displayCategories[0].description}
                                    </p>
                                    <h3 className="font-display text-2xl md:text-4xl text-primary-foreground mb-3 md:mb-4">
                                        {displayCategories[0].name}
                                    </h3>
                                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full text-xs font-sans font-bold tracking-wider hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                        Shop Collection
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Second category - top right */}
                    {displayCategories[1] && (
                        <div className="group">
                            <Link
                                to={displayCategories[1].link}
                                className="block h-full"
                            >
                                <div className="relative rounded-xl md:rounded-2xl overflow-hidden h-full min-h-[180px]">
                                    <img
                                        src={displayCategories[1].image}
                                        alt={displayCategories[1].name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="absolute bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                                        <p className="text-[10px] md:text-xs font-sans text-primary-foreground/60 tracking-wider uppercase mb-1">
                                            {displayCategories[1].description}
                                        </p>
                                        <h3 className="font-display text-xl md:text-2xl text-primary-foreground mb-2">
                                            {displayCategories[1].name}
                                        </h3>
                                        <span className="inline-flex items-center gap-2 text-xs font-sans text-primary-foreground/80 tracking-wider group-hover:text-primary-foreground transition-colors">
                                            Explore{" "}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Third category - bottom right */}
                    {displayCategories[2] && (
                        <div className="group">
                            <Link
                                to={displayCategories[2].link}
                                className="block h-full"
                            >
                                <div className="relative rounded-xl md:rounded-2xl overflow-hidden h-full min-h-[180px]">
                                    <img
                                        src={displayCategories[2].image}
                                        alt={displayCategories[2].name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="absolute bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                                        <p className="text-[10px] md:text-xs font-sans text-primary-foreground/60 tracking-wider uppercase mb-1">
                                            {displayCategories[2].description}
                                        </p>
                                        <h3 className="font-display text-xl md:text-2xl text-primary-foreground mb-2">
                                            {displayCategories[2].name}
                                        </h3>
                                        <span className="inline-flex items-center gap-2 text-xs font-sans text-primary-foreground/80 tracking-wider group-hover:text-primary-foreground transition-colors">
                                            Explore{" "}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default MajorCategories;
