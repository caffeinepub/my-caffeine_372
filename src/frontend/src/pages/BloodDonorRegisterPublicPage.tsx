import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  CheckCircle2,
  Droplets,
  Heart,
  ShieldAlert,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import { loadSettings } from "../store/settingsStore";

interface Props {
  actor: backendInterface | null;
}

interface ExternalDonor {
  id: string;
  name: string;
  fatherName: string;
  mobile: string;
  address: string;
  bloodGroup: string;
  registeredAt: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const HEALTH_CONDITIONS = [
  "HIV/AIDS",
  "হেপাটাইটিস বি বা সি",
  "ক্যান্সার (চিকিৎসাধীন বা গত ৫ বছরের মধ্যে পুনরাবৃত্তি হলে)",
  "গুরুতর হৃদরোগ বা হার্ট অ্যাটাক",
  "কিডনি ব্যর্থতা বা ডায়ালাইসিসে থাকা",
  "হিমোফিলিয়া বা রক্ত জমাট বাঁধার সমস্যা",
  "গুরুতর অ্যানিমিয়া",
  "সক্রিয় সংক্রমণ (যেমন টিউবারকুলোসিস, ম্যালেরিয়া, জ্বর, ফ্লু ইত্যাদি)",
];

function loadExternalDonors(): ExternalDonor[] {
  try {
    return JSON.parse(localStorage.getItem("bloodDonors_external") || "[]");
  } catch {
    return [];
  }
}

function saveExternalDonors(donors: ExternalDonor[]) {
  localStorage.setItem("bloodDonors_external", JSON.stringify(donors));
}

export default function BloodDonorRegisterPublicPage({ actor: _actor }: Props) {
  const orgSettings = loadSettings();
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [healthChecks, setHealthChecks] = useState<boolean[]>(
    Array(HEALTH_CONDITIONS.length).fill(false),
  );

  const allHealthChecked = healthChecks.every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !bloodGroup) {
      toast.error("নাম, মোবাইল নম্বর ও রক্তের গ্রুপ পূরণ করুন");
      return;
    }
    if (!allHealthChecked) {
      toast.error("স্বাস্থ্য ঘোষণার সবগুলো চেকবক্সে টিক দিন");
      return;
    }

