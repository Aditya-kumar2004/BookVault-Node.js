import { Link, NavLink } from "react-router-dom";
import { Search, ShoppingCart, Heart, Menu, X, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore, useWishlistStore, useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Browse" },
  { to: "/categories", label: "Categories" },
  { to: "/deals", label: "Deals" },
  { to: "/authors", label: "Authors" },
];

export function Navbar() {
  const cartCount = useCartStore((s) => s.count());
  const wishCount = useWishlistStore((s) => s.ids.length);
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled
        ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
        : "bg-white border-b border-gray-100"
    )}>
      {/* Top promo bar */}
      <div className="bg-primary text-primary-foreground text-xs text-center py-2 font-medium tracking-wide">
        🎉 Free shipping on orders over ₹500 · Use code <span className="font-bold text-accent">BVAULT20</span> for 20% off your first order
      </div>

      <div className="container flex h-16 items-center gap-4 lg:gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-primary hidden sm:block tracking-tight">
            Book<span className="text-accent">Vault</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 mx-auto">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 relative",
                  isActive
                    ? "text-accent bg-accent/8"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-xs relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search books, authors..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto lg:ml-0">
          {/* Mobile search */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <Search className="h-5 w-5 text-gray-600" />
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 rounded-xl hover:bg-gray-100 transition group">
            <Heart className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors" />
            {wishCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition group">
            <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-accent transition-colors" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>
              <Button variant="coral" size="sm" className="ml-2 hidden sm:inline-flex rounded-xl font-semibold">
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-xl font-semibold text-gray-600">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="coral" size="sm" className="rounded-xl font-semibold shadow-sm hover:shadow-md transition-shadow">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-100 overflow-hidden"
          >
            <div className="container py-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  placeholder="Search books, authors..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-gray-100 overflow-hidden bg-white"
          >
            <div className="container py-4 flex flex-col gap-1">
              {navItems.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-semibold text-gray-700 transition"
                >
                  {n.label}
                </Link>
              ))}
              {user ? (
                <div className="pt-3 border-t border-gray-100 mt-2 space-y-3">
                  <div className="px-4 py-2 bg-gray-50 rounded-xl flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <div className="text-xs truncate">
                      <div className="font-semibold text-gray-800 truncate">{user.name}</div>
                      <div className="text-gray-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button variant="coral" className="w-full rounded-xl font-semibold">
                        {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="rounded-xl font-semibold border-gray-200 text-gray-600"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-3 border-t border-gray-100 mt-2">
                  <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">Login</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="coral" className="w-full rounded-xl">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
