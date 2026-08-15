import { MapPin, Heart, Gem, Sparkles } from 'lucide-react';

const About = () => {
  const values = [
    { icon: Heart, title: 'Authenticity', desc: 'Every piece is designed with cultural respect, originality, and meaningful craftsmanship.' },
    { icon: Gem, title: 'Premium Quality', desc: 'We focus on elegant fabrics, refined detailing, and lasting comfort in every collection.' },
    { icon: Sparkles, title: 'Modern Elegance', desc: 'Blending traditional artistry with contemporary fashion for the modern woman.' },
    { icon: MapPin, title: 'Cultural Pride', desc: 'Celebrating heritage, identity, and timeless beauty through every design.' },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground py-24 md:py-36">
        <div className="container text-center max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 text-accent">Our Story</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-6">Designed with heritage. Crafted for today</h1>
          <p className="text-sm md:text-base leading-relaxed opacity-90">
           Founded with a passion for timeless ethnic fashion, Sebastian Stores brings together tradition, elegance, and modern style for women who value culture with confidence.</p>
        </div>
      </section>

      {/* Story */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">The Journey</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">Born from Tradition, Designed for Today</h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>Sebastian Stores was created with a vision to redefine ethnic fashion for the modern generation. </p>
              <p>We believe women should never have to choose between tradition and contemporary style.</p>
              <p>Our collections combine cultural beauty, refined craftsmanship, and modern elegance to create fashion that feels graceful, confident, and timeless.</p>
              <p>Every design reflects our commitment to quality, identity, and the evolving lifestyle of today’s women.</p>
            </div>
          </div>
          <div className="aspect-[4/5] bg-secondary rounded-sm overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-secondary">
              <div className="text-center">
                <Gem className="w-16 h-16 mx-auto text-accent mb-4" />
                <p className="font-display text-lg font-semibold">Established 2024</p>
                <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">Crafting Elegance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">What We Stand For</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((v) => (
              <div key={v.title} className="bg-background p-6 rounded-sm text-center">
                <v.icon className="w-8 h-8 mx-auto mb-4 text-accent" />
                <h3 className="font-display text-sm font-bold mb-2">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
