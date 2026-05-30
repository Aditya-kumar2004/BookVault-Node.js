import { Card } from "@/components/ui/card";
import { BookCard } from "@/components/BookCard";
import { ALL_BOOKS, coverFromIsbn } from "@/data/books";
import { useAuthStore, useWishlistStore, useCartStore } from "@/stores";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Heart, ShoppingBag, Star, Trash2, ShoppingCart, Lock, CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Stat = ({ icon: Icon, label, value }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-3xl font-bold mt-1">{value}</div>
      </div>
      <div className="h-11 w-11 rounded-lg gradient-coral text-white flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </Card>
);

export function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    import("../../lib/api").then(({ default: api }) => {
      api.get("/orders")
        .then(({ data }) => {
          setOrdersCount(data.length);
          setLoadingStats(false);
        })
        .catch(() => {
          setLoadingStats(false);
        });
    });
  }, []);

  const reading = ALL_BOOKS[0];
  return (
    <div className="space-y-8">
      <div className="gradient-hero text-primary-foreground p-8 rounded-2xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Welcome back, {user?.name} 📚</h1>
        <p className="text-primary-foreground/80 mt-2">You're on a 7-day reading streak. Keep going</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={BookOpen} label="Books read" value="24" />
        <Stat icon={Heart} label="Wishlist" value={wishlistIds.length} />
        <Stat icon={ShoppingBag} label="Orders" value={loadingStats ? "..." : ordersCount} />
        <Stat icon={Star} label="Reviews" value="15" />
      </div>

      <Card className="p-6">
        <h3 className="font-display text-xl font-semibold mb-4">Currently Reading</h3>
        <div className="flex gap-6">
          <div className="w-28 shrink-0">
            <BookCard book={reading} />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="font-display text-lg font-semibold">{reading.title}</div>
              <div className="text-sm text-muted-foreground">{reading.author}</div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span><span>62%</span>
              </div>
              <Progress value={62} />
            </div>
            <Button variant="coral" size="sm">Continue Reading</Button>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="font-display text-2xl font-semibold mb-4">Recommended for you</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {ALL_BOOKS.slice(2, 6).map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </div>
    </div>
  );
}

export function Library() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Reading", "Completed", "Want to Read"];
  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">My Library</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {ALL_BOOKS.slice(0, 8).map((b) => <BookCard key={b.id} book={b} />)}
      </div>
    </div>
  );
}

export function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const add = useCartStore((s) => s.add);
  const books = ALL_BOOKS.filter((b) => ids.includes(b.id));

  if (books.length === 0)
    return (
      <div className="text-center py-20">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="font-display text-2xl mt-4">Your wishlist is empty</h2>
        <p className="text-muted-foreground mt-2">Save books you love for later.</p>
      </div>
    );

  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6">Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {books.map((b) => (
          <BookCard key={b.id} book={b} isWishlist={true} />
        ))}
      </div>
    </div>
  );
}

