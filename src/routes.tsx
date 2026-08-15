import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import OrderDetail from "./pages/OrderDetail";
import Tracking from "./pages/Tracking";
import NotFound from "./pages/NotFound";
import ErrorPage from "./pages/Error";
import FAQs from "./pages/FAQs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Careers from "./pages/Careers";
import ShippingInfo from "./pages/ShippingInfo";
import Returns from "./pages/Returns";
import SizeGuide from "./pages/SizeGuide";
import Categories from "./pages/Categories";
import WarehouseList from "./pages/WarehouseList";

import ErrorBoundary from "./components/ErrorBoundary";

export const router = createBrowserRouter(
    [
        {
            path: "/",
            element: (
                <ErrorBoundary>
                    <Layout />
                </ErrorBoundary>
            ),
            errorElement: <ErrorPage />,
            children: [
                {
                    index: true,
                    element: <Index />,
                },
                {
                    path: "shop",
                    element: <Shop />,
                },
                {
                    path: "product/:id",
                    element: <ProductDetail />,
                },
                {
                    path: "cart",
                    element: <Cart />,
                },
                {
                    path: "wishlist",
                    element: <Wishlist />,
                },
                {
                    path: "checkout",
                    element: <Checkout />,
                },
                {
                    path: "signin",
                    element: <SignIn />,
                },
                {
                    path: "signup",
                    element: <SignUp />,
                },
                {
                    path: "about",
                    element: <About />,
                },
                {
                    path: "contact",
                    element: <Contact />,
                },
                {
                    path: "account",
                    element: <Account />,
                },
                {
                    path: "order/:id",
                    element: <OrderDetail />,
                },
                {
                    path: "tracking",
                    element: <Tracking />,
                },
                {
                    path: "faqs",
                    element: <FAQs />,
                },
                {
                    path: "privacy-policy",
                    element: <PrivacyPolicy />,
                },
                {
                    path: "terms-of-service",
                    element: <TermsOfService />,
                },
                {
                    path: "careers",
                    element: <Careers />,
                },
                {
                    path: "shipping-info",
                    element: <ShippingInfo />,
                },
                {
                    path: "returns",
                    element: <Returns />,
                },
                {
                    path: "size-guide",
                    element: <SizeGuide />,
                },
                {
                    path: "categories",
                    element: <Categories />,
                },
                {
                    path: "warehouses",
                    element: <WarehouseList />,
                },
                {
                    path: "*",
                    element: <NotFound />,
                },
            ],
        },
    ],
    {
        future: {
            v7_relativeSplatPath: true,
        },
    },
);
