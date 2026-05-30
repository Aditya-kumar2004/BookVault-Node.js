import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Truck, BookOpen, ShieldCheck, Star, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookCard } from "@/components/BookCard";
import { ALL_BOOKS, BOOKS, GENRES, AUTHORS } from "@/data/books";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuthStore } from "@/stores";

/* ─────────────────────────────────────────────
   CATEGORIES MARQUEE – infinite auto-scroll left→right, pause on hover
───────────────────────────────────────────── */
const MARQUEE_CATS = [
  { name: "All", cover_image: "/covers/midnight_library.png", color: "#1B4332" },
  { name: "Mystery", cover_image: "/covers/silent_patient.png", color: "#0D1B3E" },
  { name: "Sci-Fi", cover_image: "/covers/1984_orwell.png", color: "#1A1A2E" },
  { name: "Romance", cover_image: "/covers/fault_stars.png", color: "#C2185B" },
  { name: "Fantasy", cover_image: "/covers/the_alchemist.png", color: "#4B2D8C" },
  { name: "Thriller", cover_image: "/covers/silent_patient.png", color: "#6B1A1A" },
  { name: "History", cover_image: "/covers/sapiens_harari.png", color: "#3E2723" },
  { name: "Self-Help", cover_image: "/covers/subtle_art.png", color: "#1B4A4A" },
  { name: "Biography", cover_image: "/covers/psychology_money.png", color: "#1A237E" },
  { name: "Novel", cover_image: "/covers/thinking_fast.png", color: "#2E7D32" },
  { name: "Children", cover_image: "/covers/harry_potter_1.png", color: "#F57C00" },
  { name: "Poetry", cover_image: "/covers/thinking_fast.png", color: "#6A1B9A" },
  { name: "Horror", cover_image: "/covers/maze_runner.png", color: "#1B0000" },
  { name: "Adventure", cover_image: "/covers/maze_runner.png", color: "#004D40" },
];

