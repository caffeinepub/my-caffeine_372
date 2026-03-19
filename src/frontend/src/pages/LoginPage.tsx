import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export default function LoginPage({ onLogin, isLoggingIn }: Props) {
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

        <div className="w-full space-y-4 text-center">
          <h2 className="font-semibold text-lg text-foreground">
            সদস্য ব্যবস্থাপনা পোর্টাল
          </h2>
          <p className="text-sm text-muted-foreground">
            সদস্য তালিকা দেখতে ও পরিচালনা করতে লগইন করুন
          </p>
          <Button
            onClick={onLogin}
            disabled={isLoggingIn}
            className="w-full h-11 text-base"
            style={{ background: "#1a6b2a" }}
            data-ocid="login.submit_button"
          >
            {isLoggingIn ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isLoggingIn ? "লগইন হচ্ছে..." : "Internet Identity দিয়ে লগইন"}
          </Button>
          <p className="text-xs text-muted-foreground">
            আপনার Internet Identity ব্যবহার করে নিরাপদে লগইন করুন
          </p>
        </div>

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
