import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Truck,
    Sparkles,
    Shield,
    Star,
    Quote,
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useCartStore } from "@/store/useCartStore";
import { useCategories } from "@/hooks/useCategories";
import { useBanners } from "@/hooks/useBanners";
import { useNewProducts } from "@/hooks/useNewProducts";
import { useBestSellers } from "@/hooks/useBestSellers";
import { useFeaturedProducts } from "@/hooks/useFeaturedProducts";
import { useProducts } from "@/hooks/useProducts";
import { useTestimonials } from "@/hooks/useTestimonials";
import warehouseService from "@/services/warehouse.service";
import type { Product } from "@/services/product.service";
import ProductCard from "@/components/ProductCard";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import OfferSlider from "@/components/OfferSlider";
import MajorCategories from "@/components/MajorCategories";
import { HomePageSkeleton } from "@/components/skeletons";
import ErrorState from "@/components/ErrorState";
import ctaBanner from "@/assets/cat-banner.webp";

// New Collection Glassmorphism Slider Component
const NewCollectionSlider = ({
    products,
    formatPrice,
    mobile,
}: {
    products: Product[];
    formatPrice: (p: number) => string;
    mobile?: boolean;
}) => {
    const allProducts = products.slice(0, 8);
    const [idx, setIdx] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const current = allProducts[idx];
    const { addToCart } = useCartStore();

    useEffect(() => {
        if (allProducts.length === 0) return;
        const timer = setInterval(
            () => setIdx((i) => (i + 1) % allProducts.length),
            4000,
        );
        return () => clearInterval(timer);
    }, [allProducts.length]);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!current || isAdding) return;

        setIsAdding(true);
        try {
            await addToCart({
                productId: current.id,
                color: current.colors ? (typeof current.colors === 'string' ? current.colors.split(',')[0].trim() : current.colors[0]) : '',
                size: current.sizes ? (typeof current.sizes === 'string' ? current.sizes.split(',')[0].trim() : current.sizes[0]) : '',
                quantity: 1,
                productName: current.name_en,
                productNameAr: current.name_ar,
                productImage: current.primary_image || current.images?.[0]?.image,
                required_points: current.required_points,
            });
            
            // Show success toast
            import('sonner').then(({ toast }) => {
                toast.success(`${current.name_en} added to cart!`);
            });
        } catch (error) {
            console.error('Failed to add to cart:', error);
            import('sonner').then(({ toast }) => {
                toast.error('Failed to add item to cart. Please try again.');
            });
        } finally {
            setIsAdding(false);
        }
    };

    if (!current || allProducts.length === 0) return null;

    const productName = current.name_en;
    const productPrice = parseFloat(current.price_inr || "0");
    const salePriceStr = current.sale_price_inr;
    const salePrice = salePriceStr ? parseFloat(salePriceStr) : null;
    const originalPrice = salePrice ? productPrice : null;
    const displayPrice = salePrice || productPrice;
    const productImage =
        current.primary_image ||
        current.images?.find((img) => img.is_primary)?.image ||
        current.images?.[0]?.image ||
        "";

    return (
        <div
            className={`${mobile ? "w-full" : "w-[300px]"} rounded-2xl bg-background/20 backdrop-blur-xl border border-background/30 shadow-2xl overflow-hidden`}
        >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h3 className="text-sm font-display text-primary-foreground">
                    New Collection
                </h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() =>
                            setIdx(
                                (i) =>
                                    (i - 1 + allProducts.length) %
                                    allProducts.length,
                            )
                        }
                        className="w-7 h-7 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground/80 hover:bg-background/40 transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() =>
                            setIdx((i) => (i + 1) % allProducts.length)
                        }
                        className="w-7 h-7 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-background/50 transition-colors"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div className="px-4 pb-2">
                <Link to={`/product/${current.id}`} className="block">
                    <div
                        className={`${mobile ? "aspect-[16/9]" : "aspect-square"} rounded-xl overflow-hidden bg-background/10 mb-3`}
                    >
                        <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-display text-primary-foreground leading-tight line-clamp-2">
                            {productName}
                        </p>
                        <div className="flex flex-col items-end gap-0.5">
                            <p className="text-sm font-sans font-medium text-primary-foreground whitespace-nowrap">
                                {formatPrice(displayPrice)}
                            </p>
                            {originalPrice && (
                                <p className="text-xs font-sans text-primary-foreground/60 line-through whitespace-nowrap">
                                    {formatPrice(originalPrice)}
                                </p>
                            )}
                        </div>
                    </div>
                    <p className="text-[11px] font-sans text-primary-foreground/60">
                        {current.category}
                    </p>
                </Link>
            </div>
            <div className="px-4 pb-4 pt-1">
                <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-background/90 text-foreground text-sm font-sans tracking-wide hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingBag className="w-4 h-4" />
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

