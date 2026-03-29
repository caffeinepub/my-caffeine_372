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
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Droplets,
  Heart,
  MapPin,
  Phone,
  Search,
  Share2,
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

const BG_META: Record<string, { color: string; light: string; label: string }> =
  {
    "A+": { color: "#c0392b", light: "#fdf0ee", label: "A পজিটিভ" },
    "A-": { color: "#922b21", light: "#fde8e7", label: "A নেগেটিভ" },
    "B+": { color: "#1a5276", light: "#eaf4fb", label: "B পজিটিভ" },
    "B-": { color: "#154360", light: "#d6eaf8", label: "B নেগেটিভ" },
    "AB+": { color: "#6c3483", light: "#f5eef8", label: "AB পজিটিভ" },
    "AB-": { color: "#4a235a", light: "#ede6f5", label: "AB নেগেটিভ" },
    "O+": { color: "#117a65", light: "#e8f8f5", label: "O পজিটিভ" },
    "O-": { color: "#0b5345", light: "#d5f5e3", label: "O নেগেটিভ" },
  };

function getMeta(g: string) {
  return BG_META[g] || { color: "#374151", light: "#f9fafb", label: g };
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

function DonorCard({ donor, idx }: { donor: DonorEntry; idx: number }) {
  const meta = getMeta(donor.bloodGroup);

  async function handleShare() {
    const text = `🩸 রক্তদাতার তথ্য\nনাম: ${donor.name}\nপিতার নাম: ${donor.fatherName}\nমোবাইল: ${donor.mobile}\nঠিকানা: ${donor.address}\nরক্তের গ্রুপ: ${donor.bloodGroup}\n\n— আপন ফাউন্ডেশন, বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "রক্তদাতার তথ্য", text });
      } catch {
        /* cancel */
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("তথ্য ক্লিপবোর্ডে কপি হয়েছে!");
    }
  }

  return (
    <div
      className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border"
      style={{ borderColor: `${meta.color}30` }}
      data-ocid={`bdsearch.card.${idx}`}
    >
      {/* top accent bar */}
      <div className="h-1.5 w-full" style={{ background: meta.color }} />

      <div className="p-5">
        {/* blood group badge + member tag */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl font-black text-xl shadow-sm"
            style={{ background: meta.light, color: meta.color }}
          >
            {donor.bloodGroup}
          </div>
          {donor.isFoundationMember && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: "#e8f5e9", color: "#2e7d32" }}
            >
              ✓ সদস্য
            </span>
          )}
        </div>

        {/* donor info */}
        <div className="space-y-1 mb-4">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">
            {donor.name}
          </h3>
          <p className="text-sm text-gray-500">পিতা: {donor.fatherName}</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: meta.light }}
            >
              <MapPin size={13} style={{ color: meta.color }} />
            </div>
            <span className="text-sm text-gray-600 line-clamp-2">
              {donor.address}
            </span>
          </div>
        </div>

        {/* action buttons */}
        <div className="flex gap-2">
          <a
            href={`tel:${donor.mobile}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: meta.color }}
            data-ocid={`bdsearch.call.${idx}`}
          >
            <Phone size={14} />
            {donor.mobile}
          </a>
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-colors hover:opacity-80 flex-shrink-0"
            style={{ borderColor: `${meta.color}40`, color: meta.color }}
            data-ocid={`bdsearch.share.${idx}`}
            title="শেয়ার করুন"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RegModal({
  open,
  onClose,
  onDone,
}: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    mobile: "",
    address: "",
    bloodGroup: "",
  });

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
    const donors = loadExternalDonors();
    donors.push({
      id: Date.now().toString(),
      ...form,
      registeredAt: new Date().toISOString(),
    });
    saveExternalDonors(donors);
    toast.success("নিবন্ধন সফল! আপনি রক্তদাতা গ্রুপে যুক্ত হয়েছেন।");
    setForm({
      name: "",
      fatherName: "",
      mobile: "",
      address: "",
      bloodGroup: "",
    });
    onDone();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-ocid="bdsearch.reg.modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart size={18} className="text-red-600" />
            রক্তদাতা হিসেবে নিবন্ধন করুন
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(
            [
              { field: "name", label: "নাম", placeholder: "পূর্ণ নাম" },
              {
                field: "fatherName",
                label: "পিতার নাম",
                placeholder: "পিতার পূর্ণ নাম",
              },
              {
                field: "mobile",
                label: "মোবাইল নম্বর",
                placeholder: "01XXXXXXXXX",
              },
              {
                field: "address",
                label: "ঠিকানা",
                placeholder: "গ্রাম, উপজেলা, জেলা",
              },
            ] as const
          ).map(({ field, label, placeholder }) => (
            <div key={field} className="space-y-1">
              <Label>{label} *</Label>
              <Input
                value={form[field as keyof typeof form]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [field]: e.target.value }))
                }
                placeholder={placeholder}
              />
            </div>
          ))}
          <div className="space-y-1">
            <Label>রক্তের গ্রুপ *</Label>
            <Select
              value={form.bloodGroup}
              onValueChange={(v) => setForm((f) => ({ ...f, bloodGroup: v }))}
            >
              <SelectTrigger>
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
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Heart size={14} className="mr-1.5" /> নিবন্ধন করুন
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BloodDonorSearchPage({ actor }: Props) {
  const orgSettings = loadSettings();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [externalDonors, setExternalDonors] =
    useState<ExternalDonor[]>(loadExternalDonors);
  const [regOpen, setRegOpen] = useState(false);

  const logoSrc =
    orgSettings.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

  const { data: members = [] } = useQuery({
    queryKey: ["members-bdsearch"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembers();
    },
    enabled: !!actor,
  });

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

  const results = selectedGroup
    ? allDonors.filter((d) => d.bloodGroup === selectedGroup)
    : [];
  const selectedMeta = selectedGroup ? getMeta(selectedGroup) : null;

  return (
    <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
      {/* ===== HERO HEADER ===== */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #b71c1c 0%, #7b1111 50%, #3e0505 100%)",
        }}
      >
        {/* decorative circles */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(-30%, 30%)" }}
        />

        <div className="relative max-w-3xl mx-auto px-5 pt-8 pb-10">
          {/* org branding */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1.5">
              <img
                src={logoSrc}
                alt="লোগো"
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="font-bold text-white/90 text-sm leading-tight">
                <span>{orgSettings.orgName1}</span>{" "}
                <span>{orgSettings.orgName2}</span>
              </div>
              <div className="text-white/60 text-xs">{orgSettings.address}</div>
            </div>
          </div>

          {/* main heading */}
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-white/15 rounded-2xl p-3 flex-shrink-0">
              <Droplets size={36} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                রক্তদাতা
                <br />
                <span className="text-red-200">অনুসন্ধান</span>
              </h1>
              <p className="text-white/70 text-sm mt-2 leading-relaxed">
                সঠিক রক্তের গ্রুপ নির্বাচন করুন এবং কাছের দাতার সাথে সরাসরি যোগাযোগ করুন
              </p>
            </div>
          </div>

          {/* stats bar */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "মোট দাতা", value: allDonors.length },
              { label: "রক্তের গ্রুপ", value: 8 },
              {
                label: "সদস্য দাতা",
                value: allDonors.filter((d) => d.isFoundationMember).length,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center"
              >
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-xs text-white/70 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-3xl mx-auto px-5 -mt-4 pb-12">
        {/* blood group selector card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Search size={18} className="text-red-600" />
            <h2 className="font-bold text-gray-800">রক্তের গ্রুপ নির্বাচন করুন</h2>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {BLOOD_GROUPS.map((g) => {
              const meta = getMeta(g);
              const count = allDonors.filter((d) => d.bloodGroup === g).length;
              const isSelected = selectedGroup === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroup(isSelected ? "" : g)}
                  className="relative flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 transition-all duration-200 hover:scale-105"
                  style={{
                    background: isSelected ? meta.color : meta.light,
                    borderColor: isSelected ? meta.color : `${meta.color}30`,
                    color: isSelected ? "white" : meta.color,
                    boxShadow: isSelected
                      ? `0 4px 20px ${meta.color}50`
                      : "none",
                    transform: isSelected ? "scale(1.07)" : undefined,
                  }}
                  data-ocid={`bdsearch.bg.${g.replace("+", "pos").replace("-", "neg")}`}
                >
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: meta.color }}
                      />
                    </div>
                  )}
                  <span className="text-2xl font-black leading-none">{g}</span>
                  <span className="text-xs mt-1.5 font-medium opacity-80">
                    {count} জন
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* results section */}
        {selectedGroup && selectedMeta && (
          <div className="space-y-4">
            {/* result header */}
            <div
              className="flex items-center justify-between px-5 py-3.5 rounded-2xl"
              style={{
                background: selectedMeta.light,
                borderLeft: `4px solid ${selectedMeta.color}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-2xl font-black"
                  style={{ color: selectedMeta.color }}
                >
                  {selectedGroup}
                </span>
                <div>
                  <div className="font-semibold text-gray-800">
                    {getMeta(selectedGroup).label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {results.length === 0
                      ? "কোনো রক্তদাতা পাওয়া যায়নি"
                      : `${results.length} জন রক্তদাতা পাওয়া গেছে`}
                  </div>
                </div>
              </div>
              <Droplets
                size={28}
                style={{ color: `${selectedMeta.color}60` }}
              />
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: selectedMeta.light }}
                >
                  <Droplets
                    size={36}
                    style={{ color: `${selectedMeta.color}50` }}
                  />
                </div>
                <p className="text-gray-600 font-medium">
                  এই গ্রুপের কোনো রক্তদাতা নেই
                </p>
                <p className="text-sm text-gray-400 mt-1 mb-5">
                  আপনি প্রথম রক্তদাতা হতে পারেন!
                </p>
                <Button
                  onClick={() => setRegOpen(true)}
                  className="text-white"
                  style={{ background: selectedMeta.color }}
                >
                  <Heart size={15} className="mr-2" />
                  রক্তদাতা হিসেবে নিবন্ধন করুন
                </Button>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                data-ocid="bdsearch.results"
              >
                {results.map((donor, i) => (
                  <DonorCard key={donor.id} donor={donor} idx={i + 1} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* no selection state */}
        {!selectedGroup && (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#fef2f2" }}
            >
              <Search size={32} className="text-red-300" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">
              রক্তের গ্রুপ নির্বাচন করুন
            </p>
            <p className="text-sm text-gray-400 mt-1">
              উপরের গ্রুপ বাটনে ক্লিক করলে সেই গ্রুপের সব দাতার তথ্য দেখাবে
            </p>
          </div>
        )}

        {/* register CTA */}
        <div
          className="relative overflow-hidden rounded-3xl p-7 text-center"
          style={{
            background: "linear-gradient(135deg, #b71c1c 0%, #7b1111 100%)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: "white", transform: "translate(30%,-30%)" }}
          />
          <div className="relative">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Heart size={26} className="text-white" />
            </div>
            <h3 className="text-white font-black text-xl mb-1">
              রক্তদাতা হতে চান?
            </h3>
            <p className="text-red-200 text-sm mb-5 leading-relaxed">
              আপনার তথ্য যোগ করুন — জরুরি মুহূর্তে আপনিও কারো জীবন বাঁচাতে পারেন
            </p>
            <button
              type="button"
              onClick={() => setRegOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors shadow-lg"
              data-ocid="bdsearch.register.button"
            >
              <UserPlus size={17} />
              রক্তদাতা হিসেবে নিবন্ধন করুন
            </button>
          </div>
        </div>

        {/* footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p className="font-medium" style={{ color: "#7b1111" }}>
            রক্তদাতা অনুসন্ধান পোর্টাল
          </p>
          <p className="mt-1">
            পরিচালিত:{" "}
            <span style={{ color: "#0f766e", fontWeight: 600 }}>
              {orgSettings.orgName1}
            </span>{" "}
            <span style={{ color: "#b91c1c", fontWeight: 600 }}>
              {orgSettings.orgName2}
            </span>
            {" — "}
            {orgSettings.address}
          </p>
          <p className="mt-2">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      <RegModal
        open={regOpen}
        onClose={() => setRegOpen(false)}
        onDone={() => setExternalDonors(loadExternalDonors())}
      />
      <Toaster />
    </div>
  );
}
