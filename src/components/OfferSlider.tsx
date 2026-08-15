import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import offerService, { type Offer } from "@/services/offer.service";

const OfferSlider = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                const response = await offerService.getOffers();
                setOffers(
                    response.results.filter(
                        (offer) =>
                            offer.status === "active" && !offer.is_deleted,
                    ),
                );
            } catch (error) {
                console.error("Failed to fetch offers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    if (loading) {
        return null; // Or a skeleton
    }

    if (offers.length === 0) {
        return (
            <section className="pt-4 md:pt-8 pb-10 md:pb-20">
                <div className="container">
                    <div className="py-12 border border-dashed border-muted-foreground/20 rounded-2xl text-center">
                        <p className="text-sm md:text-base text-muted-foreground">
                            No special offers available right now. Stay tuned!
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="pt-4 md:pt-8 pb-10 md:pb-20">
            <div className="container">
                <Carousel
                    opts={{ align: "start", loop: true }}
                    plugins={[
                        Autoplay({ delay: 3500, stopOnInteraction: false }),
                    ]}
                    className="w-full relative"
                >
                    <CarouselContent className="-ml-3 md:-ml-4">
                        {offers.map((offer) => {
                            const heading = offer.heading_en;
                            const subHeading = offer.sub_heading_en;
                            const ctaButton = offer.cta_button_en;

                            return (
                                <CarouselItem
                                    key={offer.id}
                                    className="pl-3 md:pl-4 basis-[85%] md:basis-1/2"
                                >
                                    <Link to="/shop" className="group block">
                                        <div className="relative aspect-[16/7] md:aspect-[16/8] rounded-xl md:rounded-2xl overflow-hidden">
                                            <img
                                                src={offer.image}
                                                alt={heading}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="absolute bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                                                <p className="text-[10px] md:text-xs font-sans text-primary-foreground/70 tracking-wider uppercase mb-1">
                                                    {subHeading}
                                                </p>
                                                <h3 className="font-display text-lg md:text-2xl text-primary-foreground mb-2 md:mb-3">
                                                    {heading}
                                                </h3>
                                                <span className="inline-block px-5 md:px-6 py-2 md:py-2.5 bg-primary text-primary-foreground rounded-full text-[10px] md:text-xs font-sans font-bold tracking-wider hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                                    {ctaButton}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <div className="hidden md:block">
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
};

export default OfferSlider;