const downloadInvoicePDF = (order) => {
  const [name, phone, address, method] = order.shipping_address ? order.shipping_address.split(" | ") : ["Aditya Kumar", "+91 98765 43210", "Default Address", "Method: COD"];
  
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - BVT-ORD-${order.id}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Outfit', sans-serif;
            color: #111827;
            margin: 0;
            padding: 40px;
            background-color: #ffffff;
          }
          .invoice-card {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            position: relative;
            overflow: hidden;
          }
          .header-gradient {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #F4623A, #1B4332);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 30px;
          }
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: bold;
            color: #1B4332;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .logo-dot {
            width: 12px;
            height: 12px;
            background-color: #F4623A;
            border-radius: 50%;
            display: inline-block;
          }
          .meta-info {
            text-align: right;
          }
          .meta-info h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .meta-info p {
            margin: 5px 0 0 0;
            font-size: 14px;
            color: #6b7280;
          }
          .details-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 40px;
            margin-top: 30px;
            padding-bottom: 30px;
            border-bottom: 2px solid #f3f4f6;
          }
          .details-column h3 {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #9ca3af;
            margin: 0 0 10px 0;
          }
          .details-column p {
            margin: 5px 0;
            font-size: 14px;
            line-height: 1.5;
          }
          .details-column b {
            color: #111827;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
          }
          .table th {
            text-align: left;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #9ca3af;
            padding: 12px 16px;
            border-bottom: 2px solid #e5e7eb;
          }
          .table td {
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 14px;
          }
          .table td.num {
            text-align: right;
          }
          .table th.num {
            text-align: right;
          }
          .item-title {
            font-weight: 600;
            color: #111827;
          }
          .item-author {
            font-size: 12px;
            color: #6b7280;
            margin-top: 2px;
          }
          .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 30px;
          }
          .summary-box {
            width: 300px;
            background-color: #f9fafb;
            border-radius: 16px;
            padding: 20px;
            border: 1px solid #f3f4f6;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .summary-row.total {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px dashed #e5e7eb;
            font-size: 18px;
            font-weight: 800;
            color: #1B4332;
          }
          .footer-note {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-card {
              border: none;
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header-gradient"></div>
          <div class="header">
            <div class="logo">
              <span class="logo-dot"></span>BookVault
            </div>
            <div class="meta-info">
              <h2>Invoice</h2>
              <p>Reference: <b>BVT-ORD-${order.id}</b></p>
              <p>Date: <b>${new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</b></p>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="details-column">
              <h3>Billed To</h3>
              <p><b>Name:</b> ${name}</p>
              <p><b>Phone:</b> ${phone ? phone.replace("Phone: ", "") : ""}</p>
              <p><b>Address:</b> ${address ? address.replace("Address: ", "") : ""}</p>
            </div>
            <div class="details-column">
              <h3>Payment & Shipping</h3>
              <p><b>Method:</b> ${method ? method.replace("Method: ", "") : "COD"}</p>
              <p><b>Shipping Class:</b> Standard Ground (Free)</p>
              <p><b>Status:</b> ${order.status.toUpperCase()}</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th class="num">Unit Price</th>
                <th class="num">Qty</th>
                <th class="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>
                    <div class="item-title">${item.book?.title || 'Book Title'}</div>
                    <div class="item-author">by ${item.book?.author || 'Author'}</div>
                  </td>
                  <td class="num">₹${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td class="num">${item.quantity}</td>
                  <td class="num">₹${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>₹${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span style="color: #10b981; font-weight: 600;">FREE</span>
              </div>
              <div class="summary-row total">
                <span>Total Amount</span>
                <span>₹${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="footer-note">
            Thank you for shopping with BookVault! If you have any questions regarding this invoice, please reach out to support@bookvault.io
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

function OrderTracker({ status, currentStep }) {
  const isCancelled = status?.toLowerCase() === "cancelled";
  const steps = isCancelled ? [
    { step: 1, label: "Confirmed", desc: "Order placed" },
    { step: 2, label: "Cancelled", desc: "Order was cancelled" }
  ] : [
    { step: 1, label: "Confirmed", desc: "Order placed" },
    { step: 2, label: "Processing", desc: "Packed & ready" },
    { step: 3, label: "On the Way", desc: "Out for delivery" },
    { step: 4, label: "Delivered", desc: "Received" }
  ];

  const [lineWidth, setLineWidth] = useState("0%");

  useEffect(() => {
    const targetWidth = isCancelled ? "100%" : `${((currentStep - 1) / (steps.length - 1)) * 100}%`;
    const t = setTimeout(() => {
      setLineWidth(targetWidth);
    }, 100);
    return () => clearTimeout(t);
  }, [currentStep, isCancelled, steps.length]);

  return (
    <div className="pt-4 mt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <h4 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Shipment Progress Tracker</h4>
      
      <div className="relative">
        {/* Tracking Line */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-out ${
              isCancelled 
                ? "bg-gradient-to-r from-emerald-500 to-red-500" 
                : "bg-emerald-500"
            }`}
            style={{ width: lineWidth }}
          />
        </div>

        {/* Steps */}
        <div className="flex justify-between relative text-center">
          {steps.map((s) => {
            const isActive = isCancelled ? true : currentStep >= s.step;
            const stepBgColor = isCancelled 
              ? (s.step === 2 ? "bg-red-500 text-white animate-pulse" : "bg-emerald-500 text-white")
              : (isActive ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground");
            return (
              <div key={s.step} className="flex flex-col items-center flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${stepBgColor} ${
                  isActive && !isCancelled ? "scale-110 shadow-lg shadow-emerald-500/20" : ""
                } ${
                  s.label === "Cancelled" ? "scale-110 shadow-lg shadow-red-500/20 border-2 border-red-200" : ""
                }`}>
                  {s.label === "Cancelled" ? "✕" : s.step}
                </div>
                <div className="mt-2 text-xs font-bold leading-tight">{s.label}</div>
                <div className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState(() => {
    const saved = localStorage.getItem("trackingOrderId");
    return saved ? parseInt(saved) : null;
  });

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const { default: api } = await import("../../lib/api");
      await api.put(`/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully!");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order.");
    }
  };

  useEffect(() => {
    import("../../lib/api").then(({ default: api }) => {
      api.get("/orders")
        .then(({ data }) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    });
  }, []);

  const getStatusStep = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return 1;
      case "processing": return 2;
      case "shipped": return 3;
      case "delivered": return 4;
      default: return 1;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-amber-500 text-white hover:bg-amber-600";
      case "processing": return "bg-blue-500 text-white hover:bg-blue-600";
      case "shipped": return "bg-indigo-500 text-white hover:bg-indigo-600";
      case "delivered": return "bg-emerald-500 text-white hover:bg-emerald-600";
      case "cancelled": return "bg-red-500 text-white hover:bg-red-600";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-3xl font-bold mb-6">Orders</h1>
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-2xl">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50" />
        <h2 className="font-display text-2xl font-bold mt-4">No orders placed yet</h2>
        <p className="text-muted-foreground mt-2 text-sm">Once you buy your first books, you can track them here!</p>
        <Button variant="coral" className="mt-4" onClick={() => window.location.href = "/books"}>Browse Books</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">My Orders</h1>
      
      <div className="space-y-4">
        {orders.map((o) => {
          const isTracking = String(trackingId) === String(o.id);
          const currentStep = getStatusStep(o.status);
          const totalBooksCount = o.items ? o.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
          const [name, phone, address, method] = o.shipping_address ? o.shipping_address.split(" | ") : ["Aditya Kumar", "+91 98765 43210", "Default Address", "Method: COD"];

          return (
            <Card key={o.id} className="overflow-hidden border border-border/60 hover:border-accent/30 transition-all duration-300">
              <div className="h-1.5 w-full bg-gradient-to-r from-accent to-primary" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order ID</div>
                    <div className="font-mono text-lg font-bold">BVT-ORD-{o.id}</div>
                    <div className="text-xs text-muted-foreground mt-1">Placed on {new Date(o.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(o.status)}>{o.status.toUpperCase()}</Badge>
                    <span className="text-xl font-bold text-accent">₹{parseFloat(o.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Book list covers inside order */}
                <div className="flex gap-2 flex-wrap items-center">
                  {o.items && o.items.map((item, idx) => (
                    <div key={idx} className="relative group/cover">
                      <img
                        src={item.book?.cover_image || coverFromIsbn(item.book?.isbn)}
                        alt={item.book?.title || "Book Cover"}
                        className="w-10 h-14 object-cover rounded shadow border"
                        onError={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                  <span className="text-xs text-muted-foreground ml-2 font-medium">({totalBooksCount} book{totalBooksCount !== 1 ? "s" : ""})</span>
                </div>

                {/* Address info */}
                <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1">
                  <div><b>Customer:</b> {name}</div>
                  <div><b>Phone:</b> {phone ? phone.replace("Phone: ", "") : ""}</div>
                  <div><b>Shipping Address:</b> {address ? address.replace("Address: ", "") : ""}</div>
                  <div><b>Payment Method:</b> <Badge variant="secondary" className="text-[10px] font-mono py-0.5 px-2 ml-1">{method ? method.replace("Method: ", "") : "COD"}</Badge></div>
                </div>

                {/* Track Button */}
                <div className="flex justify-between items-center pt-2 flex-wrap gap-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={isTracking ? "coral" : "outline"}
                      onClick={() => {
                        if (isTracking) {
                          setTrackingId(null);
                          localStorage.removeItem("trackingOrderId");
                        } else {
                          setTrackingId(o.id);
                          localStorage.setItem("trackingOrderId", o.id);
                        }
                      }}
                    >
                      {isTracking ? "Close Tracker" : "Track Order Status"}
                    </Button>
                    {(o.status === "pending" || o.status === "processing") && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleCancelOrder(o.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                  {o.status === "delivered" && (
                    <Button size="sm" variant="ghost" onClick={() => downloadInvoicePDF(o)}>Invoice</Button>
                  )}
                </div>

                {/* Tracker Section */}
                {isTracking && (
                  <OrderTracker status={o.status} currentStep={currentStep} />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function Reviews() {
  const INITIAL = [
    {
      id: 1,
      book: ALL_BOOKS[0],
      rating: 5,
      date: "April 28, 2026",
      text: "An absolute masterpiece. Morgenstern weaves a world so rich and layered that you never want to leave. The prose is lyrical, the mystery is gripping, and the ending left me breathless. One of the best books I've ever read.",
      helpful: 24,
    },
    {
      id: 2,
      book: ALL_BOOKS[1],
      rating: 4,
      date: "March 15, 2026",
      text: "A cleverly constructed psychological thriller. The twist genuinely shocked me — I had to re-read the final chapters twice. Michaelides builds tension masterfully, though the pacing drags slightly in the middle sections.",
      helpful: 18,
    },
    {
      id: 3,
      book: ALL_BOOKS[2],
      rating: 3,
      date: "February 3, 2026",
      text: "A decent read with an interesting concept. The narrator is unreliable in the best way, but I felt some plot threads were left unresolved. Still, a page-turner that kept me guessing until the very last line.",
      helpful: 9,
    },
  ];

  const [reviews, setReviews] = useState(INITIAL);
  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState({ rating: 5, text: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formHover, setFormHover] = useState(0);
  const [newReview, setNewReview] = useState({ bookIdx: 0, rating: 5, text: "" });

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  const startEdit = (r) => {
    setEditId(r.id);
    setEditDraft({ rating: r.rating, text: r.text });
    setHoverRating(0);
  };

  const saveEdit = (id) => {
    if (!editDraft.text.trim()) return toast.error("Review text cannot be empty.");
    setReviews((prev) =>
      prev.map((r) => r.id === id ? { ...r, rating: editDraft.rating, text: editDraft.text } : r)
    );
    setEditId(null);
    toast.success("Review updated successfully!");
  };

  const confirmDelete = () => {
    setReviews((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Review deleted.");
  };

  const submitNew = () => {
    if (!newReview.text.trim()) return toast.error("Please write your review.");
    const book = ALL_BOOKS[newReview.bookIdx];
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    setReviews((prev) => [
      { id: Date.now(), book, rating: newReview.rating, date: today, text: newReview.text, helpful: 0 },
      ...prev,
    ]);
    setNewReview({ bookIdx: 0, rating: 5, text: "" });
    setShowForm(false);
    toast.success("Review published! 🎉");
  };

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">My Reviews</h1>
          <p className="text-muted-foreground mt-1">Share your reading experiences with the BookVault community.</p>
        </div>
        <Button
          variant="coral"
          size="lg"
          className="shrink-0"
          onClick={() => { setShowForm((v) => !v); setDeleteId(null); setEditId(null); }}
        >
          <Star className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {/* ── Write a Review Form ── */}
      {showForm && (
        <Card className="rounded-2xl overflow-hidden border-2 border-accent/30 shadow-xl">
          <div className="h-1 w-full gradient-coral" />
          <div className="p-7 space-y-5">
            <h2 className="font-display text-2xl font-bold">Write a New Review</h2>

            {/* Book Selector */}
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">Choose a Book</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-52 overflow-y-auto pr-1">
                {ALL_BOOKS.slice(0, 8).map((b, i) => (
                  <button
                    key={b.id}
                    onClick={() => setNewReview((p) => ({ ...p, bookIdx: i }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                      newReview.bookIdx === i
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:border-accent/40 hover:bg-muted"
                    }`}
                  >
                    <img
                      src={`https://covers.openlibrary.org/b/isbn/${b.isbn}-S.jpg`}
                      alt=""
                      className="w-10 h-14 object-cover rounded shadow"
                      onError={(e) => { e.target.src = `https://placehold.co/40x56/1a1a2e/fff?text=${encodeURIComponent(b.title.slice(0,3))}`; }}
                    />
                    <span className="text-center leading-tight line-clamp-2">{b.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating Picker */}
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">Your Rating</label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-8 w-8 cursor-pointer transition-all duration-150 ${
                      i < (formHover || newReview.rating) ? "fill-accent text-accent scale-110" : "text-muted-foreground/30"
                    }`}
                    onMouseEnter={() => setFormHover(i + 1)}
                    onMouseLeave={() => setFormHover(0)}
                    onClick={() => setNewReview((p) => ({ ...p, rating: i + 1 }))}
                  />
                ))}
                <span className="ml-3 text-sm font-semibold text-muted-foreground">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][formHover || newReview.rating]}
                </span>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">Your Review</label>
              <textarea
                rows={5}
                value={newReview.text}
                onChange={(e) => setNewReview((p) => ({ ...p, text: e.target.value }))}
                placeholder="What did you think? Share your honest thoughts about the book — the writing style, characters, plot, and overall experience..."
                className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-muted-foreground/50"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{newReview.text.length} characters</span>
                <span>Minimum 20 characters recommended</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button variant="coral" size="lg" onClick={submitNew} className="px-8">
                Publish Review
              </Button>
              <Button variant="outline" size="lg" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteId && (
        <Card className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-destructive">Delete this review?</p>
            <p className="text-sm text-muted-foreground mt-0.5">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Keep it</Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={confirmDelete}
            >
              Yes, Delete
            </Button>
          </div>
        </Card>
      )}

      {/* ── Stats ── */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center justify-center text-center gradient-hero text-primary-foreground rounded-2xl border-0">
          <div className="font-display text-6xl font-bold">{avgRating}</div>
          <div className="flex gap-0.5 mt-2 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < Math.round(avgRating) ? "fill-white text-white" : "text-white/30"}`} />
            ))}
          </div>
          <p className="text-primary-foreground/80 text-sm mt-2">Average across {reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </Card>

        <Card className="p-6 col-span-2 rounded-2xl">
          <h3 className="font-display font-semibold text-lg mb-4">Rating Breakdown</h3>
          <div className="space-y-2.5">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-4 text-right text-muted-foreground font-medium">{star}</span>
                <Star className="h-3.5 w-3.5 fill-accent text-accent shrink-0" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%",
                      background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))",
                    }}
                  />
                </div>
                <span className="w-4 text-muted-foreground font-medium">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Review Cards ── */}
      {reviews.length === 0 ? (
        <Card className="p-16 rounded-2xl text-center border-dashed border-2">
          <Star className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="font-display text-xl font-semibold">No reviews yet</h3>
          <p className="text-muted-foreground mt-2">Click "Write a Review" to share your first reading experience.</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => {
            const isEditing = editId === r.id;
            const displayRating = isEditing ? (hoverRating || editDraft.rating) : r.rating;
            return (
              <Card
                key={r.id}
                className="rounded-2xl overflow-hidden border border-border/60 hover:border-accent/40 transition-all duration-300 hover:shadow-lg"
              >
                <div className="h-1 w-full gradient-coral" />
                <div className="p-6 flex gap-5">
                  {/* Cover */}
                  <div className="shrink-0">
                    <div className="w-16 h-24 rounded-lg overflow-hidden shadow-md ring-1 ring-border">
                      <img
                        src={`https://covers.openlibrary.org/b/isbn/${r.book.isbn}-M.jpg`}
                        alt={r.book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = `https://placehold.co/64x96/1a1a2e/fff?text=${encodeURIComponent(r.book.title.slice(0,4))}`; }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-display font-bold text-lg leading-tight">{r.book.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">by {r.book.author}</p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full shrink-0">{r.date}</span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mt-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 transition-all duration-150 ${
                            isEditing ? "cursor-pointer" : ""
                          } ${
                            i < displayRating ? "fill-accent text-accent scale-105" : "text-muted-foreground/30"
                          }`}
                          onMouseEnter={() => isEditing && setHoverRating(i + 1)}
                          onMouseLeave={() => isEditing && setHoverRating(0)}
                          onClick={() => isEditing && setEditDraft((p) => ({ ...p, rating: i + 1 }))}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">
                        {isEditing
                          ? ["", "Poor", "Fair", "Good", "Great", "Excellent"][hoverRating || editDraft.rating]
                          : `${r.rating}.0 / 5.0`}
                      </span>
                    </div>

                    {/* Review Text / Edit Textarea */}
                    {isEditing ? (
                      <div className="mt-3">
                        <textarea
                          rows={4}
                          value={editDraft.text}
                          onChange={(e) => setEditDraft((p) => ({ ...p, text: e.target.value }))}
                          className="w-full rounded-xl border border-accent/40 bg-muted/50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                        />
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                          {editDraft.text.length} characters
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-muted-foreground mt-3 border-l-2 border-accent/40 pl-3 italic">
                        "{r.text}"
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                      <button
                        onClick={() => toast.success("Marked as helpful!")}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent/10 hover:text-accent transition-all"
                      >
                        👍 Helpful ({r.helpful})
                      </button>

                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="coral"
                              onClick={() => saveEdit(r.id)}
                            >
                              Save Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setEditId(null); setHoverRating(0); }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:border-accent hover:text-accent transition-colors"
                            onClick={() => { startEdit(r); setDeleteId(null); setShowForm(false); }}
                          >
                            Edit Review
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => { setDeleteId(r.id); setEditId(null); setShowForm(false); }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OtpInput({ value, onChange, length = 6 }) {
  const inputsRef = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    // Create a pre-allocated array of exactly 6 elements to prevent collapsed index bugs in JS
    const newOtp = Array(length).fill("");
    for (let i = 0; i < length; i++) {
      newOtp[i] = value[i] || "";
    }

    if (val.length > 1) {
      // Handle fast consecutive typing or pasting into an active field
      let valIdx = 0;
      for (let i = idx; i < length && valIdx < val.length; i++) {
        newOtp[i] = val[valIdx++];
      }
      const updatedValue = newOtp.join("");
      onChange(updatedValue);
      const nextIdx = Math.min(idx + val.length, length - 1);
      inputsRef.current[nextIdx]?.focus();
    } else {
      // Normal single character entry
      newOtp[idx] = val;
      const updatedValue = newOtp.join("");
      onChange(updatedValue);
      if (idx < length - 1) {
        inputsRef.current[idx + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      const newOtp = Array(length).fill("");
      for (let i = 0; i < length; i++) {
        newOtp[i] = value[i] || "";
      }

      if (!newOtp[idx] && idx > 0) {
        newOtp[idx - 1] = "";
        onChange(newOtp.join(""));
        inputsRef.current[idx - 1]?.focus();
      } else {
        newOtp[idx] = "";
        onChange(newOtp.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => {
        const val = value[idx] || "";
        return (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={val}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            autoFocus={idx === 0}
            className="w-10 h-11 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all text-gray-800 shadow-sm"
          />
        );
      })}
    </div>
  );
}

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });
  const [submitting, setSubmitting] = useState(false);

  // New Password Change verification flow states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("idle"); // "idle" | "otp_sent" | "success"
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Full Name cannot be empty.");
    if (!formData.email.trim()) return toast.error("Email Address cannot be empty.");

    setSubmitting(true);
    try {
      const { default: api } = await import("../../lib/api");
      const { data } = await api.put("/profile", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
      });
      setAuth(data.user, token);
      toast.success("Profile settings updated successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile changes.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestPasswordOtp = async () => {
    if (!newPassword) return toast.error("Please enter a new password.");
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters long.");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");

    setOtpLoading(true);
    try {
      const { default: api } = await import("../../lib/api");
      await api.post("/otp/send", { email: user.email, name: user.name });
      setStep("otp_sent");
      toast.success("Verification code sent to your registered email address! ✉️");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyPasswordChange = async () => {
    if (otp.length !== 6) return toast.error("Please enter the 6-digit verification code.");

    setSubmitting(true);
    try {
      const { default: api } = await import("../../lib/api");
      const { data } = await api.put("/profile", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        password: newPassword,
        otp: otp,
      });
      setAuth(data.user, token);
      setStep("success");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password. Invalid or expired OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your professional bookstore identity and preferences.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info Card */}
        <div className="space-y-6">
          <Card className="p-6 text-center flex flex-col items-center justify-center relative overflow-hidden border border-border/40 rounded-2xl shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-accent to-primary" />
            <div className="h-20 w-20 rounded-full bg-accent text-white flex items-center justify-center text-3xl font-extrabold shadow-lg mb-4 select-none">
              {formData.name[0]?.toUpperCase() || "B"}
            </div>
            <h3 className="font-display font-bold text-lg leading-tight">{formData.name || "Book Explorer"}</h3>
            <span className="text-xs font-semibold bg-accent/10 text-accent px-3 py-1 rounded-full mt-1.5 uppercase tracking-wider">
              {user?.role?.toUpperCase() || "READER"}
            </span>
            <p className="text-xs text-muted-foreground mt-3 line-clamp-3">
              {formData.bio || "No biography added yet. Share your favorite reading genres with the BookVault community!"}
            </p>
          </Card>
        </div>

        {/* Right Column: Detailed Input Fields */}
        <Card className="col-span-2 overflow-hidden border border-border/40 rounded-2xl">
          <div className="p-7 space-y-6">
            <h3 className="font-display font-bold text-xl border-b pb-3">Personal Details</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your name"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="name@example.com"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About Me / Bio</Label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Write a short statement about yourself, your favorite genres, authors, or what you enjoy reading..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-muted-foreground/50 text-foreground"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="coral"
                disabled={submitting}
                onClick={handleSave}
                className="px-8 rounded-xl font-bold"
              >
                {submitting ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>

            <div className="space-y-1.5 border-t pt-5 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-accent" />
                <h4 className="font-display font-bold text-lg text-foreground">Security Settings</h4>
              </div>

              {step === "success" ? (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="h-8 w-8 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-display text-lg font-bold text-emerald-800">Password Changed Successfully!</h5>
                    <p className="text-xs text-emerald-600 font-medium leading-relaxed max-w-sm mx-auto">
                      Your BookVault account password has been successfully updated. We have securely logged you in with your new credentials. Thank you for keeping your account secure!
                    </p>
                  </div>
                  <Button
                    variant="coral"
                    size="sm"
                    className="rounded-xl px-6 font-bold"
                    onClick={() => {
                      setStep("idle");
                      setNewPassword("");
                      setConfirmPassword("");
                      setOtp("");
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : step === "otp_sent" ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-muted/40 border border-border/60 rounded-xl flex items-start gap-3">
                    <Mail className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      We have sent a 6-digit passcode to <strong className="text-foreground">{user?.email}</strong>. Enter it below to authorize this password change.
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-center block text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Code</Label>
                    <OtpInput value={otp} onChange={setOtp} length={6} />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="coral"
                      disabled={submitting || otp.length !== 6}
                      onClick={handleVerifyPasswordChange}
                      className="flex-1 rounded-xl font-bold h-11"
                    >
                      {submitting ? "Verifying..." : "Verify & Change Password"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={submitting}
                      onClick={() => {
                        setStep("idle");
                        setOtp("");
                      }}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 8 chars)"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    disabled={otpLoading || !newPassword || !confirmPassword}
                    onClick={handleRequestPasswordOtp}
                    className="w-full rounded-xl font-semibold hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2 h-11"
                  >
                    {otpLoading ? "Sending OTP..." : "Change Password via Email OTP"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