    const donors = loadExternalDonors();
    const newDonor: ExternalDonor = {
      id: `ext_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      fatherName: fatherName.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      bloodGroup,
      registeredAt: new Date().toISOString(),
    };
    donors.push(newDonor);
    saveExternalDonors(donors);

    setSubmitted(true);
    // reset
    setName("");
    setFatherName("");
    setMobile("");
    setAddress("");
    setBloodGroup("");
    setHealthChecks(Array(HEALTH_CONDITIONS.length).fill(false));
  };

  const logoSrc =
    orgSettings.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";
  const orgName1 = orgSettings.orgName1 || "আপন";
  const orgName2 = orgSettings.orgName2 || "ফাউন্ডেশন";
  const orgAddress = orgSettings.address || "বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <img
              src={logoSrc}
              alt="লোগো"
              className="w-14 h-14 object-contain rounded-full border border-green-100 bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <h1 className="text-xl font-bold leading-tight">
                <span style={{ color: "#166534" }}>{orgName1}</span>
                <span style={{ color: "#dc2626" }}> {orgName2}</span>
              </h1>

              <p className="text-xs text-gray-400">{orgAddress}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div
        className="py-10 px-4 text-center"
        style={{
          background: "linear-gradient(135deg, #059669 0%, #065f46 100%)",
        }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
          <UserPlus size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          রক্তদাতা হিসেবে নিবন্ধন করুন
        </h2>
        <p className="text-green-100 text-sm max-w-md mx-auto">
          আপনার তথ্য দিয়ে রক্তদাতা গ্রুপে যোগ দিন এবং একটি জীবন বাঁচানোর সুযোগ নিন
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {submitted ? (
          <div
            className="text-center py-16 rounded-2xl bg-white shadow-sm border border-green-200"
            data-ocid="register_public.success_state"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-5">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-3">
              নিবন্ধন সফল হয়েছে! 🎉
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
              আপনি সফলভাবে রক্তদাতা গ্রুপে নিবন্ধিত হয়েছেন। ধন্যবাদ!
            </p>
            <div className="mt-6 p-4 bg-green-50 rounded-xl inline-block">
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                <Heart size={16} className="fill-green-600" />
                আপনার এই সিদ্ধান্ত একটি জীবন বাঁচাতে পারে
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-8 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
              data-ocid="register_public.register_another.button"
            >
              আরেকজনকে নিবন্ধন করুন
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
            data-ocid="register_public.form"
          >
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={20} className="text-green-600" />
              <h3 className="text-base font-bold text-gray-800">ব্যক্তিগত তথ্য</h3>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-name"
                className="text-sm font-medium text-gray-700"
              >
                নাম <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার পুরো নাম লিখুন"
                required
                data-ocid="register_public.name.input"
              />
            </div>

            {/* Father's name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-father"
                className="text-sm font-medium text-gray-700"
              >
                পিতার নাম
              </Label>
              <Input
                id="reg-father"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="পিতার নাম লিখুন"
                data-ocid="register_public.father_name.input"
              />
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-mobile"
                className="text-sm font-medium text-gray-700"
              >
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reg-mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="01XXXXXXXXX"
                type="tel"
                required
                data-ocid="register_public.mobile.input"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-address"
                className="text-sm font-medium text-gray-700"
              >
                ঠিকানা
              </Label>
              <Input
                id="reg-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="গ্রাম, উপজেলা, জেলা"
                data-ocid="register_public.address.input"
              />
            </div>

            {/* Blood Group */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                রক্তের গ্রুপ <span className="text-red-500">*</span>
              </Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup} required>
                <SelectTrigger data-ocid="register_public.blood_group.select">
                  <SelectValue placeholder="রক্তের গ্রুপ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Health Declaration */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <ShieldAlert size={18} className="text-amber-600" />
                <h4 className="text-sm font-bold text-gray-800">স্বাস্থ্য ঘোষণা</h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                নিচের প্রতিটি বক্সে টিক দিয়ে নিশ্চিত করুন যে আপনার এই রোগ বা অবস্থাগুলো
                <strong className="text-red-600"> নেই</strong>:
              </p>
              <div
                className="space-y-2.5"
                data-ocid="register_public.health_declaration.panel"
              >
                {HEALTH_CONDITIONS.map((condition, idx) => (
                  <div key={condition} className="flex items-start gap-3">
                    <Checkbox
                      id={`health-${idx}`}
                      checked={healthChecks[idx]}
                      onCheckedChange={(checked) => {
                        const next = [...healthChecks];
                        next[idx] = Boolean(checked);
                        setHealthChecks(next);
                      }}
                      data-ocid={`register_public.health.checkbox.${idx + 1}`}
                      className="mt-0.5 border-red-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label
                      htmlFor={`health-${idx}`}
                      className="text-xs text-gray-600 cursor-pointer leading-relaxed"
                    >
                      আমার <strong className="text-red-700">{condition}</strong>{" "}
                      নেই
                    </Label>
                  </div>
                ))}
              </div>
              {!allHealthChecked && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  ⚠️ সাবমিট করতে সবগুলো বক্সে টিক দিন
                </p>
              )}
              {allHealthChecked && (
                <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                  ✅ আমি নিশ্চিত করছি যে আমার উপরোক্ত কোনো রোগ নেই এবং আমি রক্তদাতা
                  হিসেবে যোগ দিতে সম্মত।
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-xl"
              style={{ background: allHealthChecked ? "#059669" : "#9ca3af" }}
              disabled={!allHealthChecked}
              data-ocid="register_public.submit.button"
            >
              <UserPlus size={18} className="mr-2" />
              রক্তদাতা হিসেবে নিবন্ধন করুন
            </Button>
          </form>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 transition-colors"
        >
          Built with love using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
