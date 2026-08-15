import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./routes";
import { useGeoCurrency } from "@/hooks/useGeoCurrency";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import warehouseService from "@/services/warehouse.service";

const queryClient = new QueryClient();

const AppInner = () => {
    useGeoCurrency();
    const { loadWishlist } = useWishlistStore();
    const { loadCartList } = useCartStore();
    const { isAuthenticated, customerId, setCustomerId } = useAuthStore();

    // Initialize warehouse on app load
    useEffect(() => {
        const initializeWarehouse = async () => {
            try {
                // Force refresh to clear any old cached warehouse IDs
                await warehouseService.getActiveWarehouseId(true);
            } catch (error) {
                console.error('Failed to initialize warehouse:', error);
            }
        };
        initializeWarehouse();
    }, []);

    // Load wishlist and cart when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadWishlist();
            loadCartList();
        }
    }, [isAuthenticated, loadWishlist, loadCartList]);

    return (
        <>
            <Toaster />
            <Sonner position="top-center" />
            <RouterProvider router={router} />
        </>
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <HelmetProvider>
            <TooltipProvider>
                <AppInner />
            </TooltipProvider>
        </HelmetProvider>
    </QueryClientProvider>
);

export default App;
