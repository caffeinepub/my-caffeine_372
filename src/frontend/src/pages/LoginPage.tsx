import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { type AuthSession, loginAdmin } from "../store/adminAuthStore";

interface Props {
  onLogin: (session: AuthSession) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const session = loginAdmin(email, password);
      setLoading(false);
      if (session) {
        onLogin(session);
      } else {
        setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
      }
    }, 400);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #0f3d1a 0%, #1a6b2a 50%, #2d4a1e 100%)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-8 max-w-md w-full mx-4">
        {/* Logo + Name */}
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/apon-foundation-logo-transparent.dim_200x200.png"
            alt="আপন ফাউন্ডেশন লোগো"
            className="h-24 w-24 object-contain"
          />
          <div className="text-center">
            <div className="text-3xl font-bold">
              <span style={{ color: "#1a6b2a" }}>আপন</span>{" "}
              <span style={{ color: "#8b0000" }}>ফাউন্ডেশন</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              মানবসেবায় প্রতিশ্রুতিবদ্ধ
            </p>
          </div>
        </div>

        <div className="w-full border-t border-border" />

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <h2 className="font-semibold text-lg text-foreground text-center">
            এডমিন লগইন
          </h2>

          <div className="space-y-1.5">
            <Label htmlFor="login-email">ইমেইল আইডি</Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aponfoundation.org"
              required
              data-ocid="login.email.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">পাসওয়ার্ড</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড দিন"
                required
                className="pr-10"
                data-ocid="login.password.input"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              data-ocid="login.error_state"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-base"
            style={{ background: "#1a6b2a" }}
            data-ocid="login.submit_button"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </Button>
        </form>

        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            ইমেইল: info@aponfoundation.org
          </p>
          <p className="text-xs text-muted-foreground">
            হোয়াটসঅ্যাপ: +880 1700-000000
          </p>
          <p className="text-xs text-muted-foreground">
            ওয়েবসাইট: www.aponfoundation.org
          </p>
        </div>
      </div>
    </div>
  );
}
