import { RotateCcw } from 'lucide-react';

const Returns = () => {
  return (
    <main className="min-h-screen pb-24 font-sans leading-relaxed">
      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container text-center">
          <RotateCcw className="w-12 h-12 mx-auto mb-6 text-accent opacity-80" />
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">Returns & Exchanges</h1>
          <p className="text-sm opacity-70 italic">Hassle-free returns within 7 days of delivery.</p>
        </div>
      </section>

      <section className="container py-16 max-w-4xl mx-auto text-muted-foreground text-sm space-y-8">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-display">Our Policy</h2>
          <p>We want you to be completely satisfied with your purchase. If for any reason you are not happy with your order, you can return or exchange the item within 7 days of receiving it, provided it is in its original condition with all tags intact.</p>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground font-display">How to Initiate a Return</h2>
          <p>To start a return or exchange, please contact our support team at support@iqra-mark.com with your order number and the reason for the return. We will provide you with a return authorization and instructions on how to ship the item back to us.</p>
        </div>
      </section>
    </main>
  );
};

export default Returns;
