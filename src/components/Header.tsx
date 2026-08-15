import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClickOutside } from "@/hooks/useClickOutside";
import {
    Menu,
    X,
    ShoppingBag,
    Heart,
    Search,
    ChevronDown,
    ChevronRight,
    ArrowRight,
    User,
    LogOut,
    Coins,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useCoupons } from "@/hooks/useCoupons";
import { Category } from "@/services/category.service";
import { Product } from "@/services/product.service";
import SearchOverlay from "./SearchOverlay";

// Fetches and renders product cards for the mega menu
const MegaMenuProducts = ({
    categoryId,
    onClose,
}: {
    categoryId: string;
    onClose: () => void;
}) => {
    const { products } = useProducts({
        category: categoryId,
        status: "active",
    });
    const preview = products.slice(0, 4);
    if (preview.length === 0) return null;
    return (
        <div className="flex-1 grid grid-cols-4 gap-4">
            {preview.map((p: Product) => {
                const img =
                    p.primary_image ||
                    p.images?.find((i) => i.is_primary)?.image ||
                    p.images?.[0]?.image;
                return (
                    <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className="group"
                        onClick={onClose}
                    >
                        <div className="aspect-[3/4] rounded-sm overflow-hidden bg-secondary mb-2">
                            {img ? (
                                <img
                                    src={img}
                                    alt={p.name_en}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-secondary" />
                            )}
                        </div>
                        <p className="text-xs font-display truncate">
                            {p.name_en}
                        </p>
                        <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">
                            Shop Now
                        </p>
                    </Link>
                );
            })}
        </div>
    );
};

