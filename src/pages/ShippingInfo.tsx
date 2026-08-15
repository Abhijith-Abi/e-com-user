import { Truck } from 'lucide-react';

const ShippingInfo = () => {
  return (
    <main className="min-h-screen pb-24">
      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container text-center">
          <Truck className="w-12 h-12 mx-auto mb-6 text-accent opacity-80" />
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">Shipping Information</h1>
          <p className="text-sm opacity-70 italic font-sans">Reliable delivery to your doorstep, worldwide.</p>
        </div>
      </section>

      <section className="container py-16 max-w-4xl mx-auto font-sans leading-relaxed text-muted-foreground text-sm space-y-8">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Delivery Timeline</h2>
          <p>We aim to process and ship all orders within 2-3 business days. Domestic delivery within India typically takes 5-7 business days, while international shipping can take 10-15 business days depending on the destination.</p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Shipping Costs</h2>
          <p>We offer free shipping on all orders above ₹5,000 within India. For orders below this amount and for international shipping, delivery charges are calculated based on the weight of the package and the delivery location, which you can see at checkout.</p>
        </div>
      </section>
    </main>
  );
};

export default ShippingInfo;
