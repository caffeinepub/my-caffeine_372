import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  Copy,
  Droplets,
  Link2,
  Phone,
  Search,
  Share2,
  ShieldAlert,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import { loadSettings } from "../store/settingsStore";

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
  defaultTab?: string;
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

interface DonorEntry {
  id: string;
  name: string;
  fatherName: string;
  mobile: string;
  address: string;
  bloodGroup: string;
  isFoundationMember: boolean;
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

const BLOOD_GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  "A+": { bg: "#fee2e2", text: "#991b1b" },
  "A-": { bg: "#fecaca", text: "#7f1d1d" },
  "B+": { bg: "#dbeafe", text: "#1e3a8a" },
  "B-": { bg: "#bfdbfe", text: "#1e40af" },
  "AB+": { bg: "#ede9fe", text: "#4c1d95" },
  "AB-": { bg: "#ddd6fe", text: "#5b21b6" },
  "O+": { bg: "#dcfce7", text: "#14532d" },
  "O-": { bg: "#bbf7d0", text: "#166534" },
};

function getBloodGroupStyle(group: string) {
  return BLOOD_GROUP_COLORS[group] || { bg: "#f3f4f6", text: "#374151" };
}

function loadExternalDonors(): ExternalDonor[] {
  try {
    const raw = localStorage.getItem("bloodDonors_external");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveExternalDonors(donors: ExternalDonor[]) {
  localStorage.setItem("bloodDonors_external", JSON.stringify(donors));
}

function DonorCard({
  donor,
  index,
}: {
  donor: DonorEntry;
  index: number;
}) {
  const bgStyle = getBloodGroupStyle(donor.bloodGroup);

  async function handleShare() {
    const text = `🩸 রক্তদাতার তথ্য\nনাম: ${donor.name}\nপিতার নাম: ${donor.fatherName}\nমোবাইল: ${donor.mobile}\nঠিকানা: ${donor.address}\nরক্তের গ্রুপ: ${donor.bloodGroup}\n\n— আপন ফাউন্ডেশন, বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("তথ্য ক্লিপবোর্ডে কপি হয়েছে!");
    }
  }

  return (
    <div
      className="bg-white border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
      data-ocid={`blooddonor.item.${index}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: bgStyle.bg, color: bgStyle.text }}
          >
            {donor.bloodGroup}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              {donor.name}
            </div>
            <div className="text-xs text-muted-foreground">
              পিতা: {donor.fatherName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {donor.isFoundationMember && (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ background: "#dcfce7", color: "#14532d" }}
            >
              সদস্য
            </Badge>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
            title="শেয়ার করুন"
            data-ocid={`blooddonor.share.button.${index}`}
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Phone size={12} className="text-primary flex-shrink-0" />
          <span>{donor.mobile}</span>
        </div>
        <div className="flex items-start gap-1.5">
          <Search size={12} className="text-primary flex-shrink-0 mt-0.5" />
          <span>{donor.address}</span>
        </div>
      </div>
    </div>
  );
}

function RegistrationModal({
  open,
  onClose,
  onRegistered,
}: {
  open: boolean;
  onClose: () => void;
  onRegistered: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    mobile: "",
    address: "",
    bloodGroup: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [healthChecks, setHealthChecks] = useState<boolean[]>(
    Array(8).fill(false),
  );

  const allHealthChecked = healthChecks.every(Boolean);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.name ||
      !form.fatherName ||
      !form.mobile ||
      !form.address ||
      !form.bloodGroup
    ) {
      toast.error("সব ঘর পূরণ করুন।");
      return;
    }
    if (!allHealthChecked) {
      toast.error("স্বাস্থ্য ঘোষণার সকল বিষয়ে সম্মতি দিন।");
      return;
    }
    setSubmitting(true);
    const donors = loadExternalDonors();
    const newDonor: ExternalDonor = {
      id: Date.now().toString(),
      ...form,
      registeredAt: new Date().toISOString(),
    };
    donors.push(newDonor);
    saveExternalDonors(donors);
    toast.success("নিবন্ধন সফল হয়েছে! আপনি রক্তদাতা গ্রুপে যুক্ত হয়েছেন।");
    setForm({
      name: "",
      fatherName: "",
      mobile: "",
      address: "",
      bloodGroup: "",
    });
    setHealthChecks(Array(8).fill(false));
    setSubmitting(false);
    onRegistered();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="blooddonor.registration.modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets size={18} className="text-red-600" />
            নতুন রক্তদাতা নিবন্ধন
          </DialogTitle>
        </DialogHeader>

        <div
          className="text-xs p-3 rounded-lg mb-2"
          style={{ background: "#fff7ed", color: "#9a3412" }}
        >
          <Copy size={12} className="inline mr-1" />
          এই পেজের লিংকটি শেয়ার করুন — যে কেউ এসে নিবন্ধন করতে পারবেন।
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="donor-name">নাম *</Label>
            <Input
              id="donor-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="পূর্ণ নাম"
              data-ocid="blooddonor.registration.name.input"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="donor-father">পিতার নাম *</Label>
            <Input
              id="donor-father"
              value={form.fatherName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fatherName: e.target.value }))
              }
              placeholder="পিতার নাম"
              data-ocid="blooddonor.registration.father.input"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="donor-mobile">মোবাইল নম্বর *</Label>
            <Input
              id="donor-mobile"
              value={form.mobile}
              onChange={(e) =>
                setForm((f) => ({ ...f, mobile: e.target.value }))
              }
              placeholder="01XXXXXXXXX"
              data-ocid="blooddonor.registration.mobile.input"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="donor-address">ঠিকানা *</Label>
            <Input
              id="donor-address"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="গ্রাম, উপজেলা, জেলা"
              data-ocid="blooddonor.registration.address.input"
            />
          </div>
          <div className="space-y-1">
            <Label>রক্তের গ্রুপ *</Label>
            <Select
              value={form.bloodGroup}
              onValueChange={(v) => setForm((f) => ({ ...f, bloodGroup: v }))}
            >
              <SelectTrigger data-ocid="blooddonor.registration.bloodgroup.select">
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

          {/* Health Declaration Section */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              background: "#fff7ed",
              border: "1px solid #92400e",
            }}
          >
            <div
              className="flex items-center gap-2 font-bold text-sm"
              style={{ color: "#9a3412" }}
            >
              <ShieldAlert size={16} />
              স্বাস্থ্য ঘোষণা
            </div>
            <p className="text-xs" style={{ color: "#9a3412" }}>
              নিচের প্রতিটি বিষয়ে নিশ্চিত করুন যে আপনার এই রোগ বা অবস্থা নেই:
            </p>
            <div className="space-y-2">
              {HEALTH_CONDITIONS.map((condition, idx) => (
                <label
                  key={condition}
                  className="flex items-start gap-2.5 cursor-pointer group"
                  data-ocid={`blooddonor.health.checkbox.${idx + 1}`}
                >
                  <input
                    type="checkbox"
                    checked={healthChecks[idx]}
                    onChange={(e) =>
                      setHealthChecks((prev) => {
                        const next = [...prev];
                        next[idx] = e.target.checked;
                        return next;
                      })
                    }
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-red-700 cursor-pointer"
                  />
                  <span
                    className="text-xs leading-relaxed"
                    style={{ color: "#7c2d12" }}
                  >
                    {condition}
                  </span>
                </label>
              ))}
            </div>
            <p
              className="text-xs italic pt-1 border-t"
              style={{ color: "#92400e", borderColor: "#fcd34d" }}
            >
              আমি নিশ্চিত করছি যে আমার উপরোক্ত কোনো রোগ নেই এবং আমি রক্তদাতা হিসেবে
              যোগ দিতে সম্মত।
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-ocid="blooddonor.registration.cancel.button"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={submitting || !allHealthChecked}
              className="flex-1"
              style={{ background: allHealthChecked ? "#dc2626" : undefined }}
              data-ocid="blooddonor.registration.submit.button"
            >
              <Droplets size={14} className="mr-1" />
              নিবন্ধন করুন
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BloodDonorPage({
  actor,
  defaultTab = "donors",
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("সব");
  const [searchBloodGroup, setSearchBloodGroup] = useState("");
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [externalDonors, setExternalDonors] =
    useState<ExternalDonor[]>(loadExternalDonors);
  const orgSettings = loadSettings();
  const logoSrc =
    orgSettings.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

  const { data: members = [] } = useQuery({
    queryKey: ["members-for-blooddonor"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembers();
    },
    enabled: !!actor,
  });

  // Merge foundation members (with bloodGroup) + external donors
  const allDonors: DonorEntry[] = [
    ...members
      .filter((m) => m.bloodGroup && m.bloodGroup.trim() !== "")
      .map((m) => ({
        id: `member-${m.id.toString()}`,
        name: m.memberName,
        fatherName: m.fatherName,
        mobile: m.mobile,
        address: m.currentAddress || m.permanentAddress,
        bloodGroup: m.bloodGroup,
        isFoundationMember: true,
      })),
    ...externalDonors.map((d) => ({
      id: `ext-${d.id}`,
      name: d.name,
      fatherName: d.fatherName,
      mobile: d.mobile,
      address: d.address,
      bloodGroup: d.bloodGroup,
      isFoundationMember: false,
    })),
  ];

  const filteredDonors = allDonors.filter((d) => {
    const matchGroup =
      bloodGroupFilter === "সব" || d.bloodGroup === bloodGroupFilter;
    const matchSearch =
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.mobile.includes(searchQuery);
    return matchGroup && matchSearch;
  });

  const searchFilteredDonors = searchBloodGroup
    ? allDonors.filter((d) => d.bloodGroup === searchBloodGroup)
    : [];

  function handlePdfExport() {
    const rows = filteredDonors
      .map(
        (d, i) =>
          `<tr>
          <td style="text-align:center;padding:6px 8px;border:1px solid #e5e7eb">${i + 1}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb">${d.name}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb">${d.fatherName}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb">${d.mobile}</td>
          <td style="padding:6px 8px;border:1px solid #e5e7eb">${d.address}</td>
          <td style="text-align:center;padding:6px 8px;border:1px solid #e5e7eb;font-weight:bold;color:#dc2626">${d.bloodGroup}</td>
        </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<title>রক্তদাতা তালিকা — আপন ফাউন্ডেশন</title>
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Hind Siliguri', sans-serif; background: #fff; color: #111; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 25.4mm; position: relative; }
  @page { size: A4; margin: 0; }
  @media print { body { margin: 0; } .page { page-break-after: always; } }
  .watermark { position: fixed; top: 62%; left: 50%; transform: translate(-50%, -50%); opacity: 0.35; z-index: 0; pointer-events: none; }
  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
  .header img { width: 64px; height: 64px; object-fit: contain; }
  .header-text { flex: 1; text-align: center; }
  .arabic { font-size: 14px; color: #1e3a8a; direction: rtl; margin-bottom: 2px; }
  .org-name { font-size: 22px; font-weight: 700; }
  .slogan { font-size: 13px; color: #dc2626; }
  .address { font-size: 12px; color: #6b21a8; }
  .contact { font-size: 11px; color: #374151; margin-top: 3px; }
  .divider { border-top: 2px solid #dc2626; margin: 10px 0; }
  .report-title { text-align: center; font-size: 16px; font-weight: 700; color: #dc2626; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; position: relative; z-index: 1; }
  thead { background: #dc2626; color: white; }
  th { padding: 8px; text-align: left; font-weight: 600; border: 1px solid #b91c1c; }
  tbody tr:nth-child(even) { background: #fef2f2; }
  .page-num { text-align: right; font-size: 10px; color: #6b7280; margin-top: 8px; }
</style>
</head>
<body>
<div class="page">
  <img class="watermark" src="${logoSrc}" width="280" />
  <div class="header">
    <img src="${logoSrc}" alt="লোগো" />
    <div class="header-text">
      <div class="arabic">بسم الله الرحمن الرحيم</div>
      <div class="org-name">
        <span style="color:#166534">${orgSettings.orgName1}</span>
        <span style="color:#ea580c"> ${orgSettings.orgName2}</span>
      </div>
      <div class="slogan">${orgSettings.tagline}</div>
      <div class="address">${orgSettings.address}</div>
      <div class="contact">✉️ ${orgSettings.email} &nbsp; 📱 ${orgSettings.whatsapp}</div>
    </div>
  </div>
  <div class="divider"></div>
  <div class="report-title">🩸 রক্তদাতা তালিকা</div>
  <table>
    <thead>
      <tr>
        <th style="width:40px;text-align:center">ক্রম</th>
        <th>নাম</th>
        <th>পিতার নাম</th>
        <th>মোবাইল</th>
        <th>ঠিকানা</th>
        <th style="width:60px;text-align:center">রক্তের গ্রুপ</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="page-num">মোট: ${filteredDonors.length} জন রক্তদাতা</div>
</div>
<script>window.onload=()=>window.print();</script>
</body>
</html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }

  return (
    <div className="space-y-6" data-ocid="blooddonor.page">
      {/* Page header */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <Droplets size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">রক্তদাতা গ্রুপ</h1>
            <p className="text-red-100 text-sm mt-0.5">
              আপন ফাউন্ডেশনের রক্তদাতা তালিকা ও অনুসন্ধান
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold">{allDonors.length}</div>
            <div className="text-red-200 text-xs">মোট রক্তদাতা</div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setActiveTab("search");
          }}
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl text-white font-bold text-base shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
          }}
          type="button"
          data-ocid="blooddonor.btn.search"
        >
          <Search size={28} />
          রক্তদাতা অনুসন্ধান করুন
        </button>
        <button
          onClick={() => setRegistrationOpen(true)}
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl text-white font-bold text-base shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #059669 0%, #065f46 100%)",
          }}
          type="button"
          data-ocid="blooddonor.btn.register"
        >
          <UserPlus size={28} />
          রক্তদাতা হিসেবে নিবন্ধন করুন
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="donors" data-ocid="blooddonor.donors.tab">
            <Droplets size={14} className="mr-1.5" />
            রক্তদাতা তথ্য
          </TabsTrigger>
          <TabsTrigger value="search" data-ocid="blooddonor.search.tab">
            <Search size={14} className="mr-1.5" />
            রক্ত অনুসন্ধান
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All donors */}
        <TabsContent value="donors" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-8"
                placeholder="নাম বা মোবাইল দিয়ে খুঁজুন"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-ocid="blooddonor.search.input"
              />
            </div>
            <Select
              value={bloodGroupFilter}
              onValueChange={setBloodGroupFilter}
            >
              <SelectTrigger
                className="w-full sm:w-40"
                data-ocid="blooddonor.filter.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="সব">সব গ্রুপ</SelectItem>
                {BLOOD_GROUPS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handlePdfExport}
              className="whitespace-nowrap"
              data-ocid="blooddonor.pdf.button"
            >
              PDF ডাউনলোড
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const link = `${window.location.origin}${window.location.pathname}?view=rokto-onusondhan`;
                navigator.clipboard.writeText(link).catch(() => {});
                toast.success(
                  "রক্ত অনুসন্ধান লিংক কপি হয়েছে! সোশ্যাল মিডিয়ায় শেয়ার করুন।",
                );
                if (navigator.share) {
                  navigator
                    .share({
                      title: "রক্তদাতা অনুসন্ধান",
                      text: "আপন ফাউন্ডেশনের রক্তদাতা অনুসন্ধান করুন",
                      url: link,
                    })
                    .catch(() => {});
                }
              }}
              className="whitespace-nowrap"
              data-ocid="blooddonor.share_search_link.button"
            >
              <Link2 size={14} className="mr-1.5" />
              রক্ত অনুসন্ধান লিংক
            </Button>
            <Button
              onClick={() => setRegistrationOpen(true)}
              style={{ background: "#dc2626" }}
              className="whitespace-nowrap"
              data-ocid="blooddonor.register.open_modal_button"
            >
              <UserPlus size={14} className="mr-1.5" />
              নিবন্ধন
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            🔗 "রক্ত অনুসন্ধান লিংক" বাটনে ক্লিক করে সোশ্যাল মিডিয়ায় শেয়ার করুন — যে কেউ
            রক্তদাতা খুঁজতে পারবেন।
          </p>

          {filteredDonors.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="blooddonor.empty_state"
            >
              <Droplets size={40} className="mx-auto mb-3 opacity-30" />
              <p>কোনো রক্তদাতা পাওয়া যায়নি</p>
              <Button
                className="mt-4"
                style={{ background: "#dc2626" }}
                onClick={() => setRegistrationOpen(true)}
                data-ocid="blooddonor.empty.register.button"
              >
                <UserPlus size={14} className="mr-1.5" />
                প্রথম রক্তদাতা হন
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDonors.map((donor, i) => (
                <DonorCard key={donor.id} donor={donor} index={i + 1} />
              ))}
            </div>
          )}
          {/* Shareable Registration Link */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-green-800 font-semibold text-sm">
              <Link2 size={16} />
              শেয়ারযোগ্য লিংক — রক্তদাতা হিসেবে নিবন্ধন করুন
            </div>
            <div className="bg-white border border-green-200 rounded-lg px-3 py-2 text-xs text-gray-600 break-all font-mono select-all">
              {`${window.location.origin}${window.location.pathname}?view=rokto-nibondhan`}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="blooddonor.reg_link.copy.button"
                onClick={() => {
                  const link = `${window.location.origin}${window.location.pathname}?view=rokto-nibondhan`;
                  navigator.clipboard.writeText(link).catch(() => {});
                  toast.success("নিবন্ধন লিংক কপি হয়েছে!");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
              >
                <Copy size={12} />
                কপি করুন
              </button>
              <button
                type="button"
                data-ocid="blooddonor.reg_link.share.button"
                onClick={() => {
                  const link = `${window.location.origin}${window.location.pathname}?view=rokto-nibondhan`;
                  if (navigator.share) {
                    navigator
                      .share({
                        title: "রক্তদাতা হিসেবে নিবন্ধন করুন",
                        text: "আপন ফাউন্ডেশনে রক্তদাতা হিসেবে নিবন্ধন করুন",
                        url: link,
                      })
                      .catch(() => {});
                  } else {
                    navigator.clipboard.writeText(link).catch(() => {});
                    toast.success("লিংক কপি হয়েছে!");
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-green-300 text-green-700 text-xs font-semibold hover:bg-green-50 transition-colors"
              >
                <Share2 size={12} />
                শেয়ার করুন
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Blood search */}
        <TabsContent value="search" className="space-y-6 mt-4">
          <div>
            <h2 className="text-base font-semibold mb-3 text-foreground">
              রক্তের গ্রুপ নির্বাচন করুন
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {BLOOD_GROUPS.map((g) => {
                const style = getBloodGroupStyle(g);
                const count = allDonors.filter(
                  (d) => d.bloodGroup === g,
                ).length;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      setSearchBloodGroup(searchBloodGroup === g ? "" : g)
                    }
                    className="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all font-bold text-sm"
                    style={{
                      borderColor:
                        searchBloodGroup === g ? style.text : "#e5e7eb",
                      background: searchBloodGroup === g ? style.bg : "#ffffff",
                      color: searchBloodGroup === g ? style.text : "#6b7280",
                    }}
                    data-ocid={`blooddonor.bloodgroup.${g.replace("+", "pos").replace("-", "neg")}.button`}
                  >
                    <span className="text-lg">{g}</span>
                    <span className="text-xs font-normal mt-0.5">
                      {count} জন
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {searchBloodGroup && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="text-sm font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: getBloodGroupStyle(searchBloodGroup).bg,
                    color: getBloodGroupStyle(searchBloodGroup).text,
                  }}
                >
                  {searchBloodGroup}
                </div>
                <span className="text-sm text-muted-foreground">
                  {searchFilteredDonors.length} জন রক্তদাতা পাওয়া গেছে
                </span>
              </div>

              {searchFilteredDonors.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="blooddonor.search.empty_state"
                >
                  <Droplets size={36} className="mx-auto mb-2 opacity-30" />
                  <p>এই গ্রুপের কোনো রক্তদাতা নেই</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchFilteredDonors.map((donor, i) => (
                    <DonorCard key={donor.id} donor={donor} index={i + 1} />
                  ))}
                </div>
              )}
            </div>
          )}

          {!searchBloodGroup && (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="blooddonor.search.prompt_state"
            >
              <Droplets size={40} className="mx-auto mb-3 opacity-20" />
              <p>উপর থেকে একটি রক্তের গ্রুপ নির্বাচন করুন</p>
            </div>
          )}

          {/* Shareable Search Link */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2 mt-6">
            <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
              <Link2 size={16} />
              শেয়ারযোগ্য লিংক
            </div>
            <p className="text-red-700 text-xs font-medium">রক্তদাতা অনুসন্ধান করুন</p>
            <div className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs text-gray-600 break-all font-mono select-all">
              {`${window.location.origin}${window.location.pathname}?view=rokto-onusondhan`}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="blooddonor.search_link.copy.button"
                onClick={() => {
                  const link = `${window.location.origin}${window.location.pathname}?view=rokto-onusondhan`;
                  navigator.clipboard.writeText(link).catch(() => {});
                  toast.success("অনুসন্ধান লিংক কপি হয়েছে!");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                <Copy size={12} />
                কপি করুন
              </button>
              <button
                type="button"
                data-ocid="blooddonor.search_link.share.button"
                onClick={() => {
                  const link = `${window.location.origin}${window.location.pathname}?view=rokto-onusondhan`;
                  if (navigator.share) {
                    navigator
                      .share({
                        title: "রক্তদাতা অনুসন্ধান করুন",
                        text: "আপন ফাউন্ডেশনের রক্তদাতা অনুসন্ধান করুন",
                        url: link,
                      })
                      .catch(() => {});
                  } else {
                    navigator.clipboard.writeText(link).catch(() => {});
                    toast.success("লিংক কপি হয়েছে!");
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors"
              >
                <Share2 size={12} />
                শেয়ার করুন
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <RegistrationModal
        open={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
        onRegistered={() => setExternalDonors(loadExternalDonors())}
      />
    </div>
  );
}