const Index = () => {
    const { formatPrice } = useSettingsStore();
    const [warehouseId, setWarehouseId] = useState<string>('');

    // Initialize warehouse ID from localStorage
    useEffect(() => {
        const initWarehouse = async () => {
            try {
                const id = await warehouseService.getActiveWarehouseId();
                setWarehouseId(id);
            } catch (error) {
                console.error('Failed to get warehouse ID:', error);
            }
        };
        initWarehouse();
    }, []);
    const {
        categories: apiCategories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useCategories({ status: "active" });
    const {
        products: newProducts,
        loading: productsLoading,
        error: productsError,
    } = useNewProducts({
        status: "active",
    });
    const {
        products: bestSellers,
        loading: bestSellersLoading,
        error: bestSellersError,
    } = useBestSellers({ 
        limit: 10,
        status: "active"
    });
    const {
        products: featuredProducts,
        loading: featuredLoading,
        error: featuredError,
    } = useFeaturedProducts({ status: "active" });
    const { products: jewelleryApiProducts, error: jewelleryError } =
        useProducts({
            status: "active",
            category_name: "jewellery",
        });
    const {
        testimonials,
        loading: testimonialsLoading,
        error: testimonialsError,
    } = useTestimonials();

    // Fetch hero banners from API with warehouse filter
    const {
        banners: heroBanners,
        loading: bannersLoading,
        error: bannersError,
    } = useBanners({
        status: "active",
        warehouse: warehouseId,
    });

    // Detect device type
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Filter banners based on device type
    const filteredBanners = useMemo(() => {
        return heroBanners.filter((banner: any) => {
            if (banner.device === "both") return true;
            if (banner.device === "mobile" && isMobile) return true;
            if (banner.device === "desktop" && !isMobile) return true;
            return false;
        });
    }, [heroBanners, isMobile]);

    // Use API banners if available
    const heroSlides = filteredBanners.map((banner) => ({
        subtitle: banner.sub_text_en,
        title: banner.headline_en,
        subpara: banner.sub_paragraph_en,
        desc: banner.cta_label_en,
        link: banner.link?.replace('https://iqramark.com/', 'https://iqra-mark-ecommerce-git-production-algobizs-projects.vercel.app/') || '/shop',
        image: banner.image,
    }));

    const jewelleryProducts = jewelleryApiProducts.slice(0, 5);

    const [currentSlide, setCurrentSlide] = useState(0);
    const currentHeroSlide = heroSlides[currentSlide] || {
        subtitle: "",
        title: "",
        subpara: "",
        desc: "",
    };
    const nextSlide = useCallback(() => {
        if (heroSlides.length === 0) return;
        setCurrentSlide((i) => (i + 1) % heroSlides.length);
    }, [heroSlides.length]);

    useEffect(() => {
        if (heroSlides.length === 0) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide, heroSlides.length]);

    // Show skeleton while initial data is loading
    if (categoriesLoading || productsLoading || bannersLoading) {
        return <HomePageSkeleton />;
    }

    // Handle critical errors
    if (bannersError || productsError || categoriesError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <ErrorState
                    title="Experience Interrupted"
                    message="We're having trouble loading the home page. Please try refreshing your browser."
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <main>
            {/* Hero Slider */}
            {heroSlides.length > 0 && (
                <section className="relative h-[70vh] md:h-[90vh] overflow-hidden bg-secondary">
                    {heroSlides.map((slide, idx) => {
                        const slideImage = (slide as any).image;

                        return (
                            <div
                                key={idx}
                                className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                            >
                                <img
                                    src={slideImage}
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                    {...({
                                        fetchpriority:
                                            idx === 0 ? "high" : "auto",
                                    } as any)}
                                    loading={idx === 0 ? "eager" : "lazy"}
                                    decoding="async"
                                />
                                <div
                                    className={`absolute inset-0 bg-black/40`}
                                />
                            </div>
                        );
                    })}
                    <div className="absolute inset-0 z-20 flex items-end md:items-center">
                        <div className="container pb-10 md:pb-0">
                            <div className="max-w-xl space-y-4 md:space-y-6">
                                <p
                                    className="text-white/80 text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans animate-fade-in"
                                    key={`sub-${currentSlide}`}
                                >
                                    {currentHeroSlide.subtitle}
                                </p>
                                <h1
                                    className="text-4xl md:text-6xl lg:text-7xl font-display text-white leading-[0.9] animate-fade-in"
                                    key={`title-${currentSlide}`}
                                >
                                    {currentHeroSlide.title}
                                </h1>
                                <p className="text-white"> {currentHeroSlide.subpara}</p>

                                <div className="flex items-center gap-4 animate-fade-in">
                                    <Link
                                        to={
                                            (currentHeroSlide as any).link ||
                                            "/shop"
                                        }
                                        className="inline-flex items-center gap-2 bg-white text-black px-8 md:px-10 py-3 md:py-4 rounded-full text-xs md:text-sm font-sans font-bold tracking-wider hover:bg-white/90 transition-all shadow-xl shadow-black/10"
                                    >
                                        {currentHeroSlide.desc}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* New Collection Glassmorphism Slider — Desktop only */}
                    {newProducts.length > 0 && (
                        <div
                            className={`absolute bottom-8 right-8 z-30 hidden md:block`}
                        >
                            <NewCollectionSlider
                                products={newProducts}
                                formatPrice={formatPrice}
                            />
                        </div>
                    )}
                </section>
            )}

            {/* Marquee */}
            <div className="bg-primary/5 border-y border-primary/10 py-4 overflow-hidden">
                <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
                    {[...Array(3)].map((_, i) => (
                        <span
                            key={i}
                            className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-sans mx-12 text-primary font-bold"
                        >
                            Elevate Your Style • Premium Quality • Sustainable
                            Fashion • Sebastian Stores Exclusive • New Arrivals Daily •
                        </span>
                    ))}
                </div>
            </div>

            {/* Shop by Category */}
            <section className="py-10 md:py-24 overflow-hidden">
                <div className="container">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-3">
                        <div>
                            <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans text-muted-foreground mb-2 md:mb-3">
                                Curated For You
                            </p>
                            <h2 className="text-2xl md:text-5xl font-display leading-tight">
                                Shop by Category
                            </h2>
                        </div>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-xs md:text-sm font-sans tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            View All
                            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {apiCategories.filter(
                        (cat) => cat.parent === null && cat.image,
                    ).length > 0 ? (
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            plugins={[
                                Autoplay({
                                    delay: 2500,
                                    stopOnInteraction: false,
                                }),
                            ]}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-2.5 md:-ml-4">
                                {apiCategories
                                    .filter(
                                        (cat) =>
                                            cat.parent === null && cat.image,
                                    )
                                    .map((cat) => {
                                        const name = cat.name_en;
                                        return (
                                            <CarouselItem
                                                key={cat.slug}
                                                className="pl-2.5 md:pl-4 basis-[38%] sm:basis-[35%] md:basis-[22%] lg:basis-[18%]"
                                            >
                                                <Link
                                                    to={`/shop?category=${cat.slug}`}
                                                    className="group block"
                                                >
                                                    <div className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden bg-secondary">
                                                        <img
                                                            src={cat.image}
                                                            alt={name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                                                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-center">
                                                            <h3 className="font-display text-sm md:text-lg text-primary-foreground">
                                                                {name}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </CarouselItem>
                                        );
                                    })}
                            </CarouselContent>
                        </Carousel>
                    ) : (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm md:text-base text-muted-foreground">
                                No categories available
                            </p>
                        </div>
                    )}

                    {/* Category tags - Show subcategories (categories with parent) */}
                    <div className="mt-6 md:mt-10 flex flex-wrap justify-center gap-1.5 md:gap-2">
                        {apiCategories.filter((cat) => cat.parent !== null)
                            .length === 0 ? (
                            <p className="text-xs md:text-sm text-muted-foreground">
                                No subcategories available
                            </p>
                        ) : (
                            apiCategories
                                .filter((cat) => cat.parent !== null)
                                .map((cat) => {
                                    const name = cat.name_en;

                                    return (
                                        <Link
                                            key={cat.slug}
                                            to={`/shop?category=${cat.slug}`}
                                            className="group/pill px-3 md:px-5 py-2 md:py-2.5 text-[10px] md:text-xs font-sans tracking-wide border border-border rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                                        >
                                            {name}
                                        </Link>
                                    );
                                })
                        )}
                    </div>
                </div>
            </section>

            {/* Offer Slider */}
            <OfferSlider />

            {/* Major Categories */}
            <MajorCategories categories={apiCategories} />

            {/* Best Selling */}
            <section className="container py-10 md:py-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-3">
                    <div>
                        <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans text-muted-foreground mb-2">
                            Trending Now
                        </p>
                        <h2 className="text-2xl md:text-4xl font-display mb-2 md:mb-3">
                            Explore Our Best Selling Collection
                        </h2>
                        <p className="text-muted-foreground font-sans text-xs md:text-sm max-w-md">
                            Discover our most popular pieces that everyone is
                            talking about.
                        </p>
                    </div>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full text-xs md:text-sm font-sans font-bold tracking-wider hover:opacity-90 transition-all shadow-lg shadow-primary/20 self-start"
                    >
                        View Best Sellers
                        <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </Link>
                </div>

                {bestSellers.length > 0 ? (
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        plugins={[
                            Autoplay({ delay: 3000, stopOnInteraction: false }),
                        ]}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-3 md:-ml-4">
                            {bestSellers.map((product) => (
                                <CarouselItem
                                    key={product.id}
                                    className="pl-3 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                                >
                                    <ProductCard product={product} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                ) : (
                    <div className="py-12 border border-dashed border-muted-foreground/20 rounded-2xl text-center">
                        <p className="text-sm md:text-base text-muted-foreground">
                            No best selling products available right now.
                        </p>
                    </div>
                )}
            </section>

            {/* Jewellery Showcase */}
            {/* <section className="bg-[#020817] text-primary-foreground py-10 md:py-24">
                <div className="container">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-3">
                        <div>
                            <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans opacity-60 mb-2">
                                Handcrafted Elegance
                            </p>
                            <h2 className="text-2xl md:text-4xl font-display mb-2 md:mb-3">
                                Jewellery Collection
                            </h2>
                            <p className="text-xs md:text-sm font-sans opacity-70 max-w-md">
                                From traditional gold sets to contemporary
                                silver designs — adorn yourself with timeless
                                pieces.
                            </p>
                        </div>
                        <Link
                            to="/shop?category=bangles"
                            className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-5 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-sans tracking-wider hover:opacity-90 transition-opacity self-start"
                        >
                            Explore Jewellery
                            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Link>
                    </div>

                    {jewelleryProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
                            {jewelleryProducts.map((product) => {
                                const name = product.name_en;
                                const image =
                                    product.primary_image ||
                                    product.images?.[0]?.image ||
                                    "";
                                const price = parseFloat(
                                    product.price_inr || "0",
                                );
                                const categoryLabel =
                                    product.category_name || product.category;

                                return (
                                    <div key={product.id} className="group">
                                        <Link to={`/product/${product.id}`}>
                                            <div className="aspect-square rounded-sm overflow-hidden bg-primary-foreground/10 mb-2 md:mb-3">
                                                <img
                                                    src={image}
                                                    alt={name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            </div>
                                            <h3 className="font-display text-xs md:text-sm leading-tight mb-0.5 md:mb-1">
                                                {name}
                                            </h3>
                                            <p className="text-[10px] md:text-xs font-sans opacity-60">
                                                {categoryLabel}
                                            </p>
                                            <p className="text-xs md:text-sm font-sans font-medium mt-0.5 md:mt-1">
                                                {formatPrice(price)}
                                            </p>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 border border-dashed border-primary-foreground/20 rounded-sm text-center">
                            <p className="text-sm md:text-base opacity-60">
                                No jewellery items available at the moment.
                            </p>
                        </div>
                    )}
                </div>
            </section> */}

            {/* Features Section */}
            <section className="bg-secondary py-10 md:py-20">
                <div className="container text-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-4xl font-display mb-2 md:mb-3">
                        We Deliver Exceptional Customer Experiences
                    </h2>
                    <p className="text-xs md:text-sm font-sans text-muted-foreground max-w-lg mx-auto">
                        We are committed to delivering exceptional customer
                        experiences that exceed expectations.
                    </p>
                </div>
                <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                    {[
                        {
                            icon: Truck,
                            title: "Quick & Friendly Support",
                            desc: "Our support team responds quickly and is friendly, ensuring your experience is efficient and pleasant.",
                        },
                        {
                            icon: Sparkles,
                            title: "New Collection Everyday",
                            desc: "Explore our new collection launched daily! Each piece is designed to add a fresh twist to your style.",
                        },
                        {
                            icon: Shield,
                            title: "Satisfaction Guaranteed",
                            desc: "We guarantee your satisfaction with our support team, quick to respond and friendly. Your experience is our priority.",
                        },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="text-center md:text-start">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4 mx-auto md:mx-0">
                                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <h3 className="font-display text-base md:text-lg mb-1.5 md:mb-2">
                                {title}
                            </h3>
                            <p className="text-xs md:text-sm font-sans text-muted-foreground leading-relaxed">
                                {desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-10 md:py-24">
                <div className="container">
                    <div className="text-center mb-8 md:mb-12">
                        <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase font-sans text-muted-foreground mb-2 md:mb-3">
                            What Our Customers Say
                        </p>
                        <h2 className="text-2xl md:text-4xl font-display mb-2 md:mb-3">
                            Loved by Thousands
                        </h2>
                        <div className="w-12 md:w-16 h-[2px] bg-primary mx-auto mt-3 md:mt-4" />
                    </div>

                    {testimonialsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm md:text-base text-muted-foreground">
                                Loading...
                            </p>
                        </div>
                    ) : testimonials.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm md:text-base text-muted-foreground">
                                No testimonials available
                            </p>
                        </div>
                    ) : (
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            plugins={[
                                Autoplay({ delay: 4000, stopOnInteraction: false }),
                            ]}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-3 md:-ml-4">
                                {testimonials.map((t_item, idx) => {
                                    const name = t_item.name_en;
                                    const content = t_item.content_en;
                                    const city = t_item.city_en;
                                    const review = t_item.review_en;

                                    return (
                                        <CarouselItem
                                            key={idx}
                                            className="pl-3 md:pl-4 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/4"
                                        >
                                            <div className="bg-secondary/50 border border-border rounded-sm p-4 md:p-6 relative h-full">
                                                <Quote className="w-6 h-6 md:w-8 md:h-8 text-primary/20 absolute top-3 end-3 md:top-4 md:end-4" />
                                                <div className="flex gap-0.5 mb-3 md:mb-4">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className="w-3.5 h-3.5 md:w-4 md:h-4 fill-primary text-primary"
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs md:text-sm font-sans text-muted-foreground leading-relaxed mb-4 md:mb-5">
                                                    {review}
                                                </p>
                                                <p className="text-xs md:text-sm font-sans text-muted-foreground leading-relaxed mb-4 md:mb-5 h-32 overflow-auto">
                                                    "{content}"
                                                </p>
                                                <div className="border-t border-border pt-3 md:pt-4">
                                                    <p className="font-display text-xs md:text-sm">
                                                        {name}
                                                    </p>
                                                    <p className="text-[10px] md:text-xs font-sans text-muted-foreground">
                                                        {city}
                                                    </p>
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    );
                                })}
                            </CarouselContent>
                        </Carousel>
                    )}
                </div>
            </section>

            {/* Special Collections - Featured Products */}
            <section className="container py-10 md:py-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-3">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-display mb-2 md:mb-3">
                            Special Collections
                        </h2>
                        <p className="text-muted-foreground font-sans text-xs md:text-sm max-w-md">
                            Curated collections for every occasion — from kids'
                            celebrations to bridal elegance.
                        </p>
                    </div>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-sans tracking-wider hover:opacity-90 transition-opacity self-start"
                    >
                        View All
                        <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </Link>
                </div>

                {featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-12 border border-dashed border-muted-foreground/20 rounded-2xl text-center">
                        <p className="text-sm md:text-base text-muted-foreground">
                            No special collections available at the moment.
                        </p>
                    </div>
                )}
            </section>

            {/* New Arrivals */}
            <section className="container py-10 md:py-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-3">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-display mb-2 md:mb-3">
                            New Arrivals
                        </h2>
                        <p className="text-muted-foreground font-sans text-xs md:text-sm max-w-md">
                            Just landed — the freshest additions to our
                            collection.
                        </p>
                    </div>
                </div>

                {newProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                        {newProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                ) : (
                    <div className="py-12 border border-dashed border-muted-foreground/20 rounded-2xl text-center">
                        <p className="text-sm md:text-base text-muted-foreground">
                            No new arrivals available right now.
                        </p>
                    </div>
                )}
            </section>

            {/* CTA Banner */}
            <section className="container pb-10 md:pb-24">
                <div className="relative rounded-sm overflow-hidden h-[40vh] md:h-[60vh]">
                    <img
                        src={ctaBanner}
                        alt="Fashion Collection"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-foreground/40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                        <h2 className="text-2xl md:text-5xl font-display text-primary-foreground mb-3 md:mb-4 max-w-lg">
                            Elevate Your Modest Style with Grace
                        </h2>
                        <p className="text-primary-foreground/70 font-sans text-xs md:text-sm mb-6 md:mb-8 max-w-md">
                            Discover premium abayas, hijabs, and Islamic
                            essentials crafted for elegance and comfort.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 bg-background text-foreground px-6 md:px-8 py-3 md:py-3.5 text-xs md:text-sm font-sans tracking-wider hover:bg-secondary transition-colors"
                        >
                            Shop Collection
                            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Index;
