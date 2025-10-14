import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// |===============================| Components |===============================|
import Loader from "../components/Loader/Loader";
import Header from "../components/Header/Header";
import LandingPage from "../pages/LandingPage/LandingPage";
import Products from "../components/LandingPage/Products";
import Services from "../components/LandingPage/Services";
import WhyChooseUs from "../components/LandingPage/WhyChooseUs";
import Contact from "../components/LandingPage/Contact";
import Footer from "../components/Footer/Footer";
import NotFound from "../pages/404-not-found/NotFound";
import WhatsAppCTA from "../components/WhatsApp/WhatsAppCTA";
import ScrollTop from "../components/Scroll/ScrollTop";


// |===============================| Products Page Routes |===============================|
import Mobiles from "../pages/ProductsDetails/MobilesLaptops";
import HomeAppliances from "../pages/ProductsDetails/HomeAppliances";
import PowerBatteries from "../pages/ProductsDetails/PowerBatteries";
import CoolingItems from "../pages/ProductsDetails/CoolingItems";
import BikesEscoters from "../pages/ProductsDetails/BikesEscoters";
import OtherAccessories from "../pages/ProductsDetails/OthersAccessories";

// |===============================| Policies Page Routes |===============================|
import FAQ from "../pages/Policies/FAQ";
import InstallmentPlans from "../pages/Policies/InstallmentPlans";
import ReturnPolicy from "../pages/Policies/ReturnPolicy";
import PrivacyPolicy from "../pages/Policies/Privacy";
import CustomerServices from "../pages/Policies/CustomerServices";

// |===============================| POS Routes |===============================|
// POS SIGNIN ROUTES
import APSignIn from "../POS/AP/auth/SignIn";
import UPSignIn from "../POS/UP/auth/SignIn";
import CPSignIn from "../POS/CP/auth/SignIn";

// AP Routes
import APLayout from "../POS/AP/layout/Layout";

// UP Routes
import UPLayout from "../POS/UP/layout/Layout";

// CP Routes

// |===============================| Layout Component |===============================|
const Layout = ({ children }) => {
  const location = useLocation();
  const showHeaderFooter = [
    "/",
    "/products",
    "/services",
    "/about",
    "/contact",
  ].includes(location.pathname);

  return (
    <>
      {showHeaderFooter && <Header />}
      {children}
      {showHeaderFooter && <Footer />}
    </>
  );
};

// |===============================| WhatsApp Wrapper Component |===============================|
const WhatsAppWrapper = () => {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") {
      setShowWhatsApp(false);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowWhatsApp(true);
      } else {
        setShowWhatsApp(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {showWhatsApp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <WhatsAppCTA />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// |===============================| App Routes Component |===============================|
const AppRoutes = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <BrowserRouter>
      <Layout>
        <ScrollTop/>
        <Routes>
          {/* |===============================| Global Routes |===============================| */}
          <Route path="*" element={<NotFound />} />
          {/* |===============================| Landing Page Routes |===============================| */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<WhyChooseUs />} />
          <Route path="/contact" element={<Contact />} />
          {/* |===============================| Products Routes |===============================| */}
          <Route
            path="/pages/products/mobiles-&-laptops"
            element={<Mobiles />}
          />
          <Route
            path="/pages/products/home-appliances"
            element={<HomeAppliances />}
          />
          <Route
            path="/pages/products/power-&-batteries"
            element={<PowerBatteries />}
          />
          <Route
            path="/pages/products/cooling-&-air"
            element={<CoolingItems />}
          />
          <Route
            path="/pages/products/bikes-&-e-scooters"
            element={<BikesEscoters />}
          />
          <Route
            path="/pages/products/others-&-accessories"
            element={<OtherAccessories />}
          />
          {/* |===============================| Policies Routes |===============================| */}
          <Route path="/pages/policies/faq" element={<FAQ />} />
          <Route
            path="/pages/policies/installment-plans"
            element={<InstallmentPlans />}
          />
          <Route
            path="/pages/policies/return-policy"
            element={<ReturnPolicy />}
          />
          <Route
            path="/pages/policies/privacy-policy"
            element={<PrivacyPolicy />}
          />
          <Route
            path="/pages/policies/customer-services"
            element={<CustomerServices />}
          />
          {/* |===============================| POS Routes |===============================| */}

          {/* POS SignIn */}
          <Route path="/ap-signin" element={<APSignIn />} />
          <Route path="/up-signin" element={<UPSignIn />} />
          <Route path="/cp-signin" element={<CPSignIn />} />

          {/* AP Dashboard Layout */}
          <Route path="/ap-dashboard" element={<APLayout />} />

          {/* UP Dashboard Layout */}
          <Route path="/up-dashboard" element={<UPLayout />} />

          {/* CP Dashboard Layout */}
        </Routes>
        <WhatsAppWrapper />
      </Layout>
    </BrowserRouter>
  );
};

export default AppRoutes;
