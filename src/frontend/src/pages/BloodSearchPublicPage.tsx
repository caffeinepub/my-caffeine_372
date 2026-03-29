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
import { Droplets, MapPin, Phone, Share2, UserPlus } from "lucide-react";
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

const BLOOD_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "A+": { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  "A-": { bg: "#fecaca", text: "#7f1d1d", border: "#f87171" },
  "B+": { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
  "B-": { bg: "#bfdbfe", text: "#1e40af", border: "#60a5fa" },
  "AB+": { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" },
  "AB-": { bg: "#ddd6fe", text: "#5b21b6", border: "#a78bfa" },
  "O+": { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
  "O-": { bg: "#bbf7d0", text: "#166534", border: "#4ade80" },
};

function getBloodStyle(g: string) {
  return (
    BLOOD_COLORS[g] || { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" }
  );
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

function DonorCard({ donor, index }: { donor: DonorEntry; index: number }) {
  const s = getBloodStyle(donor.bloodGroup);

  async function handleShare() {
    const text = `\uD83E\uDE78 \u09B0\u0995\u09CD\u09A4\u09A6\u09BE\u09A4\u09BE\u09B0 \u09A4\u09A5\u09CD\u09AF\n\u09A8\u09BE\u09AE: ${donor.name}\n\u09AA\u09BF\u09A4\u09BE\u09B0 \u09A8\u09BE\u09AE: ${donor.fatherName}\n\u09AE\u09CB\u09AC\u09BE\u0987\u09B2: ${donor.mobile}\n\u09A0\u09BF\u0995\u09BE\u09A8\u09BE: ${donor.address}\n\u09B0\u0995\u09CD\u09A4\u09C7\u09B0 \u0997\u09CD\u09B0\u09C1\u09AA: ${donor.bloodGroup}\n\n\u2014 \u0986\u09AA\u09A8 \u09AB\u09BE\u0989\u09A8\u09CD\u09A1\u09C7\u09B6\u09A8, \u09AC\u09BE\u09B2\u09C0\u0997\u09BE\u0981\u0993, \u0985\u09B7\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE, \u0995\u09BF\u09B6\u09CB\u09B0\u0997\u099E\u09CD\u099C`;
    if (navigator.share) {
      try {
        await navigator.share({
          title:
            "\u09B0\u0995\u09CD\u09A4\u09A6\u09BE\u09A4\u09BE\u09B0 \u09A4\u09A5\u09CD\u09AF",
          text,
        });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success(
        "\u09A4\u09A5\u09CD\u09AF \u0995\u09CD\u09B2\u09BF\u09AA\u09AC\u09CB\u09B0\u09CD\u09A1\u09C7 \u0995\u09AA\u09BF \u09B9\u09AF\u09BC\u09C7\u099B\u09C7!",
      );
    }
  }

  return (
    <div
      className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      style={{ borderColor: s.border }}
      data-ocid={`bloodsearch.item.${index}`}
    >
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: s.bg }}
      >
        <span className="text-xl font-bold" style={{ color: s.text }}>
          {donor.bloodGroup}
        </span>
        {donor.isFoundationMember && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "#dcfce7", color: "#14532d" }}
          >
            \u09B8\u09A6\u09B8\u09CD\u09AF
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className="font-semibold text-gray-900">{donor.name}</div>
          <div className="text-sm text-gray-500">
            \u09AA\u09BF\u09A4\u09BE: {donor.fatherName}
          </div>
        </div>
        <div className="space-y-1.5">
          <a
            href={`tel:${donor.mobile}`}
            className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            <Phone size={13} />
            {donor.mobile}
          </a>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin size={13} className="mt-0.5 flex-shrink-0 text-gray-400" />
            {donor.address}
          </div>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors hover:opacity-80"
          style={{ background: s.bg, color: s.text, borderColor: s.border }}
          data-ocid={`bloodsearch.share.button.${index}`}
        >
          <Share2 size={13} />
          \u09A4\u09A5\u09CD\u09AF \u09B6\u09C7\u09AF\u09BC\u09BE\u09B0
          \u0995\u09B0\u09C1\u09A8
        </button>
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
      toast.error(
        "\u09B8\u09AC \u0998\u09B0 \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09C1\u09A8\u0964",
      );
      return;
    }
    const donors = loadExternalDonors();
    donors.push({
      id: Date.now().toString(),
      ...form,
      registeredAt: new Date().toISOString(),
    });
    saveExternalDonors(donors);
    toast.success(
      "\u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u09B8\u09AB\u09B2! \u0986\u09AA\u09A8\u09BF \u09B0\u0995\u09CD\u09A4\u09A6\u09BE\u09A4\u09BE \u0997\u09CD\u09B0\u09C1\u09AA\u09C7 \u09AF\u09C1\u0995\u09CD\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u09A8\u0964",
    );
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
      <DialogContent
        className="max-w-md"
        data-ocid="bloodsearch.registration.modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets size={18} className="text-red-600" />
            \u09B0\u0995\u09CD\u09A4\u09A6\u09BE\u09A4\u09BE
            \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7
            \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u0995\u09B0\u09C1\u09A8
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>\u09A8\u09BE\u09AE *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="\u09AA\u09C2\u09B0\u09CD\u09A3 \u09A8\u09BE\u09AE"
              data-ocid="bloodsearch.registration.name.input"
            />
          </div>
          <div className="space-y-1">
            <Label>\u09AA\u09BF\u09A4\u09BE\u09B0 \u09A8\u09BE\u09AE *</Label>
            <Input
              value={form.fatherName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fatherName: e.target.value }))
              }
              placeholder="\u09AA\u09BF\u09A4\u09BE\u09B0 \u09A8\u09BE\u09AE"
              data-ocid="bloodsearch.registration.father.input"
            />
          </div>
          <div className="space-y-1">
            <Label>
              \u09AE\u09CB\u09AC\u09BE\u0987\u09B2
              \u09A8\u09AE\u09CD\u09AC\u09B0 *
            </Label>
            <Input
              value={form.mobile}
              onChange={(e) =>
                setForm((f) => ({ ...f, mobile: e.target.value }))
              }
              placeholder="01XXXXXXXXX"
              data-ocid="bloodsearch.registration.mobile.input"
            />
          </div>
          <div className="space-y-1">
            <Label>\u09A0\u09BF\u0995\u09BE\u09A8\u09BE *</Label>
            <Input
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="\u0997\u09CD\u09B0\u09BE\u09AE, \u0989\u09AA\u099C\u09C7\u09B2\u09BE, \u099C\u09C7\u09B2\u09BE"
              data-ocid="bloodsearch.registration.address.input"
            />
          </div>
          <div className="space-y-1">
            <Label>
              \u09B0\u0995\u09CD\u09A4\u09C7\u09B0
              \u0997\u09CD\u09B0\u09C1\u09AA *
            </Label>
            <Select
              value={form.bloodGroup}
              onValueChange={(v) => setForm((f) => ({ ...f, bloodGroup: v }))}
            >
              <SelectTrigger data-ocid="bloodsearch.registration.bloodgroup.select">
                <SelectValue placeholder="\u09B0\u0995\u09CD\u09A4\u09C7\u09B0 \u0997\u09CD\u09B0\u09C1\u09AA \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8" />
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
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-ocid="bloodsearch.registration.cancel.button"
            >
              \u09AC\u09BE\u09A4\u09BF\u09B2
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              data-ocid="bloodsearch.registration.submit.button"
            >
              <Droplets size={14} className="mr-1" />
              \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8
              \u0995\u09B0\u09C1\u09A8
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BloodSearchPublicPage({ actor }: Props) {
  const orgSettings = loadSettings();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [externalDonors, setExternalDonors] =
    useState<ExternalDonor[]>(loadExternalDonors);
  const [regOpen, setRegOpen] = useState(false);

  const logoSrc =
    orgSettings.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

  const { data: members = [] } = useQuery({
    queryKey: ["members-blood-public"],
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

  return (
    <div className="min-h-screen" style={{ background: "#fef2f2" }}>
      <header className="bg-white border-b border-red-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <img
              src={logoSrc}
              alt="\u09B2\u09CB\u0997\u09CB"
              className="h-14 w-14 object-contain flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <div className="text-2xl font-bold leading-tight">
                <span style={{ color: "#0f766e" }}>{orgSettings.orgName1}</span>{" "}
                <span style={{ color: "#b91c1c" }}>{orgSettings.orgName2}</span>
              </div>
              <div className="text-xs text-gray-500">{orgSettings.tagline}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "#fee2e2" }}
            >
              <Droplets size={20} style={{ color: "#b91c1c" }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: "#b91c1c" }}>
                \u09B0\u0995\u09CD\u09A4
                \u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8
              </h1>
              <p className="text-xs text-gray-500">
                \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8\u09C0\u09AF\u09BC
                \u09B0\u0995\u09CD\u09A4\u09C7\u09B0
                \u0997\u09CD\u09B0\u09C1\u09AA
                \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8
                \u0995\u09B0\u09C1\u09A8 \u098F\u09AC\u0982
                \u09A6\u09BE\u09A4\u09BE\u09B0 \u09B8\u09BE\u09A5\u09C7
                \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997
                \u0995\u09B0\u09C1\u09A8
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            \u09B0\u0995\u09CD\u09A4\u09C7\u09B0 \u0997\u09CD\u09B0\u09C1\u09AA
            \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8
            \u0995\u09B0\u09C1\u09A8
          </h2>
          <div className="grid grid-cols-4 gap-2.5">
            {BLOOD_GROUPS.map((g) => {
              const s = getBloodStyle(g);
              const count = allDonors.filter((d) => d.bloodGroup === g).length;
              const isSelected = selectedGroup === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroup(isSelected ? "" : g)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all"
                  style={{
                    background: isSelected ? s.bg : "#ffffff",
                    borderColor: isSelected ? s.text : "#f3f4f6",
                    color: isSelected ? s.text : "#6b7280",
                  }}
                  data-ocid={`bloodsearch.bloodgroup.${g.replace("+", "pos").replace("-", "neg")}.button`}
                >
                  <span className="text-xl font-bold">{g}</span>
                  <span className="text-xs mt-0.5 font-normal">
                    {count} \u099C\u09A8
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedGroup && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold px-3 py-1.5 rounded-full"
                style={{
                  background: getBloodStyle(selectedGroup).bg,
                  color: getBloodStyle(selectedGroup).text,
                }}
              >
                {selectedGroup}
              </span>
              <span className="text-sm text-gray-600">
                {results.length === 0
                  ? "\u0995\u09CB\u09A8\u09CB \u09B0\u0995\u09CD\u09A4\u09A6\u09BE\u09A4\u09BE \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF"
                  : `${results.length} \u099C\u09A8 \u09B0\u0995\u09CD\u09A4\u09A6\u09BE\u09A4\u09BE \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u0997\u09C7\u099B\u09C7`}
              </span>
            </div>
            {results.length === 0 ? (
              <div
                className="bg-white rounded-2xl p-10 text-center border border-red-100"
                data-ocid="bloodsearch.empty_state"
              >
                <Droplets
                  size={40}
                  className="mx-auto mb-3 opacity-20 text-red-400"
                />
                <p className="text-gray-500 text-sm">
                  \u098F\u0987 \u0997\u09CD\u09B0\u09C1\u09AA\u09C7\u09B0
                  \u0995\u09CB\u09A8\u09CB
                  \u09B0\u0995\u09CD\u09A4\u09A6\u09BE\u09A4\u09BE
                  \u09A8\u09C7\u0987
                </p>
                <Button
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => setRegOpen(true)}
                  data-ocid="bloodsearch.empty.register.button"
                >
                  <UserPlus size={14} className="mr-1.5" />
                  \u09AA\u09CD\u09B0\u09A5\u09AE
                  \u09B0\u0995\u09CD\u09A4\u09A6\u09BE\u09A4\u09BE \u09B9\u09A8
                </Button>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                data-ocid="bloodsearch.list"
              >
                {results.map((donor, i) => (
                  <DonorCard key={donor.id} donor={donor} index={i + 1} />
                ))}
              </div>
            )}
          </div>
        )}

        {!selectedGroup && (
          <div
            className="bg-white rounded-2xl p-10 text-center border border-red-100"
            data-ocid="bloodsearch.prompt_state"
          >
            <Droplets
              size={48}
              className="mx-auto mb-3 opacity-15 text-red-400"
            />
            <p className="text-gray-500">
              \u0989\u09AA\u09B0 \u09A5\u09C7\u0995\u09C7
              \u098F\u0995\u099F\u09BF \u09B0\u0995\u09CD\u09A4\u09C7\u09B0
              \u0997\u09CD\u09B0\u09C1\u09AA
              \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8
              \u0995\u09B0\u09C1\u09A8
            </p>
            <p className="text-xs text-gray-400 mt-1">
              \u09AE\u09BF\u09B2\u09C7 \u0997\u09C7\u09B2\u09C7
              \u09A6\u09BE\u09A4\u09BE\u09B0 \u09A8\u09BE\u09AE,
              \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u0993
              \u09AE\u09CB\u09AC\u09BE\u0987\u09B2
              \u09A8\u09AE\u09CD\u09AC\u09B0
              \u09A6\u09C7\u0996\u09BE\u09AC\u09C7
            </p>
          </div>
        )}

        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: "linear-gradient(135deg,#dc2626 0%,#991b1b 100%)",
          }}
        >
          <Droplets size={32} className="mx-auto mb-2 text-white/70" />
          <h3 className="text-white font-bold text-base mb-1">
            \u09B0\u0995\u09CD\u09A4\u09A6\u09BE\u09A4\u09BE \u09B9\u09A4\u09C7
            \u099A\u09BE\u09A8?
          </h3>
          <p className="text-red-200 text-xs mb-4">
            \u0986\u09AA\u09A8\u09BE\u09B0 \u09A4\u09A5\u09CD\u09AF
            \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8 \u2014
            \u099C\u09B0\u09C1\u09B0\u09BF
            \u09AE\u09C1\u09B9\u09C2\u09B0\u09CD\u09A4\u09C7
            \u0986\u09AA\u09A8\u09BF\u0993 \u099C\u09C0\u09AC\u09A8
            \u09AC\u09BE\u0981\u099A\u09BE\u09A4\u09C7
            \u09AA\u09BE\u09B0\u09C7\u09A8
          </p>
          <Button
            onClick={() => setRegOpen(true)}
            className="bg-white text-red-700 hover:bg-red-50 font-semibold"
            data-ocid="bloodsearch.register.open_modal_button"
          >
            <UserPlus size={16} className="mr-2" />
            \u09B0\u0995\u09CD\u09A4\u09A6\u09BE\u09A4\u09BE
            \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7
            \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u0995\u09B0\u09C1\u09A8
          </Button>
        </div>

        <div className="text-center text-xs text-gray-400 pb-4">
          <p>
            © {new Date().getFullYear()}{" "}
            <span style={{ color: "#0f766e", fontWeight: 600 }}>
              {orgSettings.orgName1}
            </span>{" "}
            <span style={{ color: "#b91c1c", fontWeight: 600 }}>
              {orgSettings.orgName2}
            </span>
            {" — "}
            {orgSettings.address}
          </p>
          <p className="mt-1">
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
      </main>

      <RegModal
        open={regOpen}
        onClose={() => setRegOpen(false)}
        onDone={() => setExternalDonors(loadExternalDonors())}
      />
      <Toaster />
    </div>
  );
}
