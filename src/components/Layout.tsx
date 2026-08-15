import { Outlet } from "react-router";
import { ScrollRestoration } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import OfferPopup from "./OfferPopup";

const Layout = () => {
  return (
    <>
      <ScrollRestoration />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <OfferPopup />
    </>
  );
};

export default Layout;
