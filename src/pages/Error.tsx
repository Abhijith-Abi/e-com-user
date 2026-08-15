import { useRouteError, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

const ErrorPage = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();
  console.error(error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c10] text-white px-4 relative overflow-hidden font-sans">
      <Helmet>
        <title>Something Went Wrong | Sebastian Stores</title>
      </Helmet>

      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      
      <div className="relative z-10 max-w-2xl w-full text-center">
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl relative group transition-transform duration-700 hover:scale-105">
            <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <AlertTriangle className="h-16 w-16 text-primary relative z-10" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
          System <span className="text-primary italic">Interruption</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
          {error?.statusText || error?.message || "An unexpected error occurred. Our engineers have been notified and are looking into it."}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
          <Button 
            size="lg"
            onClick={() => window.location.href = "/"}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-7 text-base shadow-lg shadow-primary/20 flex items-center gap-2 group"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Back to Home
          </Button>
          
          <Button 
            size="lg"
            variant="outline" 
            onClick={() => window.location.reload()}
            className="rounded-full border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white font-medium px-8 py-7 text-base flex items-center gap-2 group"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
            Try Refreshing
          </Button>
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="mt-12 flex items-center gap-2 mx-auto text-gray-500 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to previous page
        </button>
      </div>

      {/* Decorative footer text */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-medium">
          Sebastian Stores Premium E-Commerce &copy; 2024
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
