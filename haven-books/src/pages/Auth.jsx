import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { BOOKS, coverFromIsbn } from "@/data/books";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.6 6.5 29 4.5 24 4.5c-7.4 0-13.7 4.1-17.7 10.2z" />
    <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-5c-1.9 1.3-4.3 2-6.9 2-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.9 39.3 16.4 43.5 24 43.5z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.4 5.6l6 5C40.5 35.4 43.5 30.2 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);

const QUOTES = [
  {
    text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
    author: "George R.R. Martin"
  },
  {
    text: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway"
  },
  {
    text: "Books are a uniquely portable magic.",
    author: "Stephen King"
  },
  {
    text: "I have always imagined that Paradise will be a kind of library.",
    author: "Jorge Luis Borges"
  },
  {
    text: "Reading is departure and arrival, the travel and the destination.",
    author: "Unknown"
  }
];

function Split({ children }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const active = QUOTES[index];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative gradient-hero text-primary-foreground p-12 hidden lg:flex flex-col justify-between overflow-hidden">
        <Link to="/" className="font-display text-2xl font-bold relative z-10">📖 BookVault</Link>

        {/* floating books */}
        <div className="absolute inset-0 opacity-90">
          {BOOKS.slice(0, 4).map((b, i) => (
            <motion.div
              key={b.id}
              animate={{ y: [0, -14, 0], rotate: [(i - 2) * 4, (i - 2) * 4 + 2, (i - 2) * 4] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              className="absolute book-cover w-32"
              style={{ left: `${15 + i * 18}%`, top: `${30 + (i % 2) * 25}%` }}
            >
              <img src={coverFromIsbn(b.isbn)} alt="" className="h-full w-full object-cover" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-sm min-h-[160px] flex flex-col justify-end">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="space-y-4"
            >
              <p className="font-display text-2xl italic leading-snug">
                "{active.text}"
              </p>
              <footer className="text-sm text-primary-foreground/70">— {active.author}</footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const nav = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Password Recovery Flow States
  const [recoveryStep, setRecoveryStep] = useState("login"); // "login" | "forgot_email" | "forgot_otp" | "success"
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back");
      nav(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onSendRecoveryOtp = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return toast.error("Please enter your email address.");

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send recovery code.");

      setRecoveryStep("forgot_otp");
      toast.success(`Verification code sent to ${recoveryEmail}. Check your inbox!`, { duration: 6000 });
    } catch (err) {
      toast.error(err.message || "Failed to send recovery passcode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    if (recoveryPassword.length < 8) {
      return toast.error("Password must be at least 8 characters long.");
    }
    if (recoveryPassword !== recoveryConfirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (recoveryOtp.length !== 6) {
      return toast.error("Please enter the 6-digit verification code.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: recoveryEmail, password: recoveryPassword, otp: recoveryOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed.");

      setRecoveryStep("success");
    } catch (err) {
      toast.error(err.message || "Failed to reset password. Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Split>
      <AnimatePresence mode="wait">
        {recoveryStep === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-display text-4xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground mt-2">Sign in to continue your reading journey.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryStep("forgot_email");
                      setRecoveryEmail(email);
                    }}
                    className="text-xs font-semibold text-accent hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input id="pw" type="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" variant="coral" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
            </div>

            <Button variant="outline" className="w-full" size="lg" onClick={() => window.location.href = `${BACKEND_URL}/api/auth/google`}>
              <GoogleIcon /> Continue with Google
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account? <Link to="/register" className="text-accent font-medium hover:underline">Register</Link>
            </p>
          </motion.div>
        ) : recoveryStep === "forgot_email" ? (
          <motion.div
            key="forgot_email"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="font-display text-4xl font-bold">Recover Password</h1>
              <p className="text-muted-foreground mt-2">
                Enter your registered email address below, and we'll send you a 6-digit passcode to reset your credentials.
              </p>
            </div>

            <form onSubmit={onSendRecoveryOtp} className="space-y-4">
              <div>
                <Label htmlFor="recoveryEmail">Email Address</Label>
                <Input
                  id="recoveryEmail"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" variant="coral" className="w-full" size="lg" disabled={loading}>
                {loading ? "Sending Code..." : "Send Recovery Code"}
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setRecoveryStep("login");
                  setRecoveryEmail("");
                }}
                className="text-xs font-semibold text-muted-foreground hover:text-accent transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          </motion.div>
        ) : recoveryStep === "forgot_otp" ? (
          <motion.div
            key="forgot_otp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="font-display text-4xl font-bold">Create New Password</h1>
              <p className="text-muted-foreground mt-2">
                We've sent a 6-digit recovery code to <strong>{recoveryEmail}</strong>. Enter it below along with your new password.
              </p>
            </div>

            <form onSubmit={onResetPassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min. 8 characters"
                    required
                    value={recoveryPassword}
                    onChange={(e) => setRecoveryPassword(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    value={recoveryConfirmPassword}
                    onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-center block text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Code</Label>
                <OtpInput
                  value={recoveryOtp}
                  onChange={setRecoveryOtp}
                  length={6}
                />
              </div>

              <Button type="submit" variant="coral" className="w-full py-6 text-base font-bold shadow-xl mt-4" size="lg" disabled={loading}>
                {loading ? "Resetting Password..." : "Verify & Reset Password"}
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setRecoveryStep("forgot_email");
                  setRecoveryOtp("");
                  setRecoveryPassword("");
                  setRecoveryConfirmPassword("");
                }}
                className="text-xs font-semibold text-muted-foreground hover:text-accent transition-colors"
              >
                ← Back to email entry
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 text-center"
          >
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 text-center space-y-6 shadow-sm">
              <div className="h-16 w-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-emerald-800">Password Reset Successful!</h2>
                <p className="text-sm text-emerald-600 font-medium leading-relaxed max-w-sm mx-auto">
                  Your BookVault account password has been successfully updated. You can now sign in securely with your new password. Thank you for keeping your account safe!
                </p>
              </div>
              <Button
                variant="coral"
                size="lg"
                className="w-full rounded-xl font-bold py-6 text-base"
                onClick={() => {
                  setRecoveryStep("login");
                  setRecoveryEmail("");
                  setRecoveryPassword("");
                  setRecoveryConfirmPassword("");
                  setRecoveryOtp("");
                }}
              >
                Return to Login
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Split>
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
            className="w-11 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all text-gray-800 shadow-sm"
          />
        );
      })}
    </div>
  );
}

export function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [otp, setOtp] = useState("");

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords don't match");

    setLoading(true);
    try {
      // Call backend to generate & email a real OTP
      await fetch(`${BACKEND_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: form.email, name: form.name }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to send OTP");
        return data;
      });

      setStep("otp");
      toast.success(`Verification code sent to ${form.email}. Check your inbox!`, { duration: 6000 });
    } catch (err) {
      toast.error(err.message || "Could not send OTP. Check mail configuration.");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      // Verify OTP with backend
      await fetch(`${BACKEND_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Invalid OTP");
        return data;
      });

      // OTP verified — create the account
      const register = useAuthStore.getState().register;
      const user = await register(form.name, form.email, form.password);
      toast.success("Account verified and created successfully!");
      nav(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Split>
      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-display text-4xl font-bold">Create account</h1>
              <p className="text-muted-foreground mt-2">Join BookVault and start reading today.</p>
            </div>
            <form onSubmit={onFormSubmit} className="space-y-4" autoComplete="off">
              <div>
                <Label>Full name</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" autoComplete="new-name" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Email</Label>
                  <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" autoComplete="new-email" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234-567-890" autoComplete="new-phone" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Password</Label>
                  <Input type="password" placeholder="Enter your password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
                </div>
                <div>
                  <Label>Confirm</Label>
                  <Input type="password" placeholder="Confirm your password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" />
                </div>
              </div>

              <Button type="submit" variant="coral" className="w-full" size="lg" disabled={loading}>
                {loading ? "Processing..." : "Create Account"}
              </Button>
            </form>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
            </div>

            <Button variant="outline" className="w-full" size="lg" onClick={() => window.location.href = `${BACKEND_URL}/api/auth/google`}>
              <GoogleIcon /> Continue with Google
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center md:text-left">
              <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4 mx-auto md:mx-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="font-display text-3xl font-bold">Verify your email</h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                We've sent a 6-digit verification code to <strong>{form.email}</strong>. Enter it below to finalize your registration.
              </p>
            </div>

            <form onSubmit={onVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-center block text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Code</Label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  length={6}
                />
              </div>

              <Button type="submit" variant="coral" className="w-full py-6 text-base font-bold shadow-xl" size="lg" disabled={loading}>
                {loading ? "Verifying Code..." : "Verify & Activate Account"}
              </Button>
            </form>

            <div className="text-center space-y-3 pt-2">
              <button
                onClick={() => setStep("form")}
                className="text-xs font-semibold text-muted-foreground hover:text-accent transition-colors"
              >
                ← Back to registration
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Split>
  );
}
