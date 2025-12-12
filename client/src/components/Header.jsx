import { AnimatePresence, motion } from "framer-motion";
import { Mail, Menu, Phone, Ticket, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isConnected } = useSocket();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
    { path: "/admin", label: "Admin" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "glass-dark py-3"
          : "py-5 bg-gradient-to-b from-dark/80 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-heading font-bold text-white">
              Event<span className="text-gradient">Flow</span>
            </span>
          </Link>

          {/* Contact Info - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <a
              href="tel:+1234567890"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-primary" />
              (888) 123 4567
            </a>
            <a
              href="mailto:info@eventflow.com"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4 text-primary" />
              info@eventflow.com
            </a>
            {isConnected && (
              <div className="flex items-center gap-1 text-accent">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-xs">Live</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <Link
            to="/events"
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white text-dark rounded-full font-semibold hover:bg-gray-100 transition-all group"
          >
            <span>Buy Ticket</span>
            <motion.div
              whileHover={{ x: 5 }}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
            >
              <Ticket className="w-4 h-4 text-white" />
            </motion.div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2.5 rounded-xl transition-all ${
              isMobileMenuOpen
                ? "bg-primary/20 text-primary"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-6 pt-4 border-t border-white/10 bg-dark-light/95 backdrop-blur-xl rounded-b-2xl -mx-4 px-4"
            >
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`font-medium py-3 px-4 rounded-xl transition-all ${
                      location.pathname === link.path
                        ? "text-primary bg-primary/10"
                        : "text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/events"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-full font-semibold mt-4"
                >
                  <span>Buy Ticket</span>
                  <Ticket className="w-4 h-4" />
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
