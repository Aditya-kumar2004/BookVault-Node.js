import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ALL_BOOKS, GENRES, AUTHORS, coverFromIsbn } from "@/data/books";
import { useState, useEffect } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { DollarSign, Users, BookOpen, ShoppingBag, TrendingUp, AlertTriangle, Plus, Search, ShieldAlert, UserCheck, UserX, Trash2, Edit, Ticket, Calendar, Percent } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";

const StatCard = ({ icon: Icon, label, value, delta, i }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-display text-3xl font-bold mt-1">{value}</div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> {delta}
          </div>
        </div>
        <div className="h-11 w-11 rounded-lg gradient-coral text-white flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  </motion.div>
);

const revenueData = [
  { m: "Jan", v: 12400 }, { m: "Feb", v: 14200 }, { m: "Mar", v: 11800 },
  { m: "Apr", v: 18900 }, { m: "May", v: 22100 }, { m: "Jun", v: 24700 },
  { m: "Jul", v: 28900 }, { m: "Aug", v: 32100 },
];
const ordersData = [
  { d: "Mon", o: 42 }, { d: "Tue", o: 58 }, { d: "Wed", o: 71 },
  { d: "Thu", o: 64 }, { d: "Fri", o: 89 }, { d: "Sat", o: 95 }, { d: "Sun", o: 76 },
];
const PIE_COLORS = ["#1B4332", "#F4623A", "#0D1B2A", "#2A9D8F", "#E76F51", "#264653"];

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