const Header = () => {
    const { user, logout } = useAuthStore();
    const { cart_count } = useCartStore();
    const { wishlistItems } = useWishlistStore();
    const { currencySymbol } = useSettingsStore();

    const { categories: apiCategories } = useCategories();
    const { coupons } = useCoupons();
    const parentCategories = apiCategories.filter(
        (c: Category) =>
            c.parent === null && c.status === "active" && c.is_major === true,
    );
    const getChildren = (parentId: string): Category[] =>
        apiCategories.filter(
            (c: Category) => c.parent === parentId && c.status === "active",
        );

    const [menuOpen, setMenuOpen] = useState(false);
    const [shopOpen, setShopOpen] = useState(false);
    const [currentCouponIndex, setCurrentCouponIndex] = useState(0);

    const [navOpenIndex, setNavOpenIndex] = useState<number | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const navigate = useNavigate();
    const isMac =
        typeof window !== "undefined" &&
        (navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
            navigator.userAgent.includes("Mac"));

    // Auto-play carousel effect
    useEffect(() => {
        if (coupons.length === 0) return;

        const interval = setInterval(() => {
            setCurrentCouponIndex((prev) => (prev + 1) % coupons.length);
        }, 4000); // Change coupon every 4 seconds

        return () => clearInterval(interval);
    }, [coupons.length]);

    return (
        <>
            {/* Top bar - Coupon Carousel */}
            {coupons.length > 0 && (
                <div className="bg-primary text-primary-foreground text-xs tracking-widest py-2 text-center font-sans uppercase overflow-hidden">
                    <div className="relative h-6 flex items-center justify-center">
                        {coupons.map((coupon, idx) => (
                            <div
                                key={coupon.id}
                                className={`absolute transition-all duration-500 ease-in-out ${
                                    idx === currentCouponIndex
                                        ? "opacity-100 translate-y-0"
                                        : idx < currentCouponIndex
                                          ? "opacity-0 -translate-y-full"
                                          : "opacity-0 translate-y-full"
                                }`}
                            >
                                <span className="font-semibold">
                                    USE CODE{" "}
                                    <span className="text-black">
                                        {coupon.coupon_code}
                                    </span>{" "}
                                    GET
                                </span>
                                {coupon.coupon_value && (
                                    <span className="ms-2 font-semibold">
                                        <span className="text-black">
                                            {coupon.coupon_value}
                                        </span>{" "}
                                        OFFER
                                    </span>
                                )}
                                {coupon.discount_percentage && (
                                    <span className="ms-2">
                                        {coupon.discount_percentage}% OFF
                                    </span>
                                )}
                                {coupon.discount_amount && (
                                    <span className="ms-2">
                                        {coupon.discount_amount} OFF
                                    </span>
                                )}
                                {coupon.description_en && (
                                    <span className="ms-2 font-normal">
                                        | {coupon.description_en}
                                    </span>
                                )}
                            </div>
                        ))}
                        {/* Carousel indicators */}
                        {/* <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
                            {coupons.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentCouponIndex(idx)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                        idx === currentCouponIndex
                                            ? "bg-primary-foreground w-3"
                                            : "bg-primary-foreground/50"
                                    }`}
                                    aria-label={`Go to coupon ${idx + 1}`}
                                />
                            ))}
                        </div> */}
                    </div>
                </div>
            )}
            <header
                className="sticky top-4 z-50 mx-4 md:mx-10 mb-6 md:mb-8 rounded-full glass border-white/20 shadow-lg"
                onMouseLeave={() => setNavOpenIndex(null)}
            >
                <div className="px-6 md:px-10 flex items-center justify-between h-14 md:h-16">
                    {/* Left - Menu + Search + Desktop Nav */}
                    <div className="flex items-center gap-4 flex-1 max-w-[calc(48%-100px)] overflow-hidden">
                        <button
                            onClick={() => setMenuOpen(true)}
                            className="p-1"
                            aria-label="Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-1 relative group"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                            <span className="hidden md:flex absolute -bottom-10 left-1/2 -translate-x-1/2 items-center gap-1 bg-background border border-border px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-wider">
                                    Search
                                </span>
                                <span className="text-[10px] font-sans bg-secondary px-1 rounded text-muted-foreground border border-border/50">
                                    {isMac ? "⌘ K" : "Ctrl K"}
                                </span>
                            </span>
                        </button>
                        {/* Inline Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6 ms-2 overflow-x-auto no-scrollbar flex-1">
                            {parentCategories
                                .slice(0, 3)
                                .map((parent: Category, idx: number) => (
                                    <div
                                        key={parent.id}
                                        onMouseEnter={() =>
                                            setNavOpenIndex(idx)
                                        }
                                        className="flex-shrink-0"
                                    >
                                        <button className="flex items-center gap-1 text-sm font-sans tracking-wide hover:text-accent-foreground transition-colors h-full py-2 whitespace-nowrap">
                                            {parent.name_en}
                                            <ChevronDown
                                                className={`w-3.5 h-3.5 transition-transform ${navOpenIndex === idx ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    </div>
                                ))}
                        </nav>
                    </div>

                    {/* Center - Logo */}
                    <Link
                        to="/"
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0"
                    >
                        <img
                            src="/logo.png"
                            alt="Sebastian Stores"
                            className="h-6 md:h-10 w-auto"
                        />
                    </Link>

                    {/* Right - Currency, Wishlist, Cart */}
                    <div className="flex items-center gap-3 md:gap-5 flex-1 justify-end max-w-[calc(50%-75px)]">
                        {/* User / Sign In */}
                        <div
                            ref={useClickOutside(() => setProfileOpen(false))}
                            className="relative hidden md:block"
                        >
                            {user ? (
                                <>
                                    <button
                                        onClick={() =>
                                            setProfileOpen(!profileOpen)
                                        }
                                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-sans font-semibold uppercase"
                                    >
                                        {user.full_name?.charAt(0) ||
                                            user.email?.charAt(0) ||
                                            "U"}
                                    </button>
                                    {profileOpen && (
                                        <div className="absolute right-0 top-full mt-3 bg-background rounded-2xl shadow-2xl min-w-[200px] z-[110] overflow-hidden border border-border">
                                            <div className="px-4 py-3 border-b border-border">
                                                <p className="text-sm font-sans font-medium truncate">
                                                    {user.full_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <Link
                                                to="/account"
                                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-sans tracking-wide hover:bg-secondary transition-colors"
                                                onClick={() =>
                                                    setProfileOpen(false)
                                                }
                                            >
                                                <User className="w-3.5 h-3.5" />{" "}
                                                My Account
                                            </Link>
                                            <Link
                                                to="/account"
                                                state={{ activeTab: "redeem" }}
                                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-sans tracking-wide hover:bg-secondary transition-colors"
                                                onClick={() =>
                                                    setProfileOpen(false)
                                                }
                                            >
                                                <Coins className="w-3.5 h-3.5 text-black" />{" "}
                                                Loyalty Points
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setProfileOpen(false);
                                                }}
                                                className="flex items-center gap-2 w-full text-start px-4 py-2.5 text-xs font-sans tracking-wide hover:bg-secondary transition-colors text-destructive"
                                            >
                                                <LogOut className="w-3.5 h-3.5" />{" "}
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to="/signin"
                                    className="p-1"
                                    aria-label="Sign In"
                                >
                                    <User className="w-5 h-5" />
                                </Link>
                            )}
                        </div>

                        <Link
                            to="/wishlist"
                            className="p-1 hidden md:block relative"
                            aria-label="Wishlist"
                        >
                            <Heart className="w-5 h-5" />
                            {wishlistItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                    {wishlistItems.length}
                                </span>
                            )}
                        </Link>
                        {user && (
                            <Link
                                to="/account"
                                state={{ activeTab: "redeem" }}
                                className="p-1 relative text-foreground hover:text-primary transition-colors animate-fade-in"
                                aria-label="Loyalty Points"
                            >
                                <Coins className="w-5 h-5" />
                            </Link>
                        )}
                        <Link
                            to="/cart"
                            className="p-1 relative"
                            aria-label="Cart"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cart_count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                    {cart_count}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Mega menu */}
                {/* Mega menu */}
                {navOpenIndex !== null && parentCategories[navOpenIndex] && (
                    <div className="absolute left-0 right-0 top-full pt-2 z-[100]">
                        <div className="mx-4 md:mx-0 bg-background rounded-3xl shadow-2xl border border-border overflow-hidden animate-fade-in">
                            <div className="container py-8 flex gap-10">
                                <div className="min-w-[180px]">
                                    <h4 className="font-display text-sm mb-4 text-muted-foreground">
                                        Categories
                                    </h4>
                                    <div className="space-y-1">
                                        {getChildren(
                                            parentCategories[navOpenIndex].id,
                                        ).map((child: Category) => (
                                            <Link
                                                key={child.id}
                                                to={`/shop?category=${child.slug}`}
                                                className="block py-1.5 text-sm font-sans text-foreground hover:text-accent-foreground transition-colors"
                                                onClick={() =>
                                                    setNavOpenIndex(null)
                                                }
                                            >
                                                {child.name_en}
                                            </Link>
                                        ))}
                                        <Link
                                            to={`/shop?category=${parentCategories[navOpenIndex].slug}`}
                                            className="inline-flex items-center gap-1.5 pt-3 text-sm font-sans font-medium text-foreground hover:text-accent-foreground transition-colors"
                                            onClick={() =>
                                                setNavOpenIndex(null)
                                            }
                                        >
                                            View All
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                                <MegaMenuProducts
                                    categoryId={
                                        parentCategories[navOpenIndex].id
                                    }
                                    onClose={() => setNavOpenIndex(null)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Mobile Menu Drawer */}
            {menuOpen && (
                <div className="fixed inset-0 z-[60]">
                    <div
                        className="absolute inset-0 bg-foreground/30"
                        onClick={() => setMenuOpen(false)}
                    />
                    <div
                        className="absolute left-4 top-4 bottom-4 w-[85%] max-w-sm bg-background rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar border border-border animate-fade-in"
                        style={{
                            animation: "slideInLeft 0.3s ease-out",
                        }}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <img
                                src="/logo.png"
                                alt="Sebastian Stores"
                                className="h-8"
                            />
                            <button onClick={() => setMenuOpen(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="p-5 space-y-1 font-sans text-sm tracking-wide">
                            <Link
                                to="/"
                                className="block py-3 border-b border-border"
                                onClick={() => setMenuOpen(false)}
                            >
                                Home
                            </Link>

                            <div>
                                <button
                                    className="flex items-center justify-between w-full py-3 border-b border-border"
                                    onClick={() => setShopOpen(!shopOpen)}
                                >
                                    Shop
                                    <ChevronRight
                                        className={`w-4 h-4 transition-transform ${shopOpen ? "rotate-90" : ""}`}
                                    />
                                </button>
                                {shopOpen && (
                                    <div className="ps-4 py-2 space-y-0.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                        {parentCategories.map(
                                            (parent: Category) => (
                                                <div key={parent.id}>
                                                    <p className="text-xs text-muted-foreground tracking-widest uppercase pt-4 pb-1">
                                                        {parent.name_en}
                                                    </p>
                                                    <Link
                                                        to={`/shop?category=${parent.slug}`}
                                                        className="block py-2 text-sm font-medium text-accent-foreground"
                                                        onClick={() =>
                                                            setMenuOpen(false)
                                                        }
                                                    >
                                                        View All
                                                    </Link>
                                                    {getChildren(parent.id).map(
                                                        (child: Category) => (
                                                            <Link
                                                                key={child.id}
                                                                to={`/shop?category=${child.slug}`}
                                                                className="block py-2 text-sm"
                                                                onClick={() =>
                                                                    setMenuOpen(
                                                                        false,
                                                                    )
                                                                }
                                                            >
                                                                {child.name_en}
                                                            </Link>
                                                        ),
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            <Link
                                to="/about"
                                className="block py-3 border-b border-border"
                                onClick={() => setMenuOpen(false)}
                            >
                                About
                            </Link>
                            <Link
                                to="/contact"
                                className="block py-3 border-b border-border"
                                onClick={() => setMenuOpen(false)}
                            >
                                Contact
                            </Link>
                            <Link
                                to="/account"
                                className="block py-3 border-b border-border"
                                onClick={() => setMenuOpen(false)}
                            >
                                My Account
                            </Link>
                            {user && (
                                <Link
                                    to="/account"
                                    state={{ activeTab: "redeem" }}
                                    className="block py-3 border-b border-border"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <div className="flex items-center gap-2">
                                        {/* <Coins className="w-4 h-4 text-amber-500" /> */}
                                        <span>Loyalty Points</span>
                                    </div>
                                </Link>
                            )}
                            <Link
                                to="/tracking"
                                className="block py-3 border-b border-border"
                                onClick={() => setMenuOpen(false)}
                            >
                                Shipment Tracking
                            </Link>
                        </nav>
                    </div>
                </div>
            )}

            <SearchOverlay
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                onToggle={() => setSearchOpen((prev) => !prev)}
            />
        </>
    );
};

export default Header;
