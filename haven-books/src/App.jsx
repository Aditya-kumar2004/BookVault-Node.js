import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index.jsx";
import NotFound from "./pages/NotFound.jsx";
import { LoginPage, RegisterPage } from "./pages/Auth";
import GoogleCallback from "./pages/GoogleCallback";
import { Browse, BookDetail, CartPage, AuthorsListPage } from "./pages/Shop";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import {
  DashboardHome, Library, WishlistPage, Orders, Reviews, SettingsPage,
} from "./pages/dashboard/Pages";
import AdminLayout from "./pages/admin/AdminLayout";
import {
  Overview, BooksAdmin, AuthorsAdmin, GenresAdmin, InventoryAdmin,
  OrdersAdmin, UsersAdmin, ReviewsAdmin, ActivityAdmin, CouponsAdmin, AdminSettings,
} from "./pages/admin/Pages";
import { useAuthStore } from "./stores";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Sonner position="top-right" toastOptions={{ style: { background: "hsl(var(--card))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" } }} />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/books" element={<Browse />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/categories" element={<Browse />} />
        <Route path="/categories/:slug" element={<Browse />} />
        <Route path="/deals" element={<Browse />} />
        <Route path="/authors" element={<AuthorsListPage />} />
        <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/wishlist" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<WishlistPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/google/success" element={<GoogleCallback />} />

        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="library" element={<Library />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<Overview />} />
          <Route path="books" element={<BooksAdmin />} />
          <Route path="authors" element={<AuthorsAdmin />} />
          <Route path="genres" element={<GenresAdmin />} />
          <Route path="inventory" element={<InventoryAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="reviews" element={<ReviewsAdmin />} />
          <Route path="activity" element={<ActivityAdmin />} />
          <Route path="coupons" element={<CouponsAdmin />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
