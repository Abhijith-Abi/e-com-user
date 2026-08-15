import { X } from 'lucide-react';

interface SizeGuideDialogProps {
  open: boolean;
  onClose: () => void;
}

const dressSizeChart = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '35"' },
  { size: 'S', bust: '34"', waist: '28"', hip: '37"' },
  { size: 'M', bust: '36"', waist: '30"', hip: '39"' },
  { size: 'L', bust: '38"', waist: '32"', hip: '41"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '43"' },
  { size: 'XXL', bust: '42"', waist: '36"', hip: '45"' },
  { size: 'XXXL', bust: '44"', waist: '38"', hip: '47"' },
  { size: 'Free Size', bust: '32"-40"', waist: '26"-34"', hip: '35"-43"' },
];

const kidsSizeChart = [
  { size: '0-3M', chest: '16"', waist: '16"', height: '55-62cm' },
  { size: '3-6M', chest: '17"', waist: '17"', height: '62-68cm' },
  { size: '6-12M', chest: '18"', waist: '18"', height: '68-76cm' },
  { size: '1Y', chest: '19"', waist: '19"', height: '76-86cm' },
  { size: '2Y', chest: '20"', waist: '19.5"', height: '86-92cm' },
  { size: '3Y', chest: '21"', waist: '20"', height: '92-98cm' },
  { size: '4Y', chest: '22"', waist: '20.5"', height: '98-104cm' },
  { size: '5Y', chest: '23"', waist: '21"', height: '104-110cm' },
  { size: '6Y', chest: '24"', waist: '21.5"', height: '110-116cm' },
  { size: '7Y', chest: '25"', waist: '22"', height: '116-122cm' },
  { size: '8Y', chest: '26"', waist: '22.5"', height: '122-128cm' },
  { size: '9Y', chest: '27"', waist: '23"', height: '128-134cm' },
  { size: '10Y', chest: '28"', waist: '23.5"', height: '134-140cm' },
  { size: 'Free Size', chest: '-', waist: '-', height: '-' },
];

const chapalSizeChart = [
  { size: '5', length: '8.5"' },
  { size: '6', length: '9"' },
  { size: '7', length: '9.5"' },
  { size: '8', length: '10"' },
  { size: '9', length: '10.5"' },
  { size: '10', length: '11"' },
  { size: '11', length: '11.5"' },
  { size: '12', length: '12"' },
];

const perfumesSizeChart = [
  { size: '10ml' },
  { size: '20ml' },
  { size: '30ml' },
  { size: '50ml' },
  { size: '100ml' },
  { size: '200ml' },
];

const SizeGuideDialog = ({ open, onClose }: SizeGuideDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border border-border shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto custom-scrollbar rounded-sm animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
          <h3 className="font-display text-lg">Size Guide</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-6">
          {/* Dress Size */}
          <div>
            <h4 className="font-display text-sm mb-3">Dress Size</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-3 py-2.5 text-start font-medium">Size</th>
                    <th className="px-3 py-2.5 text-start font-medium">Bust</th>
                    <th className="px-3 py-2.5 text-start font-medium">Waist</th>
                    <th className="px-3 py-2.5 text-start font-medium">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {dressSizeChart.map((row) => (
                    <tr key={row.size} className="border-b border-border">
                      <td className="px-3 py-2.5 font-medium">{row.size}</td>
                      <td className="px-3 py-2.5">{row.bust}</td>
                      <td className="px-3 py-2.5">{row.waist}</td>
                      <td className="px-3 py-2.5">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kids Size */}
          <div>
            <h4 className="font-display text-sm mb-3">Kids Size</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-3 py-2.5 text-start font-medium">Size</th>
                    <th className="px-3 py-2.5 text-start font-medium">Chest</th>
                    <th className="px-3 py-2.5 text-start font-medium">Waist</th>
                    <th className="px-3 py-2.5 text-start font-medium">Height</th>
                  </tr>
                </thead>
                <tbody>
                  {kidsSizeChart.map((row) => (
                    <tr key={row.size} className="border-b border-border">
                      <td className="px-3 py-2.5 font-medium">{row.size}</td>
                      <td className="px-3 py-2.5">{row.chest}</td>
                      <td className="px-3 py-2.5">{row.waist}</td>
                      <td className="px-3 py-2.5">{row.height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chapal Size */}
          <div>
            <h4 className="font-display text-sm mb-3">Chapal Size</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-3 py-2.5 text-start font-medium">Size</th>
                    <th className="px-3 py-2.5 text-start font-medium">Foot Length</th>
                  </tr>
                </thead>
                <tbody>
                  {chapalSizeChart.map((row) => (
                    <tr key={row.size} className="border-b border-border">
                      <td className="px-3 py-2.5 font-medium">{row.size}</td>
                      <td className="px-3 py-2.5">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Perfumes Size */}
          <div>
            <h4 className="font-display text-sm mb-3">Perfumes Size</h4>
            <div className="flex flex-wrap gap-2">
              {perfumesSizeChart.map((row) => (
                <span
                  key={row.size}
                  className="px-3 py-1.5 border border-border rounded-sm text-xs font-sans text-muted-foreground"
                >
                  {row.size}
                </span>
              ))}
            </div>
          </div>

          {/* Free Size */}
          <div>
            <h4 className="font-display text-sm mb-3">Free Size</h4>
            <p className="text-xs font-sans text-muted-foreground">One size fits most.</p>
          </div>

          <div className="bg-secondary p-4 rounded-sm">
            <p className="text-xs font-sans text-muted-foreground leading-relaxed">
              Please note: These are general body measurements and not garment measurements. If you are between sizes, we recommend choosing the larger size for a more comfortable fit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideDialog;
