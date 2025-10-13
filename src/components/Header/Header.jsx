// |===============================| Import React, Routing, Icons, and Framer Motion |===============================|
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import MonitorIcon from "@mui/icons-material/Monitor";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/common-images/logo.webp";

// |===============================| Header Component |===============================|
const Header = () => {
  // |===============================| State: Menu Open/Close |===============================|
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = ["Home", "Products", "Services", "About", "Contact"];

  // |===============================| Effect: Lock body scroll when mobile menu is open |===============================|
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // |===============================| Helper: Dynamic link classes |===============================|
  const getLinkClasses = (path) =>
    `font-bold select-none text-base ${
      location.pathname === path
        ? "text-white"
        : "text-white/85 hover:text-white"
    }`;

  const getMobileLinkClasses = (path) =>
    `font-semibold select-none text-base ${
      location.pathname === path
        ? "text-white"
        : "text-white/80 hover:text-white"
    }`;

  // |===============================| Animation Variants |===============================|
  const fadeIn = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };
  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const slideIn = {
    hidden: { x: "100%" },
    visible: { x: 0 },
    exit: { x: "100%" },
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="top-0 w-full z-50 bg-slate-900/20 border-b border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 relative">
          {/* |===============================| Logo Section |===============================| */}
          <motion.a
            href="/"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="flex items-center space-x-2"
          >
            <motion.div
              whileHover={{ boxShadow: "0 0 15px rgba(255,255,255,0.6)" }}
              className="p-2 rounded-4xl backdrop-blur-md bg-white/10 shadow-md transition"
            >
              <img src={logo} alt="logo" className="w-8 h-8 object-contain" />
            </motion.div>
          </motion.a>

          {/* |===============================| Centered Mobile Title |===============================| */}
          {!isMenuOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute left-1/2 -translate-x-1/2 text-white font-semibold tracking-wide text-[14px] sm:text-[18px]  md:hidden"
            >
              ZUBI ELECTRONICS
            </motion.span>
          )}

          {/* |===============================| Desktop Navigation |===============================| */}
          <motion.nav
            className="hidden md:flex flex-1 justify-center space-x-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {navItems.map((item) => {
              const path = item === "Home" ? "/" : `/${item.toLowerCase()}`;
              return (
                <motion.div key={item} variants={fadeIn}>
                  <Link to={path} className={getLinkClasses(path)}>
                    {item}
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>

          {/* |===============================| Desktop POS Link |===============================| */}
          <motion.div className="hidden md:flex">
            <Link
              to="/cp-signin"
              className="flex items-center space-x-2 px-5 py-2 rounded-lg font-semibold text-white text-base 
       backdrop-blur-md bg-white/10 shadow-md 
       hover:bg-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.6)] 
       transition cursor-pointer"
            >
              <MonitorIcon className="w-5 h-5" />
              <span className="select-none">POS</span>
            </Link>
          </motion.div>

          {/* |===============================| Mobile Menu Toggle Button |===============================| */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
            className="md:hidden relative z-50"
          >
            <div className="select-none p-2 rounded-4xl backdrop-blur-md bg-white/10 shadow-md flex items-center justify-center hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition">
              {isMenuOpen ? (
                <CloseIcon className="w-6 h-6 text-white" />
              ) : (
                <MenuIcon className="w-6 h-6 text-white" />
              )}
            </div>
          </motion.button>
        </div>

        {/* |===============================| Mobile Fullscreen Menu |===============================| */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed top-0 left-0 w-full h-full bg-white/10 backdrop-blur-xl z-40 flex flex-col p-8"
            >
              {/* |===============================| Mobile Nav Links |===============================| */}
              <div className="flex flex-col space-y-5 mt-10">
                {navItems.map((item) => {
                  const path = item === "Home" ? "/" : `/${item.toLowerCase()}`;
                  return (
                    <motion.div key={item} variants={fadeIn}>
                      <Link
                        to={path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`${getMobileLinkClasses(path)} 
                  block w-full px-6 py-3 rounded-lg 
                  backdrop-blur-md bg-white/10 shadow-md 
                  hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] 
                  transition text-center`}
                      >
                        {item}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* |===============================| Mobile POS Link |===============================| */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-auto"
              >
                <Link
                  to="/cp-signin"
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold 
            text-white text-base backdrop-blur-md bg-white/10 
            shadow-md hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] 
            transition cursor-pointer w-full"
                >
                  <MonitorIcon className="w-5 h-5" />
                  <span className="select-none">POS</span>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

// |===============================| Export Header |===============================|
export default Header;
