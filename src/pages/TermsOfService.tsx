import { BookOpen } from 'lucide-react';

const TermsOfService = () => {
  return (
    <main className="min-h-screen pb-24 font-sans">
      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-6 text-accent opacity-80" />
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-sm opacity-70 italic">Last updated: April 2026</p>
        </div>
      </section>

      <section className="container py-16 max-w-4xl mx-auto space-y-10 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-display">General Terms</h2>
          <p>By accessing and using this website, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-display">Use of Service</h2>
          <p>You may use our services only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground font-display">Intellectual Property</h2>
          <p>All content on this website, including text, graphics, logos, and images, is the property of Sebastian Stores and is protected by intellectual property laws. You may not use, reproduce, or distribute any content without our prior written permission.</p>
        </div>
      </section>
    </main>
  );
};

export default TermsOfService;