export function Overview() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

  const uniqueCustomersCount = new Set(orders.map((o) => o.user?.email || o.shipping_address)).size;

  const genreData = GENRES.map((g) => ({ name: g.name, value: g.count }));

  // Helper to construct dynamic day-of-week orders
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dynamicOrdersData = daysOfWeek.map((day) => {
    const count = orders.filter((o) => {
      const d = new Date(o.created_at);
      return daysOfWeek[d.getDay()] === day;
    }).length;
    return { d: day, o: count || Math.floor(Math.random() * 4) }; // Fallback to random low values if newly set up
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard i={0} icon={DollarSign} label="Revenue" value={`₹${totalRevenue.toFixed(2)}`} delta="+12.4%" />
        <StatCard i={1} icon={ShoppingBag} label="Orders" value={loading ? "..." : totalOrders} delta="+8.1%" />
        <StatCard i={2} icon={Users} label="Customers" value={loading ? "..." : uniqueCustomersCount || 1} delta="+5.2%" />
        <StatCard i={3} icon={BookOpen} label="Books" value={ALL_BOOKS.length} delta="+24" />
        <StatCard i={4} icon={TrendingUp} label="Conversion" value="3.4%" delta="+0.6%" />
        <StatCard i={5} icon={AlertTriangle} label="Low Stock" value="14" delta="-3" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4">By Genre</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={genreData} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {genreData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Orders this week</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dynamicOrdersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="d" /><YAxis /><Tooltip />
            <Bar dataKey="o" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Recent orders</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Loading recent orders...</TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No orders placed yet.</TableCell></TableRow>
              ) : (
                orders.slice(0, 5).map((o) => {
                  const [name] = o.shipping_address ? o.shipping_address.split(" | ") : ["Aditya Kumar"];
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">#ORD-{o.id}</TableCell>
                      <TableCell>{name}</TableCell>
                      <TableCell className="font-bold text-accent">₹{parseFloat(o.total_amount).toFixed(2)}</TableCell>
                      <TableCell><Badge className={`text-[10px] uppercase font-bold ${getStatusColor(o.status)}`}>{o.status}</Badge></TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" /> Low stock alerts
          </h3>
          <ul className="space-y-3">
            {ALL_BOOKS.slice(0, 4).map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{b.title}</span>
                <Badge variant="destructive">{Math.floor(Math.random() * 5) + 1} left</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* -------------- Books admin -------------- */
export function BooksAdmin() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState(10);
  const [pages, setPages] = useState("");
  const [publisher, setPublisher] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDeal, setIsDeal] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchBooks = () => {
    import("../../lib/api").then(({ default: api }) => {
      api.get("/books", { params: { per_page: -1 } })
        .then(({ data }) => {
          setBooks(data.data || []);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load books from server.");
          setLoading(false);
        });
    });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setTitle("");
    setAuthor("");
    setGenre("");
    setIsbn("");
    setPrice("");
    setOriginalPrice("");
    setStock(10);
    setPages("");
    setPublisher("");
    setDescription("");
    setCoverImage("");
    setIsFeatured(false);
    setIsDeal(false);
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setTitle(book.title || "");
    setAuthor(book.author || "");
    setGenre(book.genre || "");
    setIsbn(book.isbn || "");
    setPrice(book.price || "");
    setOriginalPrice(book.original_price || "");
    setStock(book.stock || 0);
    setPages(book.pages || "");
    setPublisher(book.publisher || "");
    setDescription(book.description || "");
    setCoverImage(book.cover_image || "");
    setIsFeatured(!!book.is_featured);
    setIsDeal(!!book.is_deal);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const { default: api } = await import("../../lib/api");
      const { data } = await api.post("/books/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setCoverImage(data.url);
      toast.success("Cover image uploaded successfully! 📸");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !genre.trim() || !price) {
      return toast.error("Please fill in all required fields.");
    }

    setSubmitting(true);
    try {
      const { default: api } = await import("../../lib/api");
      const payload = {
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        isbn: isbn.trim() || null,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock),
        pages: pages ? parseInt(pages) : null,
        publisher: publisher.trim() || null,
        description: description.trim() || null,
        cover_image: coverImage || null,
        is_featured: !!isFeatured,
        is_deal: !!isDeal,
      };

      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, payload);
        toast.success("Book updated successfully! 🎉");
      } else {
        await api.post("/books", payload);
        toast.success("Book added successfully! 🎉");
      }
      setIsModalOpen(false);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save book.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const { default: api } = await import("../../lib/api");
      await api.delete(`/books/${id}`);
      toast.success("Book deleted successfully! 🗑️");
      fetchBooks();
    } catch (err) {
      toast.error("Failed to delete book.");
    }
  };

  const filtered = books.filter((b) =>
    (b.title || "").toLowerCase().includes(q.toLowerCase()) ||
    (b.author || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Books</h1>
          <p className="text-muted-foreground">Manage your dynamic literary catalogue.</p>
        </div>
        <Button variant="coral" onClick={openAddModal} className="font-bold flex items-center gap-1.5 shadow-lg shadow-coral/10">
          <Plus className="h-4 w-4" /> Add new book
        </Button>
      </div>

      <Card className="p-4 flex gap-4 items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or author..." className="pl-9" />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground animate-pulse">
                  Loading catalogue database...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No books found. Try adding a new masterpiece!
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="w-10 h-14 rounded overflow-hidden bg-muted border border-border/30">
                      <img
                        src={b.cover_image || coverFromIsbn(b.isbn)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = `https://placehold.co/100x150?text=Book`; }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>{b.author}</TableCell>
                  <TableCell>{b.genre}</TableCell>
                  <TableCell className="font-mono text-xs">{b.isbn || "N/A"}</TableCell>
                  <TableCell className="font-semibold text-accent">₹{parseFloat(b.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={b.stock <= 10 ? "text-red-500 font-bold" : ""}>
                      {b.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={b.stock > 10 ? "bg-emerald-500 text-white font-bold" : "bg-red-500 text-white font-bold"}>
                      {b.stock > 10 ? "Active" : "Low"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(b)} className="h-8 hover:bg-accent/10 hover:text-accent">
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)} className="h-8 text-red-500 hover:bg-red-500/10 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* custom add/edit modal overlay */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold flex items-center gap-2">
              {editingBook ? "✏️ Edit Book Record" : "📖 Add New Masterpiece"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the physical and monetary metadata parameters for this collection catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Book Title <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Midnight Library"
                  className="rounded-xl animate-fadeIn"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Author Name <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Matt Haig"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Genre <span className="text-red-500">*</span></Label>
                <select
                  required
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                >
                  <option value="">-- Select Genre --</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Nonfiction">Nonfiction</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Romance">Romance</option>
                  <option value="Biography">Biography</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ISBN (SKU)</Label>
                <Input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="13-digit code"
                  className="rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock Volume <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price (₹) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 14.99"
                  className="rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Price (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="Before sale discount"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Page Count</Label>
                <Input
                  type="number"
                  min="1"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="e.g. 304"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Publisher</Label>
                <Input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="e.g. HarperCollins"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Custom Book Cover Image Uploader & Preview */}
            <div className="space-y-2 border border-border/40 p-4 rounded-xl bg-muted/20">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Book Cover Image</Label>
              <div className="flex gap-4 items-center">
                <div className="h-20 w-14 rounded overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center text-[10px] text-muted-foreground relative">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>No image</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="book-cover-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => document.getElementById("book-cover-upload").click()}
                      className="rounded-xl border-accent/20 hover:border-accent hover:bg-accent/5 font-semibold text-xs h-9 px-4 shrink-0"
                    >
                      {uploading ? "Uploading..." : "Upload Cover Image 📸"}
                    </Button>
                    <span className="text-[10px] text-muted-foreground">Accepts JPEG, PNG, WEBP (Max 2MB)</span>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Or Image URL Address</Label>
                    <Input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="Paste image web link directly..."
                      className="h-8 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Book Description / Synopsis</Label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief, engaging summary of the book..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
              />
            </div>

            <div className="flex gap-6 py-2 border-t border-border/40 mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-coral focus:ring-coral h-4 w-4"
                />
                <Label htmlFor="chk-featured" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">Feature on Main Slider</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-deal"
                  checked={isDeal}
                  onChange={(e) => setIsDeal(e.target.checked)}
                  className="rounded text-coral focus:ring-coral h-4 w-4"
                />
                <Label htmlFor="chk-deal" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">Mark as Daily Deal</Label>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="coral"
                disabled={submitting}
                className="rounded-xl text-xs font-bold shadow-lg shadow-coral/10"
              >
                {submitting ? "Saving..." : editingBook ? "Update Masterpiece" : "Publish Book"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------- Authors -------------- */
export function AuthorsAdmin() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [img, setImg] = useState("");
  const [rating, setRating] = useState(4.5);
  const [submitting, setSubmitting] = useState(false);

  const fetchAuthors = async () => {
    try {
      const { default: api } = await import("../../lib/api");
      const { data } = await api.get("/authors");
      setAuthors(data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load authors database");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const openAddModal = () => {
    setEditingAuthor(null);
    setName("");
    setImg("");
    setRating(4.5);
    setIsModalOpen(true);
  };

  const openEditModal = (author) => {
    setEditingAuthor(author);
    setName(author.name);
    setImg(author.img || "");
    setRating(author.rating || 4.5);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Author name is required");

    setSubmitting(true);
    try {
      const { default: api } = await import("../../lib/api");
      const payload = {
        name: name.trim(),
        img: img.trim() || null,
        rating: parseFloat(rating)
      };

      if (editingAuthor) {
        const { data } = await api.put(`/authors/${editingAuthor.id}`, payload);
        toast.success(data.message || "Author updated successfully! 🎉");
      } else {
        const { data } = await api.post("/authors", payload);
        toast.success(data.message || "Author added successfully! 🎉");
      }
      setIsModalOpen(false);
      fetchAuthors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save author");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this author?")) return;
    try {
      const { default: api } = await import("../../lib/api");
      const { data } = await api.delete(`/authors/${id}`);
      toast.success(data.message || "Author deleted successfully! 🗑️");
      fetchAuthors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete author");
    }
  };

  const filteredAuthors = authors.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Authors</h1>
          <p className="text-muted-foreground">Manage dynamic authors details, rating points, and custom profile photo references.</p>
        </div>
        <Button variant="coral" onClick={openAddModal} className="font-bold flex items-center gap-1.5 shadow-lg shadow-coral/10">
          <Plus className="h-4 w-4" /> Add Author
        </Button>
      </div>

      <Card className="p-4 flex gap-4 items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search authors..."
            className="pl-9"
          />
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Loading authors database...</div>
      ) : filteredAuthors.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-card rounded-2xl border border-dashed border-border/60">
          No authors found. Try adding a new author campaign!
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredAuthors.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-5 text-center flex flex-col items-center justify-between h-full border border-border/40 hover:shadow-lg hover:border-accent/30 transition-all group relative overflow-hidden">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(a)}
                    className="p-1 rounded bg-muted hover:bg-accent/15 text-muted-foreground hover:text-accent transition-all"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1 rounded bg-muted hover:bg-red-500/15 text-muted-foreground hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-3 w-full">
                  <div className="h-24 w-24 rounded-full overflow-hidden shadow-md border-2 border-accent/10 relative mx-auto shrink-0 bg-muted">
                    <img
                      src={a.img || `https://i.pravatar.cc/200?u=${encodeURIComponent(a.name)}`}
                      alt={a.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      onError={(e) => { e.target.src = `https://placehold.co/200?text=${encodeURIComponent(a.name.charAt(0))}`; }}
                    />
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm tracking-wide line-clamp-1">{a.name}</div>
                    <div className="text-xs text-accent font-medium mt-1 flex items-center justify-center gap-1">
                      <span className="text-amber-500">★</span> {parseFloat(a.rating).toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold"
                    onClick={() => openEditModal(a)}
                  >
                    Edit Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Custom dialog overlay */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold flex items-center gap-2">
              {editingAuthor ? "✏️ Edit Author Details" : "✍️ Add New Author"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define profile parameters, image URL configurations, and ratings for custom displaying.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Author Name</Label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Timothy Snyder"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile Image Link (URL)</Label>
              <Input
                type="text"
                value={img}
                onChange={(e) => setImg(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/... or leave blank for auto"
                className="rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                Link any web image address. Leaves blank to auto-generate a sleek placeholder icon.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reader Rating Score</Label>
                <span className="text-xs font-bold text-accent font-mono">{parseFloat(rating).toFixed(1)} / 5.0</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full accent-coral h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="coral"
                disabled={submitting}
                className="rounded-xl text-xs font-bold shadow-lg shadow-coral/10"
              >
                {submitting ? "Saving..." : editingAuthor ? "Update Details" : "Add Author"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------- Genres -------------- */
export function GenresAdmin() {
  const [genres, setGenres] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fields state
  const [newGenreName, setNewGenreName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#1B4332");
  const [activeGenre, setActiveGenre] = useState(null);

  const palette = [
    "#1B4332", "#7C3AED", "#0F766E", "#7F1D1D", "#EC4899", "#0D1B2A",
    "#D97706", "#2563EB", "#4F46E5", "#059669", "#DC2626", "#DB2777"
  ];

  const fetchInventory = () => {
    setLoading(true);
    import("../../lib/api").then(({ default: api }) => {
      api.get("/books", { params: { per_page: -1 } })
        .then(({ data }) => {
          const fetchedBooks = data.data || [];
          setBooks(fetchedBooks);

          // Group books by genre and count them dynamically
          const counts = {};
          fetchedBooks.forEach(b => {
            if (b.genre) {
              counts[b.genre] = (counts[b.genre] || 0) + 1;
            }
          });

          // Combine hardcoded GENRES with dynamic genres found in database
          const combined = [];
          const seen = new Set();

          // 1. First add genres from our predefined GENRES list
          GENRES.forEach((g, i) => {
            seen.add(g.name.toLowerCase());
            combined.push({
              name: g.name,
              count: counts[g.name] || 0, // dynamic count
              color: palette[i % palette.length]
            });
          });

          // 2. Add any other dynamic genres found in the books collection
          Object.keys(counts).forEach(genreName => {
            if (!seen.has(genreName.toLowerCase())) {
              seen.add(genreName.toLowerCase());
              combined.push({
                name: genreName,
                count: counts[genreName],
                color: palette[combined.length % palette.length]
              });
            }
          });

          setGenres(combined);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load genres:", err);
          toast.error("Failed to sync genres with active database.");
          setLoading(false);
        });
    });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddGenre = () => {
    if (!newGenreName.trim()) {
      toast.error("Please enter a genre name");
      return;
    }

    // Check if it already exists
    const exists = genres.find(g => g.name.toLowerCase() === newGenreName.trim().toLowerCase());
    if (exists) {
      toast.error("This genre already exists");
      return;
    }

    const newGenreObj = {
      name: newGenreName.trim(),
      count: 0,
      color: selectedColor
    };

    setGenres(prev => [...prev, newGenreObj]);
    toast.success(`Genre "${newGenreName}" registered successfully! 🎉`);

    setNewGenreName("");
    setAddOpen(false);
  };

  const handleEditGenre = () => {
    if (!newGenreName.trim()) {
      toast.error("Please enter a genre name");
      return;
    }

    const oldName = activeGenre.name;
    const newName = newGenreName.trim();

    if (oldName !== newName && activeGenre.count > 0) {
      toast.info("Updating books with the new genre name on server...");

      const booksToUpdate = books.filter(b => b.genre.toLowerCase() === oldName.toLowerCase());

      import("../../lib/api").then(({ default: api }) => {
        const promises = booksToUpdate.map(b =>
          api.put(`/books/${b.id}`, { genre: newName })
        );

        Promise.all(promises)
          .then(() => {
            toast.success(`Updated ${promises.length} books to the new genre "${newName}"!`);
            fetchInventory();
          })
          .catch((err) => {
            console.error("Failed to bulk update book genres:", err);
            toast.error("Some book genre updates failed on the server.");
            fetchInventory();
          });
      });
    } else {
      setGenres(prev => prev.map(g => g.name === oldName ? { ...g, name: newName, color: selectedColor } : g));
      toast.success("Genre settings updated successfully");
    }

    setEditOpen(false);
    setActiveGenre(null);
    setNewGenreName("");
  };

  const handleDeleteGenre = () => {
    const oldName = activeGenre.name;

    if (activeGenre.count > 0) {
      toast.error(`Cannot delete genre "${oldName}" because it has ${activeGenre.count} books assigned to it.`);
      setDeleteOpen(false);
      return;
    }

    setGenres(prev => prev.filter(g => g.name !== oldName));
    toast.success(`Genre "${oldName}" removed successfully.`);
    setDeleteOpen(false);
    setActiveGenre(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold">Genres Catalog</h1>
          <p className="text-muted-foreground">Monitor and manage book genres and categories dynamically.</p>
        </div>
        <Button variant="coral" onClick={() => { setSelectedColor(palette[genres.length % palette.length]); setAddOpen(true); }} className="font-bold flex items-center gap-1.5 shadow-lg shadow-coral/10">
          <Plus className="h-4 w-4" /> Add Genre
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Live Books Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Synchronizing genres with active database...
                </TableCell>
              </TableRow>
            ) : genres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No genres found. Add some above.
                </TableCell>
              </TableRow>
            ) : (
              genres.map((g) => (
                <TableRow key={g.name} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="w-8 h-8 rounded-lg shadow-inner border border-black/10" style={{ background: g.color }} />
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">{g.name}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${g.count > 0 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {g.count} {g.count === 1 ? "book" : "books"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setActiveGenre(g); setNewGenreName(g.name); setSelectedColor(g.color); setEditOpen(true); }} className="flex items-center gap-1">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setActiveGenre(g); setDeleteOpen(true); }} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 flex items-center gap-1">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ADD GENRE DIALOG */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Genre</DialogTitle>
            <DialogDescription>Create a new book genre for your BookVault catalog.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="genre-name">Genre Name</Label>
              <Input id="genre-name" placeholder="e.g., Biography, History..." value={newGenreName} onChange={e => setNewGenreName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Theme Color</Label>
              <div className="flex gap-2.5 flex-wrap pt-1.5">
                {palette.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-lg shadow transition ${selectedColor === c ? "ring-2 ring-accent ring-offset-2 scale-110" : "hover:scale-105"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="coral" onClick={handleAddGenre}>Save Genre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT GENRE DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Genre Settings</DialogTitle>
            <DialogDescription>Modify settings for "{activeGenre?.name}". Renaming will bulk-update all books assigned to this genre.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-genre-name">Genre Name</Label>
              <Input id="edit-genre-name" placeholder="e.g., Biography, History..." value={newGenreName} onChange={e => setNewGenreName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Theme Color</Label>
              <div className="flex gap-2.5 flex-wrap pt-1.5">
                {palette.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-lg shadow transition ${selectedColor === c ? "ring-2 ring-accent ring-offset-2 scale-110" : "hover:scale-105"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="coral" onClick={handleEditGenre}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-1.5"><ShieldAlert className="h-5 w-5" /> Remove Genre</DialogTitle>
            <DialogDescription>Are you sure you want to remove the genre "{activeGenre?.name}"? This action is permanent.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteGenre}>Delete Genre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------- Generic placeholder admin pages -------------- */
export function InventoryAdmin() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = () => {
    import("../../lib/api").then(({ default: api }) => {
      api.get("/books", { params: { per_page: -1 } })
        .then(({ data }) => {
          setBooks(data.data || []);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load inventory from server.");
          setLoading(false);
        });
    });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleStockChange = (bookId, newStock) => {
    if (newStock < 0) return;

    // Optimistic update
    const prevBooks = [...books];
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, stock: newStock } : b));

    import("../../lib/api").then(({ default: api }) => {
      api.put(`/books/${bookId}`, { stock: newStock })
        .then(() => {
          toast.success("Stock updated successfully");
        })
        .catch((err) => {
          setBooks(prevBooks);
          toast.error(err.response?.data?.message || "Failed to update stock");
        });
    });
  };

  const exportToCSV = () => {
    if (books.length === 0) {
      toast.error("No inventory data to export.");
      return;
    }

    const headers = ["Title", "SKU/ISBN", "Stock", "Threshold", "Genre", "Price"];
    const csvRows = [headers.join(",")];

    books.forEach(b => {
      const title = `"${(b.title || "").replace(/"/g, '""')}"`;
      const isbn = `"${(b.isbn || "").replace(/"/g, '""')}"`;
      const stock = b.stock;
      const threshold = 10;
      const genre = `"${(b.genre || "").replace(/"/g, '""')}"`;
      const price = b.price;
      csvRows.push([title, isbn, stock, threshold, genre, price].join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully! 📊");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Monitor and manage book stock volumes.</p>
        </div>
        <Button variant="coral" onClick={exportToCSV} className="font-bold flex items-center gap-1.5 shadow-lg shadow-coral/10">Export CSV</Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading inventory details...
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No books found in inventory.
                </TableCell>
              </TableRow>
            ) : (
              books.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell className="font-mono text-xs">{b.isbn || "N/A"}</TableCell>
                  <TableCell>
                    <span className={b.stock <= 10 ? "text-red-500 font-bold" : ""}>
                      {b.stock}
                    </span>
                  </TableCell>
                  <TableCell>10</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleStockChange(b.id, b.stock - 1)}
                      >
                        −
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleStockChange(b.id, b.stock + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
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

export function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const getCoverUrl = (book) => {
    if (!book) return "https://placehold.co/40x56/1a1a2e/fff?text=Book";
    if (book.cover_image) {
      if (book.cover_image.startsWith("http") || book.cover_image.startsWith("data:")) {
        return book.cover_image;
      }
      const path = book.cover_image.startsWith("/") ? book.cover_image : `/${book.cover_image}`;
      return `http://localhost:8000${path}`;
    }
    return `https://placehold.co/40x56/1a1a2e/fff?text=Book`;
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { default: api } = await import("../../lib/api");
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus.toUpperCase()}! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold">Manage Orders</h1>
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Manage Orders</h1>
        <p className="text-muted-foreground">Monitor and manage customer shipments, payments, and delivery statuses.</p>
      </div>

      <Card className="overflow-hidden border border-border/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const isActive = activeOrderId === o.id;
              const totalItems = o.items ? o.items.reduce((sum, i) => sum + i.quantity, 0) : 0;
              const [name, phone, address, method] = o.shipping_address ? o.shipping_address.split(" | ") : ["Aditya Kumar", "+91 98765 43210", "Default Address", "Method: COD"];

              return (
                <>
                  <TableRow key={o.id} className="hover:bg-muted/30 transition-all">
                    <TableCell className="font-mono font-bold text-xs">BVT-ORD-{o.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{o.user?.name || name}</div>
                      <div className="text-xs text-muted-foreground">{o.user?.email || "No Email"}</div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-semibold">{totalItems} book{totalItems !== 1 ? "s" : ""}</span>
                        <div className="flex flex-col gap-1 max-w-[220px]">
                          {o.items && o.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 p-1 rounded bg-muted/40 border border-border/20">
                              <div className="w-5 h-7 rounded overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={getCoverUrl(item.book)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = "https://placehold.co/40x56/1a1a2e/fff?text=Book"; }}
                                />
                              </div>
                              <span className="text-[11px] font-bold truncate max-w-[170px]" title={item.book?.title}>
                                {item.book?.title || "Unknown Book"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-accent">₹{parseFloat(o.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(o.status)}>{o.status.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={isActive ? "coral" : "outline"}
                        size="sm"
                        onClick={() => setActiveOrderId(isActive ? null : o.id)}
                      >
                        {isActive ? "Hide Details" : "Manage"}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Expandable Order Details Panel */}
                  {isActive && (
                    <TableRow key={`details-${o.id}`} className="bg-muted/10">
                      <TableCell colSpan={6} className="p-6">
                        <div className="grid md:grid-cols-2 gap-6 bg-card border rounded-2xl p-5 shadow-inner">
                          {/* Left Column: Shipment & Delivery Info */}
                          <div className="space-y-4">
                            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">Recipient Details</h4>
                            <div className="text-sm space-y-1.5 p-3 bg-muted/40 rounded-xl">
                              <div><b>Full Name:</b> {name}</div>
                              <div><b>Phone:</b> {phone ? phone.replace("Phone: ", "") : ""}</div>
                              <div><b>Full Address:</b> {address ? address.replace("Address: ", "") : ""}</div>
                              <div><b>Payment Method:</b> <Badge variant="secondary" className="ml-1 text-[10px]">{method ? method.replace("Method: ", "") : "COD"}</Badge></div>
                            </div>

                            {/* Status Changer dropdown */}
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Update Delivery Status</label>
                              <div className="flex gap-2">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                  className="rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-foreground"
                                >
                                  <option value="pending">Pending (Confirmed)</option>
                                  <option value="processing">Processing (Packed)</option>
                                  <option value="shipped">Shipped (On the Way)</option>
                                  <option value="delivered">Delivered (Completed)</option>
                                  <option value="cancelled">Cancelled (Refunded)</option>
                                </select>
                                <Button size="sm" variant="outline" onClick={() => downloadInvoicePDF(o)}>Print Invoice</Button>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Ordered items list */}
                          <div className="space-y-3">
                            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">Order Items List</h4>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {o.items && o.items.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center p-2 rounded-xl bg-muted/30 border border-border/40">
                                  <div className="w-10 h-14 bg-muted rounded overflow-hidden shadow">
                                    <img
                                      src={getCoverUrl(item.book)}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.src = "https://placehold.co/40x56/1a1a2e/fff?text=Book"; }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{item.book?.title}</div>
                                    <div className="text-xs text-muted-foreground">by {item.book?.author}</div>
                                    <div className="text-xs text-accent font-medium mt-1">₹{parseFloat(item.unit_price).toFixed(2)} x {item.quantity}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("../../lib/api").then(({ default: api }) => {
      api.get("/users")
        .then(({ data }) => {
          setUsers(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    });
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const { default: api } = await import("../../lib/api");
      const { data } = await api.put(`/users/${id}/toggle-status`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: data.user.status } : u))
      );
      toast.success(data.message || `User status updated successfully! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user status");
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active" || !u.status).length;
  const bannedUsers = users.filter((u) => u.status === "Banned").length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user roles, ban statuses, and view user metrics in real time.</p>
      </div>

      {/* Dynamic Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-5 border border-border/40 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Users</div>
                <div className="font-display text-3xl font-bold mt-1">{loading ? "..." : totalUsers}</div>
                <div className="text-xs text-muted-foreground mt-1">Registered accounts</div>
              </div>
              <div className="h-12 w-12 rounded-xl gradient-coral text-white flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 border border-border/40 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Active Users</div>
                <div className="font-display text-3xl font-bold mt-1 text-emerald-600">{loading ? "..." : activeUsers}</div>
                <div className="text-xs text-emerald-600/80 mt-1">Allowed access</div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 border border-border/40 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Banned Users</div>
                <div className="font-display text-3xl font-bold mt-1 text-red-600">{loading ? "..." : bannedUsers}</div>
                <div className="text-xs text-red-600/80 mt-1">Blocked access</div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/10">
                <UserX className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 border border-border/40 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Administrators</div>
                <div className="font-display text-3xl font-bold mt-1 text-navy">{loading ? "..." : adminUsers}</div>
                <div className="text-xs text-muted-foreground mt-1">With admin privileges</div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-navy text-white flex items-center justify-center shadow-lg shadow-navy-500/10">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card className="overflow-hidden border border-border/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const statusStr = u.status || "Active";
                return (
                  <TableRow key={u.id || u.email} className="hover:bg-muted/30 transition-all">
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStr === "Active" ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-red-500 text-white hover:bg-red-600"}>
                        {statusStr}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(u.id)}
                        className="hover:bg-accent/80 font-semibold"
                      >
                        Toggle Status
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function ReviewsAdmin() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Reviews</h1>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Book</TableHead><TableHead>User</TableHead><TableHead>Rating</TableHead><TableHead>Excerpt</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {ALL_BOOKS.slice(0, 5).map((b, i) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.title}</TableCell>
                <TableCell>User{i + 1}</TableCell>
                <TableCell>★ {b.rating}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">A captivating read.</TableCell>
                <TableCell><div className="flex gap-1">
                  <Button variant="outline" size="sm">Approve</Button>
                  <Button variant="ghost" size="sm">Delete</Button>
                </div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function ActivityAdmin() {
  const events = [
    { who: "Lena P.", action: "added book", target: "The Starless Sea", when: "2m ago" },
    { who: "Marco D.", action: "placed order", target: "#1042", when: "8m ago" },
    { who: "Aisha K.", action: "left review", target: "The Alchemist", when: "23m ago" },
    { who: "System", action: "low stock", target: "We Were Liars", when: "1h ago" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Activity</h1>
      <Card className="p-6">
        <ul className="space-y-5 relative before:absolute before:left-2 before:top-0 before:bottom-0 before:w-px before:bg-border">
          {events.map((e, i) => (
            <li key={i} className="pl-8 relative">
              <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-accent ring-4 ring-background" />
              <div className="text-sm"><b>{e.who}</b> {e.action} <span className="text-muted-foreground">{e.target}</span></div>
              <div className="text-xs text-muted-foreground">{e.when}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function CouponsAdmin() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [isUnlimitedUses, setIsUnlimitedUses] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const { default: api } = await import("../../lib/api");
      const { data } = await api.get("/coupons");
      setCoupons(data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load coupons");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setExpiryDate("");
    setMaxUses("");
    setIsUnlimitedUses(true);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value);
    setExpiryDate(coupon.expiry_date || "");
    setMaxUses(coupon.max_uses || "");
    setIsUnlimitedUses(coupon.max_uses === null);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { default: api } = await import("../../lib/api");
      const payload = {
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        expiry_date: expiryDate ? expiryDate : null,
        max_uses: isUnlimitedUses ? null : (maxUses ? parseInt(maxUses) : null),
      };

      if (editingCoupon) {
        const { data } = await api.put(`/coupons/${editingCoupon.id}`, payload);
        toast.success(data.message || "Coupon updated successfully! ✏️");
        setCoupons((prev) =>
          prev.map((c) => (c.id === editingCoupon.id ? data.coupon : c))
        );
      } else {
        const { data } = await api.post("/coupons", payload);
        toast.success(data.message || "Coupon created successfully! 🎉");
        setCoupons((prev) => [...prev, data.coupon]);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id, couponCode) => {
    if (!confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return;

    try {
      const { default: api } = await import("../../lib/api");
      await api.delete(`/coupons/${id}`);
      toast.success(`Coupon "${couponCode}" deleted successfully! 🗑️`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  const totalCoupons = coupons.length;
  const totalUses = coupons.reduce((sum, c) => sum + (c.uses_count || 0), 0);
  const activeCoupons = coupons.filter((c) => {
    if (!c.expiry_date) return true;
    return new Date(c.expiry_date) >= new Date();
  }).length;
  const avgDiscount = totalCoupons > 0
    ? (coupons.reduce((sum, c) => sum + parseFloat(c.discount_value), 0) / totalCoupons).toFixed(1)
    : "0.0";

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Manage active discount codes, promotions, and usage rates.</p>
        </div>
        <Button variant="coral" onClick={openAddModal} className="shadow-lg shadow-coral-500/10">
          <Plus className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      {/* Dynamic Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-5 border border-border/40 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Coupons</div>
                <div className="font-display text-3xl font-bold mt-1">{loading ? "..." : totalCoupons}</div>
                <div className="text-xs text-muted-foreground mt-1">Generated campaigns</div>
              </div>
              <div className="h-12 w-12 rounded-xl gradient-coral text-white flex items-center justify-center shadow-lg shadow-coral-500/10">
                <Ticket className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 border border-border/40 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Uses</div>
                <div className="font-display text-3xl font-bold mt-1 text-emerald-600">{loading ? "..." : totalUses}</div>
                <div className="text-xs text-emerald-600/80 mt-1">Redeemed by shoppers</div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 border border-border/40 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Active Campaigns</div>
                <div className="font-display text-3xl font-bold mt-1 text-indigo-600">{loading ? "..." : activeCoupons}</div>
                <div className="text-xs text-indigo-600/80 mt-1">Currently redeemable</div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 border border-border/40 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Avg Value</div>
                <div className="font-display text-3xl font-bold mt-1 text-navy">{loading ? "..." : avgDiscount}</div>
                <div className="text-xs text-muted-foreground mt-1">Nominal discount value</div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-navy text-white flex items-center justify-center shadow-lg shadow-navy-500/10">
                <Percent className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Search Filter Box */}
      <Card className="p-4 border border-border/40 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupons by code name..."
            className="pl-9"
          />
        </div>
      </Card>

      {/* Table List View */}
      <Card className="overflow-hidden border border-border/40 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coupon Code</TableHead>
              <TableHead>Discount Value</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Usage Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading coupons from database...
                </TableCell>
              </TableRow>
            ) : filteredCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No coupons found. Click "Add Coupon" to create one.
                </TableCell>
              </TableRow>
            ) : (
              filteredCoupons.map((c) => {
                const uses = c.uses_count || 0;
                const max = c.max_uses;

                return (
                  <TableRow key={c.id || c.code} className="hover:bg-muted/30 transition-all duration-200">
                    <TableCell className="py-4 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shadow-inner">
                          <Ticket className="h-4 w-4" />
                        </div>
                        <span className="font-mono font-bold text-sm tracking-wider uppercase bg-muted px-2.5 py-1 rounded-md border border-border/40">
                          {c.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={`px-2.5 py-1 font-bold ${c.discount_type === "percent" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-indigo-500 hover:bg-indigo-600 text-white"}`}>
                        {c.discount_type === "percent" ? `${parseFloat(c.discount_value)}%` : `₹${parseFloat(c.discount_value)}`}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      {(() => {
                        if (!c.expiry_date) {
                          return <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium">Never Expires</Badge>;
                        }
                        const exp = new Date(c.expiry_date);
                        const isExpired = exp < new Date();
                        return (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Calendar className={`h-4 w-4 ${isExpired ? "text-red-500" : "text-muted-foreground"}`} />
                            <span className={isExpired ? "text-red-600 font-semibold line-through" : "text-foreground font-medium"}>
                              {c.expiry_date}
                            </span>
                            {isExpired && <Badge variant="destructive" className="text-[10px] uppercase px-1 py-0 font-bold ml-1">Expired</Badge>}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="py-4">
                      {(() => {
                        if (max === null) {
                          return (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-emerald-600">{uses}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="font-bold text-lg text-slate-400">∞</span>
                              <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-600 bg-emerald-50/50">Unlimited</Badge>
                            </div>
                          );
                        }
                        const percent = Math.min(100, Math.round((uses / max) * 100));
                        return (
                          <div className="space-y-1.5 max-w-[150px]">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-foreground">{uses} / {max}</span>
                              <span className={percent >= 90 ? "text-red-500" : "text-muted-foreground"}>{percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${percent >= 90 ? "bg-red-500" : (percent >= 50 ? "bg-amber-500" : "bg-accent")}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(c)}
                          className="h-8 px-2.5 text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-lg"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="h-8 px-2.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* State Controlled Dialog Modal Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] border-border/60 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              <Ticket className="h-5 w-5 text-accent" />
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Configure details for your promotional coupon code below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCoupon} className="space-y-4 pt-2">
            {/* Code Field */}
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Coupon Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="e.g. GET20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="uppercase font-mono font-bold tracking-widest text-sm focus-visible:ring-accent"
                required
              />
            </div>

            {/* Discount Type Toggle Buttons */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discount Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={discountType === "percent" ? "coral" : "outline"}
                  onClick={() => setDiscountType("percent")}
                  className="w-full font-semibold h-9"
                >
                  <Percent className="mr-2 h-4 w-4" /> Percentage
                </Button>
                <Button
                  type="button"
                  variant={discountType === "fixed" ? "coral" : "outline"}
                  onClick={() => setDiscountType("fixed")}
                  className="w-full font-semibold h-9"
                >
                  <DollarSign className="mr-2 h-4 w-4" /> Fixed Amount
                </Button>
              </div>
            </div>

            {/* Value Field */}
            <div className="space-y-1.5">
              <Label htmlFor="discountValue" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Discount Value {discountType === "percent" ? "(%)" : "(₹)"} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="discountValue"
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder={discountType === "percent" ? "20" : "150"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="pr-8 focus-visible:ring-accent font-semibold"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  {discountType === "percent" ? "%" : "₹"}
                </div>
              </div>
            </div>

            {/* Expiry Date selector */}
            <div className="space-y-1.5">
              <Label htmlFor="expiryDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Expiry Date (Optional)
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full focus-visible:ring-accent font-medium text-sm"
              />
            </div>

            {/* Max Uses Config */}
            <div className="space-y-3 p-3 bg-muted/40 border border-border/40 rounded-xl">
              <div className="flex items-center justify-between">
                <Label htmlFor="isUnlimited" className="font-semibold text-sm cursor-pointer select-none">
                  Unlimited Usage
                </Label>
                <input
                  id="isUnlimited"
                  type="checkbox"
                  checked={isUnlimitedUses}
                  onChange={(e) => setIsUnlimitedUses(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent accent-emerald-600 cursor-pointer"
                />
              </div>

              {!isUnlimitedUses && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1.5 pt-2"
                >
                  <Label htmlFor="maxUses" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Max Uses Limit <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="focus-visible:ring-accent font-semibold"
                    required={!isUnlimitedUses}
                  />
                </motion.div>
              )}
            </div>

            {/* Dialog Footer Actions */}
            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-9">
                Cancel
              </Button>
              <Button type="submit" variant="coral" disabled={submitting} className="h-9 shadow-md shadow-coral-500/10">
                {submitting ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminSettings() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold">Store Settings</h1>
      <Card className="p-6 space-y-4">
        <div><Label>Store name</Label><Input defaultValue="BookVault" /></div>
        <div><Label>Contact email</Label><Input defaultValue="support@bookvault.io" /></div>
        <div><Label>Google OAuth Client ID</Label><Input placeholder="xxx.apps.googleusercontent.com" /></div>
        <Button variant="coral">Save</Button>
      </Card>
    </div>
  );
}