export function CategoriesPills() {
  const [active, setActive] = useState("All");
  const [paused, setPaused] = useState(false);
  // duplicate for seamless loop
  const items = [...MARQUEE_CATS, ...MARQUEE_CATS];

  return (
    <section className="bg-background py-10 border-b border-border overflow-hidden">
      {/* Section label */}
      <div className="container mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-1">Browse by Genre</p>
          <h3 className="font-display text-2xl font-bold">Explore Categories</h3>
        </div>
        <Link to="/categories"
          className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Marquee track */}
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >

        <div
          className="flex gap-5 px-6"
          style={{
            animation: `marquee-scroll 32s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
            width: "max-content",
          }}
        >
          {items.map((c, idx) => (
            <button
              key={`${c.name}-${idx}`}
              onClick={() => setActive(c.name)}
              className="flex flex-col items-center gap-3 flex-shrink-0 group"
            >
              {/* Book cover card */}
              <div
                className="relative overflow-hidden transition-all duration-300 group-hover:scale-110"
                style={{
                  width: 90,
                  height: 120,
                  borderRadius: 14,
                  boxShadow: active === c.name
                    ? `0 0 0 2.5px #F4623A, 0 12px 28px rgba(0,0,0,0.25)`
                    : "0 8px 20px rgba(0,0,0,0.15)",
                  transform: active === c.name ? "scale(1.08)" : undefined,
                }}
              >
                {/* Colored bg fallback */}
                <div className="absolute inset-0" style={{ background: c.color }} />
                <img
                  src={c.cover_image || `https://covers.openlibrary.org/b/isbn/${c.isbn}-M.jpg`}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.5) 100%)" }} />
                {/* Active badge */}
                {active === c.name && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-white text-[9px] font-black">✓</span>
                  </div>
                )}
                {/* Category label on card */}
                <div className="absolute bottom-0 inset-x-0 p-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/90">
                    {c.name}
                  </span>
                </div>
              </div>

              {/* Label below */}
              <span
                className="text-xs font-bold whitespace-nowrap transition-colors duration-200"
                style={{ color: active === c.name ? "#F4623A" : "inherit" }}
              >
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Marquee keyframe */}
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────
   BOOK OF THE MONTH (Curator's Pick)
───────────────────────────────────────────── */
export function BookOfMonth() {
  const scrollRef = useRef(null);
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  const featured = ALL_BOOKS.slice(0, 7);
  return (
    <section className="container py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] text-accent font-bold uppercase mb-2">Featured Picks</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Curator's Pick</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/books" className="text-sm font-semibold text-accent hover:underline hidden sm:flex items-center gap-1">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
          <button onClick={() => scroll(-1)} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll(1)} className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {featured.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex-shrink-0 w-[160px] sm:w-[180px]"
          >
            <BookCard book={b} showBestsellerBadge={b.badge === "BESTSELLER"} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   GENRES GRID – premium cinematic images
───────────────────────────────────────────── */
const GENRE_META = [
  { name: "Fiction", emoji: "📚", image: "/genre-fiction.jpg", count: 1284, overlay: "rgba(15,45,25,0.72)" },
  { name: "Fantasy", emoji: "✨", image: "/genre-fantasy.jpg", count: 842, overlay: "rgba(30,15,80,0.72)" },
  { name: "Nonfiction", emoji: "🔬", image: "/genre-nonfiction.jpg", count: 1024, overlay: "rgba(8,50,65,0.72)" },
  { name: "Thriller", emoji: "🔍", image: "/genre-thriller.jpg", count: 612, overlay: "rgba(50,5,5,0.78)" },
  { name: "Romance", emoji: "💕", image: "/genre-romance.jpg", count: 998, overlay: "rgba(80,10,40,0.72)" },
  { name: "Mystery", emoji: "🌙", image: "/genre-mystery.jpg", count: 731, overlay: "rgba(8,12,50,0.78)" },
  { name: "Military Strategy", emoji: "🎖️", image: "/covers/art_of_war.png", count: 5, overlay: "rgba(35,35,45,0.78)" },
  { name: "Military Leadership", emoji: "🎖️", image: "/covers/extreme_ownership.png", count: 5, overlay: "rgba(45,35,30,0.78)" },
  { name: "Mental Toughness & Discipline", emoji: "⚡", image: "/covers/cant_hurt_me.png", count: 5, overlay: "rgba(20,40,55,0.78)" },
  { name: "Success & Personal Growth", emoji: "🌱", image: "/covers/atomic_habits.png", count: 5, overlay: "rgba(15,50,30,0.78)" },
  { name: "Wealth & Financial Success", emoji: "💰", image: "/covers/psychology_money.png", count: 5, overlay: "rgba(55,45,15,0.78)" },
];

export function Genres() {
  const user = useAuthStore((s) => s.user);
  const displayedGenres = GENRE_META.slice(0, 6);

  return (
    <section className="container py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] text-accent font-bold uppercase mb-1.5">Discover</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Browse by Genre</h2>
        </div>
        <Link
          to={user ? "/categories" : "/login"}
          className="text-sm font-semibold text-accent hover:underline flex items-center gap-1 group font-sans"
        >
          All genres{" "}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayedGenres.map((g, i) => (
          <motion.div
            key={g.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={`/categories/${g.name.toLowerCase()}`}
              className="group relative flex items-center gap-4 p-4 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.025] hover:-translate-y-0.5"
              style={{ minHeight: 72 }}
            >
              {/* Cinematic background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.06]"
                style={{ backgroundImage: `url(${g.image})` }}
              />
              {/* Dark overlay for text legibility */}
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(105deg, ${g.overlay} 0%, rgba(0,0,0,0.35) 100%)` }}
              />
              {/* Glossy sheen */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-black/25 pointer-events-none" />

              {/* Frosted-glass emoji badge */}
              <div
                className="relative flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.22)" }}
              >
                {g.emoji}
              </div>

              {/* Text */}
              <div className="relative flex-1 min-w-0">
                <h3 className="font-display text-base font-bold leading-none text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                  {g.name}
                </h3>
                <p className="text-white/65 text-xs mt-1.5 font-medium">{g.count.toLocaleString()} titles</p>
              </div>

              {/* Animated arrow */}
              <div
                className="relative flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-3 group-hover:translate-x-0"
                style={{ background: "rgba(255,255,255,0.20)", backdropFilter: "blur(6px)" }}
              >
                <ArrowRight className="h-3.5 w-3.5 text-white" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────
   NEW ADDED CAROUSEL
───────────────────────────────────────────── */
const NEW_BOOKS = [
  { id: "n0", title: "Echoes of Eternity", author: "Aveline Thorne", genre: "Fantasy", isbn: "9781982137285", price: 19.99, oldPrice: 29.99, rating: 4.9, reviews: 1420, cover_image: "/covers/echoes_eternity.png" },
  { id: "n1", title: "The Midnight Library", author: "Matt Haig", genre: "Fiction", isbn: "9780525559474", price: 12.99, oldPrice: 18.99, rating: 4.2, reviews: 3200, cover_image: "/covers/midnight_library.png" },
  { id: "n2", title: "The Silent Patient", author: "Alex Michaelides", genre: "Thriller", isbn: "9781250301697", price: 9.99, oldPrice: 14.99, rating: 4.5, reviews: 1800, cover_image: "/covers/silent_patient.png" },
  { id: "n3", title: "Atomic Habits", author: "James Clear", genre: "Self-Help", isbn: "9780735211292", price: 14.99, oldPrice: 18.99, rating: 4.8, reviews: 2400, cover_image: "/covers/atomic_habits.png" },
  { id: "n4", title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", isbn: "9780062315007", price: 8.99, oldPrice: 12.99, rating: 4.6, reviews: 1500, cover_image: "/covers/the_alchemist.png" },
  { id: "n5", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "Non-Fiction", isbn: "9780374533557", price: 13.99, oldPrice: 17.99, rating: 4.4, reviews: 3200, cover_image: "/covers/thinking_fast.png" },
  { id: "n6", title: "The Maze Runner", author: "James Dashner", genre: "Science Fiction", isbn: "9780385737951", price: 7.99, oldPrice: 11.99, rating: 4.1, reviews: 1800, cover_image: "/covers/maze_runner.png" },
  { id: "n7", title: "1984", author: "George Orwell", genre: "Fiction", isbn: "9780451524935", price: 6.99, oldPrice: 9.99, rating: 4.7, reviews: 4500, cover_image: "/covers/1984_orwell.png" },
  { id: "n8", title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction", isbn: "9780062316097", price: 15.99, oldPrice: 19.99, rating: 4.5, reviews: 2900, cover_image: "/covers/sapiens_harari.png" },
  { id: "n9", title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling", genre: "Fantasy", isbn: "9780439708180", price: 10.99, oldPrice: 14.99, rating: 4.9, reviews: 6200, cover_image: "/covers/harry_potter_1.png" },
  { id: "n10", title: "The Psychology of Money", author: "Morgan Housel", genre: "Non-Fiction", isbn: "9780857197689", price: 13.99, oldPrice: 16.99, rating: 4.6, reviews: 1800, cover_image: "/covers/psychology_money.png" },
  { id: "n11", title: "The Fault in Our Stars", author: "John Green", genre: "Romance", isbn: "9780525478812", price: 9.49, oldPrice: 13.99, rating: 4.6, reviews: 2500, cover_image: "/covers/fault_stars.png" },
  { id: "n12", title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", genre: "Self-Help", isbn: "9780062457714", price: 11.99, oldPrice: 15.99, rating: 4.3, reviews: 3100, cover_image: "/covers/subtle_art.png" }
];

export function NewAdded() {
  const user = useAuthStore((s) => s.user);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get("/books", { params: { per_page: -1 } })
      .then(({ data }) => {
        const fetchedBooks = data.data || data || [];
        // Sort by ID descending to get newest added books first
        const sortedBooks = [...fetchedBooks].sort((a, b) => b.id - a.id);
        setBooks(sortedBooks);
      })
      .catch((err) => {
        console.error("Error fetching newly added books:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  if (!user) return null;

  return (
    <section className="bg-secondary/30 py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold">New Added</h2>
          <div className="flex items-center gap-3">
            <Link to="/books" className="text-sm font-semibold text-accent hover:underline">See all</Link>
            <button onClick={() => scroll(-1)} className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll(1)} className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">
            Loading newly added books...
          </div>
        ) : books.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No books available at the moment.
          </div>
        ) : (
          <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
            {books.map((b, i) => (
              <motion.div
                key={`${b.id}-${i}`}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex-shrink-0 w-44"
              >
                <BookCard book={b} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   DEALS OF THE WEEK
───────────────────────────────────────────── */
function useCountdown(targetMs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, targetMs - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
}

function CountBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-foreground text-background w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center font-display text-2xl font-bold tabular-nums shadow">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] mt-1.5 text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
  );
}

export function Deals() {
  const target = useRef(Date.now() + 1000 * 60 * 60 * 36).current;
  const { days, hours, mins, secs } = useCountdown(target);
  const dealsBooks = ALL_BOOKS.filter((b) => b.oldPrice).slice(0, 3);

  return (
    <section className="bg-secondary/30 py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-xs tracking-[0.2em] text-accent font-bold uppercase mb-2">Limited Time</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Deals of the Week</h2>
          </div>
          <div className="flex gap-3">
            <CountBox value={days} label="Days" />
            <div className="text-2xl font-bold text-foreground/40 self-center mt-[-12px]">:</div>
            <CountBox value={hours} label="Hours" />
            <div className="text-2xl font-bold text-foreground/40 self-center mt-[-12px]">:</div>
            <CountBox value={mins} label="Mins" />
            <div className="text-2xl font-bold text-foreground/40 self-center mt-[-12px]">:</div>
            <CountBox value={secs} label="Secs" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dealsBooks.map((b) => (
            <div key={b.id} className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-book transition">
              <BookCard book={b} showBestsellerBadge={b.badge === "BESTSELLER"} />
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/deals">
            <Button variant="coral" size="lg" className="rounded-full px-8">
              Shop All Deals <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   BEST SELLERS
───────────────────────────────────────────── */
export function BestSellers() {
  const books = ALL_BOOKS.slice(0, 7);
  return (
    <section className="container py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] text-accent font-bold uppercase mb-1.5">Top Rated</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Best Sellers</h2>
        </div>
        <Link
          to="/books"
          className="text-sm font-semibold text-accent hover:underline hidden sm:flex items-center gap-1"
        >
          See all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Row 1 – 4 books */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-5">
        {books.slice(0, 4).map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <BookCard book={b} showBestsellerBadge={b.badge === "BESTSELLER"} />
          </motion.div>
        ))}
      </div>

      {/* Row 2 – 3 books + Promo card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {books.slice(4, 7).map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 + 0.24 }}
          >
            <BookCard book={b} showBestsellerBadge={b.badge === "BESTSELLER"} />
          </motion.div>
        ))}

        {/* Promo card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.42 }}
          className="bg-navy text-navy-foreground rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-book min-h-[340px]"
        >
          {/* Decorative large book emoji */}
          <div className="absolute -right-6 -bottom-6 text-[110px] opacity-10 select-none">📚</div>
          {/* Decorative dark overlay books */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(ellipse at 80% 80%, #F4623A33 0%, transparent 70%)`
          }} />
          <div className="relative z-10">
            <p className="text-[10px] tracking-[0.2em] text-accent font-black uppercase mb-3">PROMO</p>
            <h3 className="font-display text-xl font-bold leading-snug text-white">
              Get 20% off bestsellers
            </h3>
            <p className="text-xs text-white/60 mt-3 leading-relaxed">
              Use code{" "}
              <span className="font-bold text-accent">#VAULT20</span>{" "}
              at checkout.
            </p>
          </div>
          <Button variant="coral" className="relative z-10 self-start mt-6 rounded-full text-sm px-5">
            Claim Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   AUTHORS
───────────────────────────────────────────── */
export function Authors() {
  return (
    <section className="bg-secondary/30 py-16">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.2em] text-accent font-bold uppercase mb-2">Spotlight</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Meet the authors</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {AUTHORS.map((a) => (
            <div key={a.id} className="text-center group cursor-pointer">
              <div className="relative mx-auto w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden ring-4 ring-transparent group-hover:ring-accent transition duration-300 shadow-soft">
                <img src={a.img} alt={a.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-display font-semibold mt-4 text-sm">{a.name}</h3>
              <div className="flex items-center justify-center gap-1 text-xs mt-1 text-amber-400">
                <Star className="h-3 w-3 fill-amber-400" /> {a.rating}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TRUST
───────────────────────────────────────────── */
export function Trust() {
  const items = [
    { icon: Truck, title: "Free Delivery", desc: "On all orders over ₹500, delivered anywhere." },
    { icon: BookOpen, title: "2M+ Books", desc: "From every genre and era, curated for you." },
    { icon: ShieldCheck, title: "Secure Payment", desc: "End-to-end encrypted, trusted checkout." },
  ];
  return (
    <section className="container py-16">
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it) => (
          <div key={it.title} className="bg-card rounded-2xl p-8 shadow-soft flex items-start gap-4 hover:shadow-book transition">
            <div className="h-12 w-12 rounded-xl gradient-coral flex items-center justify-center text-white shrink-0">
              <it.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">{it.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PROMO BANNER
───────────────────────────────────────────── */
export function PromoBanner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { default: api } = await import("../../lib/api");
      const { toast } = await import("sonner");
      await api.post("/newsletter/subscribe", { email });
      toast.success("Subscribed successfully! Check your inbox for the 20% discount code 🎉");
      setEmail("");
    } catch (err) {
      const { toast } = await import("sonner");
      toast.error(err.response?.data?.message || "Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container pb-20">
      <div className="gradient-hero text-primary-foreground rounded-3xl p-6 sm:p-10 md:p-14 grid md:grid-cols-2 gap-10 items-center relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-20 flex gap-2">
          {BOOKS.slice(0, 3).map((b, i) => (
            <div key={b.id} className="w-24 h-36 rounded-lg overflow-hidden shadow"
              style={{ transform: `rotate(${(i - 1) * 10}deg) translate(${i * 20}px, ${i * 8}px)` }}>
              <img src={`https://covers.openlibrary.org/b/isbn/${b.isbn}-M.jpg`} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-accent font-bold uppercase mb-3">Welcome offer</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">Get 20% off your first order</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-md">
            Sign up to our newsletter and we'll send a discount code straight to your inbox.
          </p>
        </div>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 relative z-10">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="you@example.com"
            className="bg-primary-foreground text-foreground h-12 flex-1"
          />
          <Button variant="coral" size="lg" type="submit" className="rounded-full px-8" disabled={loading}>
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
}
