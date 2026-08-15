import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd] text-[#1a1a1a] px-4 relative overflow-hidden font-sans">
      <Helmet>
        <title>Page Not Found | Sebastian Stores</title>
      </Helmet>

      {/* Subtle Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.03)_0%,transparent_50%)]" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 max-w-lg w-full text-center">
        <div className="mb-8">
          <span className="text-[12rem] md:text-[16rem] font-display font-black leading-none opacity-[0.03] select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            404
          </span>
          <div className="relative z-10">
            <h1 className="text-6xl md:text-8xl font-display font-bold mb-4 tracking-tighter">
              Lost in <span className="text-primary">Style</span>
            </h1>
          </div>
        </div>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-light">
          The page you're looking for seems to have vanished from our collection. 
          Perhaps it was a limited edition.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 px-6 relative z-20">
          <Button 
            size="lg"
            asChild
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-7 text-base shadow-xl shadow-primary/10 flex items-center gap-2 group"
          >
            <Link to="/">
              <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              Back to Boutique
            </Link>
          </Button>
          
          <Button 
            size="lg"
            variant="outline" 
            asChild
            className="rounded-full border-black/5 bg-black/[0.02] backdrop-blur-md hover:bg-black/[0.05] text-black font-medium px-8 py-7 text-base flex items-center gap-2 group"
          >
            <Link to="/shop">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Search Collection
            </Link>
          </Button>
        </div>

        <Link 
          to={-1 as any}
          className="mt-12 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Link>
      </div>

      {/* Decorative footer text */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-semibold">
          Luxury Experience &bull; Quality Assured
        </p>
      </div>
    </div>
  );
};

export default NotFound;
