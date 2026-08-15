
import { Briefcase } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

const Careers = () => {
  return (
    <main className="min-h-screen pb-24 font-sans text-center">
      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container">
          <Briefcase className="w-12 h-12 mx-auto mb-6 text-accent opacity-80" />
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-sm md:text-base opacity-70 max-w-xl mx-auto italic">
            Build the future of Islamic commerce with us
          </p>
        </div>
      </section>

      <section className="container py-16 max-w-4xl mx-auto">
        <div className="bg-secondary/30 p-10 rounded-sm">
          <h2 className="font-display text-2xl mb-4 italic">No Open Positions</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            We're not currently hiring, but feel free to send your resume to <span className="text-foreground border-b border-muted-foreground">careers@iqra-mark.com</span> for future opportunities.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Careers;
