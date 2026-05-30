import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookCard } from "@/components/BookCard";
import { ALL_BOOKS, GENRES } from "@/data/books";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCartStore, useWishlistStore, useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { coverFromIsbn } from "@/data/books";
import { toast } from "sonner";
import { useState, useEffect } from "react";

function Shell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">{children}</main>
      <Footer />
    </div>
  );
}

export function Browse() {
  const { slug } = useParams();
  const [genre, setGenre] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      // Find the genre name that matches the slug (case-insensitive)
      const found = GENRES.find((g) => g.name.toLowerCase() === decodeURIComponent(slug).toLowerCase());
      if (found) {
        setGenre(found.name);
      } else {
        setGenre(null);
      }
    } else {
      setGenre(null);
    }
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    const params = { per_page: -1 };
    if (genre) params.genre = genre;
    import("../lib/api").then(({ default: api }) => {
      api.get("/books", { params }).then(({ data }) => {
        setBooks(data.data || []);
        setLoading(false);
      });
    });
  }, [genre]);

  return (
    <Shell>
      <h1 className="font-display text-4xl font-bold mb-2">Browse Books</h1>
      <p className="text-muted-foreground mb-8">{books.length} titles available</p>
      <div className="flex gap-2 flex-wrap mb-8">
        <button onClick={() => setGenre(null)} className={`px-4 py-2 rounded-md text-sm font-medium ${!genre ? "bg-primary text-primary-foreground" : "bg-muted"}`}>All</button>
        {GENRES.map((g) => (
          <button key={g.name} onClick={() => setGenre(g.name)} className={`px-4 py-2 rounded-md text-sm font-medium ${genre === g.name ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{g.name}</button>
        ))}
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading books...</p>
      ) : books.length === 0 ? (
        <p className="text-muted-foreground">No books found. Add some from the admin panel.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {books.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </Shell>
  );
}

export function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const add = useCartStore((s) => s.add);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.has(id || ""));

  useEffect(() => {
    import("../lib/api").then(({ default: api }) => {
      api.get(`/books/${id}`)
        .then(({ data }) => {
          setBook(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    });
  }, [id]);

  if (loading) return <Shell><p className="text-muted-foreground">Loading book details...</p></Shell>;
  if (!book) return <Shell><p className="text-muted-foreground">Book not found</p></Shell>;

  return (
    <Shell>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="max-w-sm mx-auto md:mx-0 w-full">
          <div className="book-cover shadow-book">
            <img src={book.cover_image || coverFromIsbn(book.isbn)} alt={book.title} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <p className="text-xs tracking-wider text-accent font-bold uppercase mb-1">{book.genre}</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">{book.title}</h1>
            <p className="text-lg text-muted-foreground mt-2">by {book.author}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-accent text-accent" /> <b>{book.rating}</b>
            <span className="text-muted-foreground">({(book.reviews || 0).toLocaleString()} reviews)</span>
          </div>
          <p className="leading-relaxed">{book.description}</p>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-accent">₹{parseFloat(book.price).toFixed(2)}</span>
            {book.original_price && <span className="text-lg text-muted-foreground line-through">₹{parseFloat(book.original_price).toFixed(2)}</span>}
          </div>
          <div className="flex gap-3">
            <Button variant="coral" size="lg" onClick={() => { add(book); toast.success("Added to cart"); }}>
              <ShoppingCart /> Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                if (!user) {
                  toast.error("Please login to add books to your wishlist!");
                  navigate("/login");
                  return;
                }
                if (isWished) {
                  toast.success("Book has been already added", {
                    style: {
                      border: "1px solid #10B981",
                      background: "#ECFDF5",
                      color: "#065F46"
                    }
                  });
                } else {
                  toggleWish(book.id);
                  toast.success("Added to wishlist");
                }
              }}
            >
              <Heart className={isWished ? "fill-accent text-accent" : ""} />
            </Button>
          </div>
          <dl className="grid grid-cols-2 gap-4 pt-6 border-t text-sm">
            <div><dt className="text-muted-foreground">ISBN</dt><dd className="font-mono">{book.isbn}</dd></div>
            <div><dt className="text-muted-foreground">Pages</dt><dd>{book.pages}</dd></div>
            <div><dt className="text-muted-foreground">Publisher</dt><dd>{book.publisher}</dd></div>
            <div><dt className="text-muted-foreground">Language</dt><dd>{book.language || "English"}</dd></div>
          </dl>
        </div>
      </div>
    </Shell>
  );
}

export function CartPage() {
  const { items, remove, setQty, total, clear } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [isPlacing, setIsPlacing] = useState(false);

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "COD"
  });

  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    bank: ""
  });
  const [selectedBank, setSelectedBank] = useState("");

  useEffect(() => {
    if (showSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#F4623A", "#0D1B3E", "#1B4332", "#FFD700", "#FF69B4"]
        });
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ["#F4623A", "#FFD700", "#1B4332"]
          });
        }, 200);
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ["#0D1B3E", "#FF69B4", "#FFD700"]
          });
        }, 350);
      });
    }
  }, [showSuccess]);

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardDetails(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardDetails(prev => ({ ...prev, expiry: formatted }));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardDetails(prev => ({ ...prev, cvv: value }));
  };

  const getRazorpayBankCode = (bank) => {
    switch (bank) {
      case "State Bank of India": return "SBIN";
      case "HDFC Bank": return "HDFC";
      case "ICICI Bank": return "ICIC";
      case "Axis Bank": return "UTIB";
      case "Kotak Mahindra Bank": return "KKBK";
      case "Punjab National Bank": return "PUNB";
      default: return null;
    }
  };

  const discountAmount = (() => {
    if (!appliedCoupon) return 0;
    const subtotal = total();
    if (appliedCoupon.discount_type === "percent") {
      return subtotal * (parseFloat(appliedCoupon.discount_value) / 100);
    } else {
      return parseFloat(appliedCoupon.discount_value);
    }
  })();

  const discountedTotal = Math.max(0, total() - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }
    const token = useAuthStore.getState().token;
    if (!token) {
      toast.error("Please login to apply coupons.");
      return;
    }

    setValidatingCoupon(true);
    try {
      const { default: api } = await import("../lib/api");
      const res = await api.post("/coupons/validate", {
        code: couponCodeInput.trim()
      });
      if (res.data.valid) {
        setAppliedCoupon(res.data.coupon);
        setCouponCodeInput("");
        toast.success(res.data.message || "Coupon applied successfully! 🎉", {
          style: {
            border: "1px solid #10B981",
            background: "#ECFDF5",
            color: "#065F46"
          }
        });
      } else {
        toast.error(res.data.message || "Invalid coupon code.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon code.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please enter your name");
    if (!form.phone.trim()) return toast.error("Please enter your phone number");
    if (!form.address.trim()) return toast.error("Please enter your shipping address");

    const token = useAuthStore.getState().token;
    if (!token) return toast.error("Please login to place an order");

    // Perform validation for Card Payment
    if (form.paymentMethod === "Online") {
      if (!cardDetails.name.trim()) return toast.error("Cardholder name is required");
      const cleanNumber = cardDetails.number.replace(/\s+/g, "");
      if (cleanNumber.length !== 16) return toast.error("Card number must be exactly 16 digits");
      
      const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expiryPattern.test(cardDetails.expiry)) {
        return toast.error("Expiry date must be in MM/YY format (e.g. 12/28)");
      }
      
      const [expMonth, expYear] = cardDetails.expiry.split("/").map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        return toast.error("Expiry date cannot be in the past");
      }
      
      if (cardDetails.cvv.length !== 3) return toast.error("CVV must be exactly 3 digits");
      if (!cardDetails.bank) return toast.error("Please select card processing bank");
    }

    // Perform validation for Netbanking
    if (form.paymentMethod === "Net") {
      if (!selectedBank) return toast.error("Please select a bank for net banking payment");
    }

    setIsPlacing(true);

    // If COD, run standard flow
    if (form.paymentMethod === "COD") {
      try {
        const { default: api } = await import("../lib/api");
        const res = await api.post("/orders", {
          shipping_address: `${form.name} | Phone: ${form.phone} | Address: ${form.address} | Method: ${form.paymentMethod}`,
          items: items,
          coupon_code: appliedCoupon ? appliedCoupon.code : null
        });
        setPlacedOrderId(res.data.order.id);
        clear();
        setAppliedCoupon(null);
        setShowCheckout(false);
        setShowSuccess(true);
        toast.success("Order Placed Successfully!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Checkout failed");
      } finally {
        setIsPlacing(false);
      }
      return;
    }

    // Otherwise, execute Razorpay Payment flow
    try {
      const { default: api } = await import("../lib/api");
      
      // Step 1: Create Razorpay Order securely on the backend
      const res = await api.post("/razorpay/order", {
        items: items,
        coupon_code: appliedCoupon ? appliedCoupon.code : null
      });

      const userEmail = useAuthStore.getState().user?.email || "customer@example.com";

      // Step 2: Open Razorpay Popup
      const options = {
        key: res.data.key_id,
        amount: Math.round(discountedTotal * 100),
        currency: "INR",
        name: "BookVault",
        description: "Secure Payment Gateway",
        order_id: res.data.order_id,
        prefill: {
          name: form.name,
          email: userEmail,
          contact: form.phone,
          method: form.paymentMethod === "Online" ? "card" : "netbanking",
        },
        ...(form.paymentMethod === "Net" && selectedBank !== "Razorpay" && getRazorpayBankCode(selectedBank) ? {
          "config": {
            "display": {
              "blocks": {
                "netbanking": {
                  "name": selectedBank,
                  "instruments": [
                    {
                      "method": "netbanking",
                      "banks": [getRazorpayBankCode(selectedBank)]
                    }
                  ]
                }
              },
              "sequence": ["block.netbanking"]
            }
          }
        } : {}),
        handler: async function (response) {
          setIsPlacing(true);
          try {
            // Step 3: Secure Signature capture and order verification
            const verifyRes = await api.post("/razorpay/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              shipping_address: `${form.name} | Phone: ${form.phone} | Address: ${form.address} | Method: ${form.paymentMethod} (${form.paymentMethod === "Online" ? "Card: " + cardDetails.bank : "Bank: " + selectedBank})`,
              items: items,
              coupon_code: appliedCoupon ? appliedCoupon.code : null
            });
            setPlacedOrderId(verifyRes.data.order.id);
            clear();
            setAppliedCoupon(null);
            setShowCheckout(false);
            setShowSuccess(true);
            toast.success("Secured Payment Completed & Order Confirmed! 🎉", {
              style: {
                border: "1px solid #10B981",
                background: "#ECFDF5",
                color: "#065F46"
              }
            });
          } catch (verifyErr) {
            toast.error(verifyErr.response?.data?.message || "Payment verification failed. Please contact support.");
          } finally {
            setIsPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsPlacing(false);
            toast.error("Secured Payment window closed by user.");
          }
        },
        theme: {
          color: "#ff7043"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || "Payment initialization failed. Please try again.");
      setIsPlacing(false);
    }
  };

  if (showSuccess) {
    return (
      <Shell>
        <div className="w-[calc(100%-2rem)] max-w-md mx-auto my-12 p-6 sm:p-8 text-center bg-card rounded-3xl border-2 border-emerald-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 animate-bounce">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-bold text-emerald-500">Order Placed! 🎉</h2>
          <p className="text-muted-foreground mt-2 text-sm">Thank you for your purchase. Your books are on their way!</p>
          
          <div className="my-6 p-4 rounded-xl bg-muted/50 border border-border/80">
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Order Reference ID</div>
            <div className="text-2xl font-mono font-bold text-primary mt-1">BVT-ORD-{placedOrderId}</div>
          </div>

          <div className="space-y-3">
            <Link to="/dashboard/orders" className="block w-full" onClick={() => setShowSuccess(false)}>
              <Button variant="coral" size="lg" className="w-full">
                Track Order inside Dashboard
              </Button>
            </Link>
            <Link to="/books" className="block w-full" onClick={() => setShowSuccess(false)}>
              <Button variant="outline" size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  if (items.length === 0)
    return (
      <Shell>
        <div className="text-center py-20">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="font-display text-3xl mt-4">Your cart is empty</h2>
          <p className="text-muted-foreground mt-2">Find your next great read.</p>
          <Link to="/books" className="inline-block mt-4"><Button variant="coral" size="lg">Browse Books</Button></Link>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <h1 className="font-display text-4xl font-bold mb-8">Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ book, qty }) => (
            <div key={book.id} className="bg-card rounded-xl p-4 flex gap-4 items-center shadow-soft border border-border/40 hover:border-accent/30 transition-all">
              <div className="w-16 h-24 rounded overflow-hidden bg-muted shrink-0">
                <img src={book.cover_image || coverFromIsbn(book.isbn)} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold">{book.title}</h3>
                <p className="text-xs text-muted-foreground">{book.author}</p>
                <div className="text-accent font-semibold mt-1">₹{parseFloat(book.price).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty(book.id, qty - 1)}><Minus className="h-3 w-3" /></Button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty(book.id, qty + 1)}><Plus className="h-3 w-3" /></Button>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(book.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>

        {/* Order Summary / Checkout Steps */}
        <div className="space-y-6">
          {!showCheckout ? (
            <div className="bg-card rounded-xl p-6 shadow-soft h-fit border border-border/40">
              <h3 className="font-display text-xl font-semibold mb-4">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{total().toFixed(2)}</span></div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between"><span>Shipping</span><span className="text-emerald-600 font-medium">Free</span></div>
                
                <div className="border-t pt-2 mt-2 flex justify-between font-display text-xl font-bold">
                  <span>Total</span>
                  <span>₹{discountedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code Input / Applied Coupon Section */}
              <div className="border-t pt-4 mt-4 space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Promo Code</div>
                
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold">{appliedCoupon.code}</div>
                        <div className="text-[10px] opacity-80 leading-none mt-0.5">
                          {appliedCoupon.discount_type === "percent" 
                            ? `${appliedCoupon.discount_value}% Discount Applied`
                            : `₹${appliedCoupon.discount_value} Discount Applied`}
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setAppliedCoupon(null);
                        toast.success("Coupon removed.");
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg transition-all shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Enter code (e.g. BVAULT20)"
                      className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all uppercase font-mono"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-9 font-semibold text-xs border-accent/20 hover:border-accent hover:bg-accent/5"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon}
                    >
                      {validatingCoupon ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <Button variant="coral" size="lg" className="w-full mt-5" onClick={() => {
                const token = useAuthStore.getState().token;
                if (!token) { toast.error("Please login to checkout"); return; }
                setShowCheckout(true);
              }}>Proceed to Checkout</Button>
              <Button variant="ghost" className="w-full mt-2" onClick={clear}>Clear cart</Button>
            </div>
          ) : (
            <form onSubmit={handleCheckoutSubmit} className="bg-card rounded-xl p-6 shadow-soft border border-border/40 space-y-4">
              <h3 className="font-display text-xl font-bold">Shipping & Payment</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Aditya Kumar"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Address</label>
                <textarea
                  rows={3}
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street address, City, State, ZIP code..."
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "COD", label: "COD", desc: "Cash on Delivery" },
                    { id: "Online", label: "Card", desc: "Online / UPI" },
                    { id: "Net", label: "Bank", desc: "Net Banking" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setForm({ ...form, paymentMethod: m.id })}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                        form.paymentMethod === m.id
                          ? "border-accent bg-accent/5 text-accent font-bold"
                          : "border-border hover:border-accent/30 hover:bg-muted"
                      }`}
                    >
                      <span className="text-xs">{m.label}</span>
                      <span className="text-[8px] text-muted-foreground leading-none mt-1">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Secure Inline Card Details Sub-form */}
              {form.paymentMethod === "Online" && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Premium Credit Card Mockup */}
                  <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-white/10 select-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">Credit/Debit Card</span>
                        <span className="text-[10px] font-bold font-mono text-indigo-300 mt-0.5">{cardDetails.bank || "SELECT BANK"}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-black italic tracking-wider text-lg text-white">BookVault</span>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="w-9 h-6.5 rounded bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border border-amber-600/30 opacity-90 relative overflow-hidden">
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 opacity-60">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className="border-[0.5px] border-slate-900/40 rounded-sm" />
                          ))}
                        </div>
                      </div>
                      <svg className="h-4.5 w-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 006.75-6.75v-1.5m-6.75 8.25a8.25 8.25 0 008.25-8.25v-1.5m-8.25 9.75a9.75 9.75 0 009.75-9.75V9m-9.75 11.25a11.25 11.25 0 0011.25-11.25V7.5M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                      </svg>
                    </div>

                    <div className="text-base md:text-lg font-mono tracking-widest font-bold text-center text-slate-100">
                      {cardDetails.number || "•••• •••• •••• ••••"}
                    </div>

                    <div className="flex justify-between items-end text-[10px]">
                      <div className="flex-1 mr-4 truncate">
                        <div className="text-[7px] uppercase tracking-wider text-slate-400 font-semibold">Card Holder</div>
                        <div className="font-semibold tracking-wide truncate uppercase text-slate-200">
                          {cardDetails.name || "YOUR NAME"}
                        </div>
                      </div>
                      <div className="shrink-0 mr-4">
                        <div className="text-[7px] uppercase tracking-wider text-slate-400 font-semibold">Expires</div>
                        <div className="font-mono font-semibold text-slate-200">{cardDetails.expiry || "MM/YY"}</div>
                      </div>
                      <div className="shrink-0">
                        <div className="text-[7px] uppercase tracking-wider text-slate-400 font-semibold">CVV</div>
                        <div className="font-mono font-semibold text-slate-200">{cardDetails.cvv ? "•••" : "•••"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/40">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                        placeholder="As it appears on your card"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 1234 5678"
                          className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                        />
                        <svg className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expiry Date</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={handleCvvChange}
                          placeholder="•••"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Issuer Bank</label>
                      <select
                        value={cardDetails.bank}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, bank: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                      >
                        <option value="">-- Choose Processing Bank --</option>
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="State Bank of India">State Bank of India</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank</option>
                        <option value="Other">Other Bank</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Secure Inline Net Banking Bank Selection Sub-form */}
              {form.paymentMethod === "Net" && (
                <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/40 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Net Banking Bank</label>
                    <div className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                      Choose **Razorpay Gateway** to browse the complete portal, or select a major bank to route directly.
                    </div>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    >
                      <option value="">-- Choose Bank --</option>
                      <option value="Razorpay" className="font-bold text-accent font-sans">Razorpay Gateway Portal (Recommended)</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                    </select>
                  </div>

                  {selectedBank && (
                    <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 flex gap-3 items-center">
                      <div className="h-6 w-6 rounded-full bg-accent/15 flex items-center justify-center text-accent shrink-0">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-primary">Pre-routing payment via {selectedBank === "Razorpay" ? "Razorpay Gateway" : selectedBank}</div>
                        <div className="text-[8px] text-muted-foreground leading-none mt-0.5">Payments are processed securely under Razorpay's sandbox environments.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {appliedCoupon && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    Promo: {appliedCoupon.code}
                  </span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <Button type="submit" variant="coral" size="lg" className="w-full" disabled={isPlacing}>
                  {isPlacing ? "Processing..." : `Place Order (₹${discountedTotal.toFixed(2)})`}
                </Button>
                <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setShowCheckout(false)}>
                  Back to Summary
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Shell>
  );
}

export function AuthorsListPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("../lib/api").then(({ default: api }) => {
      api.get("/authors")
        .then(({ data }) => {
          setAuthors(data || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          toast.error("Failed to load authors database.");
        });
    });
  }, []);

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold">Authors</h1>
        <p className="text-muted-foreground mt-1">Discover and explore books from our premium, curated list of authors.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-card p-6 rounded-2xl text-center shadow-soft border border-border/40 animate-pulse space-y-4">
              <div className="w-28 h-28 rounded-full mx-auto bg-muted" />
              <div className="h-5 w-2/3 mx-auto bg-muted rounded" />
              <div className="h-4 w-1/3 mx-auto bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : authors.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-card rounded-2xl border border-dashed border-border/60">
          No authors found. Please check back later.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {authors.map((a) => (
            <div 
              key={a.id || a.name} 
              className="bg-card p-6 rounded-2xl text-center shadow-soft border border-border/40 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="w-28 h-28 rounded-full mx-auto overflow-hidden shadow-md border-2 border-accent/10 relative shrink-0 bg-muted mb-4">
                <img 
                  src={a.img || `https://i.pravatar.cc/200?u=${encodeURIComponent(a.name)}`} 
                  alt={a.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  onError={(e) => { e.target.src = `https://placehold.co/200?text=${encodeURIComponent(a.name.charAt(0))}`; }}
                />
              </div>
              <h3 className="font-display font-bold text-lg tracking-wide group-hover:text-accent transition-colors">{a.name}</h3>
              <div className="text-sm font-semibold text-accent mt-2 flex items-center justify-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{parseFloat(a.rating).toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
