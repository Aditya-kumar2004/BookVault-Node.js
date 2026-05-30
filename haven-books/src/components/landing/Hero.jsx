import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShoppingCart, Search, BookOpen } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useCartStore, useWishlistStore, useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";
import { coverFromIsbn } from "@/data/books";

/* ── ISBN covers ───────────────────────────────────────── */
const HERO_BOOKS = [
  { isbn: "9780525559474", title: "The Midnight Library", rot: -10, delay: 0, x: "0%", y: "5%", z: 30 },
  { isbn: "9780385737951", title: "The Maze Runner", rot: 6, delay: 0.15, x: "28%", y: "-2%", z: 20 },
  { isbn: "9781250301697", title: "The Silent Patient", rot: -4, delay: 0.30, x: "10%", y: "40%", z: 40 },
  { isbn: "9780374533557", title: "Thinking Fast and Slow", rot: 8, delay: 0.45, x: "52%", y: "10%", z: 10 },
  { isbn: "9780062315007", title: "The Alchemist", rot: -6, delay: 0.60, x: "60%", y: "48%", z: 35 },
  { isbn: "9780525478812", title: "The Fault in Our Stars", rot: 4, delay: 0.75, x: "38%", y: "32%", z: 50 },
];

const coverUrl = (isbn) => coverFromIsbn(isbn);

/* ── Particle (bokeh dust) ─────────────────────────────── */
function Particle({ style }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: style.size,
        height: style.size,
        left: style.left,
        top: style.top,
        background: style.color,
        filter: "blur(1px)",
        willChange: "transform, opacity",
      }}
      animate={{ y: [0, -style.travel, 0], opacity: [0, style.maxOpacity, 0] }}
      transition={{ duration: style.duration, repeat: Infinity, delay: style.delay, ease: "easeInOut" }}
    />
  );
}

// Reduced to 8 particles (was 28) — GPU-friendly count
const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  size: Math.random() * 3 + 2,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  travel: Math.random() * 60 + 30,
  duration: Math.random() * 5 + 6,
  delay: Math.random() * 6,
  maxOpacity: Math.random() * 0.3 + 0.08,
  color: i % 3 === 0
    ? "rgba(244,98,58,0.5)"
    : i % 3 === 1
      ? "rgba(255,220,180,0.4)"
      : "rgba(144,238,144,0.25)",
}));

