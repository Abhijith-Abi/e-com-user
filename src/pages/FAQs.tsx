import { HelpCircle, ChevronRight } from 'lucide-react';

const FAQs = () => {
  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email. You can use this number on our Tracking page to see the real-time status of your delivery.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return and exchange policy for items in their original condition with tags intact. Please visit our Returns & Exchanges page for more details.'
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship worldwide! Shipping costs and delivery times vary depending on your location. You can see the shipping options available at checkout.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash on Delivery, UPI, and all major Credit/Debit cards for domestic orders. For international orders, we accept major cards and PayPal.'
    },
    {
      question: 'How can I contact customer support?',
      answer: 'You can reach us at support@iqra-mark.com or call us at +91 98765 43210. Our support team is available Monday through Saturday, from 10 AM to 7 PM IST.'
    }
  ];

  return (
    <main className="min-h-screen pb-24">
      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-6 text-accent opacity-80" />
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-sm md:text-base opacity-70 max-w-xl mx-auto italic font-sans">
            Find answers to common questions about our products, orders, and services.
          </p>
        </div>
      </section>

      <section className="container py-16 max-w-3xl mx-auto font-sans">
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border pb-6 last:border-0">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <ChevronRight className={`w-4 h-4 text-accent`} />
                {faq.question}
              </h3>
              <p className={`text-muted-foreground leading-relaxed text-sm pl-6`}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default FAQs;
