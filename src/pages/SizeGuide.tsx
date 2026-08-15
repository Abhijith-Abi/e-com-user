import { Ruler } from 'lucide-react';

const SIZE_CATEGORIES = {
  "Dress Size": ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"],
  "Kids Size": ["0-3M", "3-6M", "6-12M", "1Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y", "Free Size"],
  "Chapal Size": ["5", "6", "7", "8", "9", "10", "11", "12"],
  "Free Size": ["Free Size"],
  "Perfumes Size": ["10ml", "20ml", "30ml", "50ml", "100ml", "200ml"],
};

const SizeGuide = () => {
  return (
    <main className="min-h-screen pb-24 font-sans text-sm">
      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container text-center">
          <Ruler className="w-12 h-12 mx-auto mb-6 text-accent opacity-80" />
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">Size Guide</h1>
          <p className="text-sm opacity-70 italic">Find your perfect fit.</p>
        </div>
      </section>

      <section className="container py-16 max-w-4xl mx-auto space-y-12">
        {Object.entries(SIZE_CATEGORIES).map(([category, sizes]) => (
          <div key={category}>
            <h2 className="text-lg font-bold text-foreground font-display mb-4">{category}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="border border-border p-3 text-left">Available Sizes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                          <span
                            key={size}
                            className="px-3 py-1.5 border border-border rounded-sm text-muted-foreground text-xs"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default SizeGuide;