/* ── Stat glassmorphism card ───────────────────────────── */
function StatCard({ icon, value, label, delay }) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: "rgba(10, 24, 16, 0.72)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <div
          className="font-bold text-white leading-tight"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem" }}
        >
          {value}
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-white/45 mt-0.5">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   CINEMATIC HERO
══════════════════════════════════════════════════════════ */
export function Hero() {
  const glowControls = useAnimation();

  /* Warm glow pulse */
  useEffect(() => {
    glowControls.start({
      opacity: [0.55, 0.90, 0.55],
      scale: [1, 1.06, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    });
  }, [glowControls]);

  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{
        background: "linear-gradient(160deg, #0f2d1f 0%, #1B4332 40%, #173d2c 70%, #0d2318 100%)",
        height: "100vh",
        minHeight: "650px", // prevent crushing on extremely tiny screens
        marginTop: "-68px",
        paddingTop: "68px",
      }}
    >
      {/* ── Bokeh particle layer ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p, i) => (
          <Particle key={i} style={p} />
        ))}
      </div>

      {/* ── Radial dot texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Ambient glow orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={glowControls}
          className="absolute"
          style={{
            right: "5%", top: "10%",
            width: "50vw", height: "50vw", maxWidth: 700, maxHeight: 700,
            background: "radial-gradient(ellipse, rgba(244,98,58,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute"
          style={{
            left: "-10%", bottom: "-10%",
            width: "40vw", height: "40vw", maxWidth: 500, maxHeight: 500,
            background: "radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute"
          style={{
            right: "20%", bottom: "20%",
            width: "30vw", height: "30vw", maxWidth: 400, maxHeight: 400,
            background: "radial-gradient(ellipse, rgba(244,98,58,0.18) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* ── Main content grid ── */}
      <div className="container relative z-10 mx-auto px-3 sm:px-6 grid lg:grid-cols-[55%_45%] gap-6 lg:gap-10 h-full max-h-[850px] items-center">

        {/* ════════════ LEFT CONTENT ════════════ */}
        <div className="flex flex-col gap-5 lg:gap-7 z-10">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full text-xs font-semibold text-white/85"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            500+ new titles added this week
            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <div className="space-y-1">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-black text-white leading-none uppercase tracking-tight"
              style={{ fontSize: "clamp(1.5rem, 6vw, 3.4rem)" }}
            >
              THE NEXT CHAPTER
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-black text-white leading-none uppercase tracking-tight"
              style={{ fontSize: "clamp(1.8rem, 8vw, 4.8rem)" }}
            >
              IN YOUR
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-black italic leading-none uppercase tracking-tight"
              style={{
                fontSize: "clamp(2.2rem, 10vw, 6rem)",
                background: "linear-gradient(90deg, #F4623A 0%, #ff8c5a 50%, #F4623A 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 3s linear infinite",
              }}
            >
              JOURNEY
            </motion.div>
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="text-base lg:text-lg leading-relaxed max-w-lg"
            style={{ color: "rgba(255,255,255,0.62)" }}
          >
            Discover thousands of books across every genre. Curated by passionate readers,
            for passionate readers. Your next favorite story is one click away.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-3"
          >
            <Link to="/books">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(244,98,58,0.55)" }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(244,98,58,0.3)",
                    "0 0 28px rgba(244,98,58,0.55)",
                    "0 0 15px rgba(244,98,58,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2 h-13 px-8 rounded-full font-bold text-base text-white transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #F4623A 0%, #e8501f 100%)",
                  height: 52,
                  fontSize: "0.95rem",
                }}
              >
                Explore Now <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link to="/categories">
              <motion.button
                whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 h-13 px-8 rounded-full font-bold text-base text-white transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                  height: 52,
                  fontSize: "0.95rem",
                }}
              >
                Browse Categories
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats glassmorphism cards */}
          <div className="flex flex-wrap gap-3 pt-2">
            <StatCard icon="📚" value="2M+" label="Books Available" delay={1.3} />
            <StatCard icon="👥" value="500K+" label="Happy Readers" delay={1.4} />
            <StatCard icon="⭐" value="4.9" label="Average Rating" delay={1.5} />
          </div>
        </div>

        {/* ════════════ RIGHT — FLOATING BOOKS ════════════ */}
        <div className="relative w-full aspect-square max-w-[600px] max-h-[600px] hidden lg:block mx-auto self-center">

          {/* Warm spotlight glow behind books */}
          <motion.div
            animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.08, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
            style={{
              left: "10%", top: "5%",
              width: "85%", height: "90%",
              background: "radial-gradient(ellipse at 55% 45%, rgba(244,98,58,0.22) 0%, rgba(52,160,90,0.10) 50%, transparent 75%)",
              borderRadius: "50%",
              filter: "blur(20px)",
            }}
          />

          {HERO_BOOKS.map((book, i) => (
            <motion.div
              key={book.isbn}
              initial={{ opacity: 0, x: 120, rotate: 0 }}
              animate={{ opacity: 1, x: 0, rotate: book.rot }}
              transition={{
                delay: 0.4 + book.delay,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                position: "absolute",
                left: book.x,
                top: book.y,
                zIndex: book.z,
                width: i === 0 || i === 2 || i === 3 ? "38%" : i === 5 ? "34%" : "28%",
                willChange: "transform",
              }}
            >
              <motion.div
                animate={{ y: [0, -(6 + i * 2), 0], rotate: [book.rot, book.rot + 1.2, book.rot] }}
                transition={{
                  duration: 4 + i * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.6,
                }}
                className="relative"
                style={{ willChange: "transform" }}
              >
                {/* 3D book shadow */}
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    boxShadow: "0 40px 80px -10px rgba(0,0,0,0.75), 0 15px 30px -8px rgba(0,0,0,0.5)",
                    transform: "translateY(8px) scale(0.95)",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "0.75rem",
                    filter: "blur(8px)",
                  }}
                />
                <img
                  src={coverUrl(book.isbn)}
                  alt={book.title}
                  className="relative w-full rounded-xl object-cover"
                  style={{
                    aspectRatio: "2/3",
                    boxShadow: "0 30px 60px -10px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
                    filter: "brightness(1.05) contrast(1.02)",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                {/* Glossy sheen on book */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.04) 100%)",
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Bottom gradient fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(10,20,14,0.4))",
        }}
      />

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   PREMIUM NAVBAR – transparent on hero, white on scroll
══════════════════════════════════════════════════════════ */
export function PremiumNavbar() {
  const cartCount = useCartStore((s) => s.count());
  const { user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/books", label: "Browse" },
    { to: "/categories", label: "Categories" },
    { to: "/deals", label: "Deals" },
    { to: "/authors", label: "Authors" },
  ];

  /* ── colour tokens that flip on scroll ── */
  const NAV_BG = scrolled ? "rgba(255,255,255,0.97)" : "transparent";
  const LOGO_TXT = scrolled ? "#1B4332" : "#ffffff";
  const LINK_CLR = scrolled ? "rgba(55,65,81,0.85)" : "rgba(255,255,255,0.85)";
  const ICON_CLR = scrolled ? "#4B5563" : "rgba(255,255,255,0.85)";
  const SHADOW = scrolled ? "0 2px 24px rgba(0,0,0,0.10)" : "none";
  const LOGO_RING = scrolled ? "rgba(27,67,50,0.12)" : "rgba(255,255,255,0.18)";

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        background: NAV_BG,
        boxShadow: SHADOW,
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="container flex h-[68px] items-center justify-between gap-2 px-3 sm:px-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{ background: LOGO_RING, border: "1.5px solid rgba(255,255,255,0.22)" }}
          >
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span
            className="font-display text-xl font-bold tracking-tight transition-colors duration-300"
            style={{ color: LOGO_TXT }}
          >
            Book<span style={{ color: "#F4623A" }}>Vault</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              style={({ isActive }) => ({
                color: isActive ? "#F4623A" : LINK_CLR,
                background: isActive
                  ? scrolled ? "rgba(244,98,58,0.10)" : "rgba(255,255,255,0.12)"
                  : "transparent",
              })}
              className="px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 hover:opacity-100"
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1 ml-auto lg:ml-0">
          {/* Search */}
          <button
            className="p-2 rounded-xl transition-all duration-200 hover:bg-white/10"
            style={{ color: ICON_CLR }}
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 rounded-xl transition-all hover:bg-white/10">
            <ShoppingCart className="h-5 w-5 transition-colors duration-300" style={{ color: ICON_CLR }} />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* Auth buttons */}
          {user ? (
            <Link to={user.role === "admin" ? "/admin" : "/dashboard"} className="ml-2 hidden sm:block">
              <button
                className="px-5 py-2 rounded-full text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#F4623A,#e8501f)" }}
              >
                Dashboard
              </button>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <Link to="/login">
                <button
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  style={scrolled
                    ? { border: "1.5px solid #d1d5db", color: "#374151" }
                    : { border: "1.5px solid rgba(255,255,255,0.38)", color: "#ffffff" }
                  }
                >
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button
                  className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg,#F4623A,#e8501f)",
                    boxShadow: "0 4px 14px rgba(244,98,58,0.40)",
                  }}
                >
                  Get Started
                </button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-white/10"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <div className="flex flex-col gap-[5px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-5 h-[2px] rounded-full transition-colors duration-300"
                  style={{ background: ICON_CLR }}
                />
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            <div className="container py-4 flex flex-col gap-1">
              {navItems.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-semibold text-gray-700"
                >
                  {n.label}
                </Link>
              ))}
              {user ? (
                <div className="pt-3 border-t border-gray-100 mt-2 space-y-3">
                  <div className="px-4 py-2 bg-gray-50 rounded-xl flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ background: "#F4623A" }}>
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <div className="text-xs truncate text-gray-800">
                      <div className="font-semibold truncate">{user.name}</div>
                      <div className="opacity-75 truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setMobileOpen(false)} className="flex-1">
                      <button
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition hover:brightness-105"
                        style={{ background: "linear-gradient(135deg,#F4623A,#e8501f)" }}
                      >
                        {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                      </button>
                    </Link>
                    <button
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-3 border-t border-gray-100 mt-2">
                  <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <button
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "#F4623A" }}
                    >
                      Get Started
                    </button>
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
