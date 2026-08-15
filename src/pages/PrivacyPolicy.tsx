import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen pb-24 font-sans">
      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container text-center">
          <Shield className="w-12 h-12 mx-auto mb-6 text-accent opacity-80" />
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm opacity-70 italic">Last updated: April 2026</p>
        </div>
      </section>

      <section className="container py-16 max-w-4xl mx-auto space-y-10 text-muted-foreground leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This includes your name, email address, phone number, shipping address, and payment information.</p>
          <p>We also automatically collect certain information when you visit our website, such as your IP address, browser type, and device information to improve your browsing experience.</p>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">How We Use Your Information</h2>
          <p>We use the information we collect to process your orders, communicate with you about your account, send you marketing communications (if you've opted in), and improve our products and services.</p>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Data Security</h2>
          <p>We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure.</p>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
