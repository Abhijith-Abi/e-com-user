import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { FaInstagram, FaFacebook, FaPinterest } from "react-icons/fa";

const Footer = () => {
    const { categories: apiCategories } = useCategories();
    return (
        <footer className="bg-[#020817] text-white overflow-hidden">
            <div className="container py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Brand */}
                    <div className="lg:col-span-2 space-y-4">
                        <img
                            src="/logo.png"
                            alt="Sebastian Stores"
                            className="h-12 w-auto"
                        />
                        <p className="text-sm opacity-70 leading-relaxed max-w-xs font-sans">
                            Empowering women through elegant modest fashion inspired by tradition, culture, and contemporary style. <br />
                        </p>
                        <p className="text-sm opacity-70 leading-relaxed max-w-xs font-sans">Every collection is thoughtfully crafted to celebrate confidence, grace, and timeless beauty.</p>

                        <div className="flex gap-3 pt-2">
                            {[
                                { name: "Instagram", icon: FaInstagram, href: "https://instagram.com" },
                                { name: "Facebook", icon: FaFacebook, href: "https://facebook.com" },
                                { name: "Pinterest", icon: FaPinterest, href: "https://pinterest.com" },
                            ].map(({ name, icon: Icon, href }) => (
                                <a
                                    key={name}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full border border-primary-foreground/30 flex items-center justify-center text-sm opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-display text-sm tracking-wider mb-4">
                            Shop
                        </h4>
                        <ul className="space-y-2 text-sm font-sans opacity-70">
                            {apiCategories.filter(c => c.parent === null).slice(0, 5).map((category) => (
                                <li key={category.id}>
                                    <Link
                                        to={`/shop?category=${category.slug}`}
                                        className="hover:opacity-100 transition-opacity capitalize"
                                    >
                                        {category.name_en}
                                    </Link>
                                </li>
                            ))}
                            {apiCategories.length === 0 && (
                                <li className="text-xs">No categories</li>
                            )}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-display text-sm tracking-wider mb-4">
                            Support
                        </h4>
                        <ul className="space-y-2 text-sm font-sans opacity-70">
                            <li>
                                <Link
                                    to="/contact"
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/faqs"
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/size-guide"
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    Size Guide
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/shipping-info"
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/returns"
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    Returns
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-display text-sm tracking-wider mb-4">
                            Company
                        </h4>
                        <ul className="space-y-2 text-sm font-sans opacity-70">
                            <li>
                                <Link
                                    to="/about"
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/careers"
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy-policy"
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms-of-service"
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-primary-foreground/10">
                <div className="container py-6 flex flex-col md:flex-row items-center justify-between text-xs font-sans opacity-50">
                    <p>© 2026 Sebastian Stores. All rights reserved.</p>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/terms-of-service">Terms of Service</Link>
                    </div>
                </div>
            </div>

            {/* Large brand text */}
            <div className="overflow-hidden pb-4">
                <p className="text-[8vw] md:text-[6vw] font-display font-bold tracking-tight opacity-10 whitespace-nowrap text-center">
                    SEBASTIAN STORES
                </p>
            </div>
        </footer>
    );
};

export default Footer;
