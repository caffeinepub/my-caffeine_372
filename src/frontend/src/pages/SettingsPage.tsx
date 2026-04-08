import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Building2,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend.d";
import ModuleHeader from "../components/ModuleHeader";
import {
  DEFAULT_SUPER_ADMIN_EMAIL,
  DEFAULT_SUPER_ADMIN_PASSWORD,
  addAdmin,
  getAdmins,
  getSuperAdmin,
  loginAdmin,
  removeAdmin,
  resetSuperAdminToDefault,
  updateSuperAdmin,
} from "../store/adminAuthStore";
import {
  type OrgSettings,
  loadSettings,
  saveSettings,
} from "../store/settingsStore";

interface Props {
  onSave: () => void;
  isSuperAdmin?: boolean;
  actor?: backendInterface | null;
}

export default function SettingsPage({ onSave, isSuperAdmin, actor }: Props) {
  const [settings, setSettings] = useState<OrgSettings>(loadSettings);
  const [original] = useState<OrgSettings>(loadSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  // Backup & Restore state
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [restoreMsg, setRestoreMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<string | null>(
    null,
  );
  const lastBackupDate = localStorage.getItem("apon_last_backup_date");

  // Super admin credentials form
  const superAdmin = getSuperAdmin();
  const [saEmail, setSaEmail] = useState(superAdmin?.email ?? "");
  const [saPassword, setSaPassword] = useState("");
  const [saConfirm, setSaConfirm] = useState("");
  const [saShowPass, setSaShowPass] = useState(false);
  const [saShowConfirm, setSaShowConfirm] = useState(false);
  const [saError, setSaError] = useState("");

  // Password reset with current password verification
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Admin list
  const [admins, setAdmins] = useState(() => getAdmins());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [addError, setAddError] = useState("");

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setSettings((s) => ({ ...s, logoDataUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    saveSettings(settings);
    toast.success("সেটিং সংরক্ষণ করা হয়েছে");
    // Sync new logo to service worker for PWA icon
    if (settings.logoDataUrl && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage({
          type: "UPDATE_LOGO",
          logoDataUrl: settings.logoDataUrl,
        });
      });
    }
    onSave();
  }

  function handleSuperAdminUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaError("");
    setResetSuccess(false);
    const currentSA = getSuperAdmin();
    if (!currentSA) {
      setSaError("সুপার এডমিন পাওয়া যায়নি");
      return;
    }
    // Verify current password
    if (!currentPassword) {
      setSaError("বর্তমান পাসওয়ার্ড দিন");
      return;
    }
    const verified = loginAdmin(currentSA.email, currentPassword);
    if (!verified) {
      setSaError("বর্তমান পাসওয়ার্ড সঠিক নয়");
      return;
    }
    if (!saEmail) {
      setSaError("ইমেইল আবশ্যক");
      return;
    }
    if (saPassword.length < 6) {
      setSaError("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    if (saPassword !== saConfirm) {
      setSaError("নতুন পাসওয়ার্ড মিলছে না");
      return;
    }
    updateSuperAdmin(saEmail, saPassword);
    setCurrentPassword("");
    setSaPassword("");
    setSaConfirm("");
    setResetSuccess(true);
    toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে");
  }

  function handleResetToDefault() {
    resetSuperAdminToDefault();
    setSaEmail(DEFAULT_SUPER_ADMIN_EMAIL);
    setCurrentPassword("");
    setSaPassword("");
    setSaConfirm("");
    setSaError("");
    setResetSuccess(true);
    toast.success(
      `ডিফল্ট পাসওয়ার্ড রিসেট হয়েছে। ইমেইল: ${DEFAULT_SUPER_ADMIN_EMAIL} | পাসওয়ার্ড: ${DEFAULT_SUPER_ADMIN_PASSWORD}`,
      { duration: 8000 },
    );
  }

  function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    if (!newAdminEmail) {
      setAddError("ইমেইল আবশ্যক");
      return;
    }
    if (newAdminPassword.length < 6) {
      setAddError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    addAdmin(newAdminEmail, newAdminPassword);
    setAdmins(getAdmins());
    setNewAdminEmail("");
    setNewAdminPassword("");
    setShowAddForm(false);
    toast.success("নতুন এডমিন যুক্ত হয়েছে");
  }

  function handleRemoveAdmin(email: string) {
    removeAdmin(email);
    setAdmins(getAdmins());
    toast.success("এডমিন মুছে ফেলা হয়েছে");
  }

  async function handleBackup() {
    setBackupLoading(true);
    setBackupMsg(null);
    try {
      let canisterData: unknown = {};
      if (actor) {
        const json = await actor.bulkExport();
        try {
          canisterData = JSON.parse(json);
        } catch {
          canisterData = json;
        }
      }
      const parseLocal = (key: string) => {
        try {
          return JSON.parse(localStorage.getItem(key) ?? "null");
        } catch {
          return null;
        }
      };
      const backup = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        canisterData,
        localData: {
          bloodDonors: parseLocal("bloodDonors_external"),
          settings: parseLocal("aponSettings"),
          superAdmin: parseLocal("apon_superadmin"),
          admins: parseLocal("apon_admins"),
        },
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `apon-foundation-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      const now = new Date().toLocaleString("bn-BD");
      localStorage.setItem("apon_last_backup_date", now);
      setBackupMsg({ type: "success", text: "✅ ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!" });
    } catch (err) {
      setBackupMsg({
        type: "error",
        text: `❌ ব্যাকআপ ব্যর্থ হয়েছে: ${String(err)}`,
      });
    } finally {
      setBackupLoading(false);
    }
  }

  function handleRestoreFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setPendingRestoreData(content);
      setShowRestoreConfirm(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleRestoreConfirm() {
    if (!pendingRestoreData) return;
    setRestoreLoading(true);
    setRestoreMsg(null);
    setShowRestoreConfirm(false);
    try {
      let backup: {
        version?: string;
        canisterData?: unknown;
        localData?: {
          bloodDonors?: unknown;
          settings?: unknown;
          superAdmin?: unknown;
          admins?: unknown;
        };
      };
      try {
        backup = JSON.parse(pendingRestoreData);
      } catch {
        throw new Error("ফাইলটি বৈধ JSON নয়");
      }
      if (!backup.version || !backup.canisterData) {
        throw new Error("ফাইলটি সঠিক ব্যাকআপ ফর্ম্যাটে নেই");
      }
      // Restore canister data
      let counts = "";
      if (actor && backup.canisterData) {
        const result = await actor.bulkImport(
          JSON.stringify(backup.canisterData),
        );
        if (!result.success) throw new Error(result.message);
        counts = result.counts;
      }
      // Restore localStorage
      const ld = backup.localData ?? {};
      if (ld.bloodDonors !== null && ld.bloodDonors !== undefined)
        localStorage.setItem(
          "bloodDonors_external",
          JSON.stringify(ld.bloodDonors),
        );
      if (ld.settings !== null && ld.settings !== undefined)
        localStorage.setItem("aponSettings", JSON.stringify(ld.settings));
      if (ld.superAdmin !== null && ld.superAdmin !== undefined)
        localStorage.setItem("apon_superadmin", JSON.stringify(ld.superAdmin));
      if (ld.admins !== null && ld.admins !== undefined)
        localStorage.setItem("apon_admins", JSON.stringify(ld.admins));

      setRestoreMsg({
        type: "success",
        text: `✅ রিস্টোর সফল হয়েছে! ${counts || ""} পেজ ২ সেকেন্ডে রিলোড হবে।`,
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setRestoreMsg({
        type: "error",
        text: `❌ রিস্টোর ব্যর্থ হয়েছে: ${String(err)}`,
      });
    } finally {
      setRestoreLoading(false);
      setPendingRestoreData(null);
    }
  }

  const logoSrc =
    settings.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

  const tabCols = isSuperAdmin ? "grid-cols-4" : "grid-cols-3";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <ModuleHeader
        title="সেটিং"
        subtitle="সংগঠনের তথ্য ও এডমিন ব্যবস্থাপনা"
        icon={<Building2 size={22} />}
      />
      <div className="flex items-center justify-between">
        <div />
        {hasChanges && (
          <Button
            onClick={handleSave}
            style={{ background: "#1a4d2e" }}
            className="text-white gap-2"
            data-ocid="settings.save_button"
          >
            <Save size={16} />
            সেটিং সংরক্ষণ করুন
          </Button>
        )}
      </div>

      <Tabs defaultValue="identity">
        <TabsList className={`grid w-full ${tabCols} mb-4`}>
          <TabsTrigger value="identity" data-ocid="settings.identity.tab">
            সংগঠনের পরিচয়
          </TabsTrigger>
          <TabsTrigger value="contact" data-ocid="settings.contact.tab">
            যোগাযোগ তথ্য
          </TabsTrigger>
          <TabsTrigger value="admin" data-ocid="settings.admin.tab">
            অ্যাডমিন তথ্য
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="adminmgmt" data-ocid="settings.adminmgmt.tab">
              এডমিন ব্যবস্থাপনা
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab 1: Identity */}
        <TabsContent value="identity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: "#1a4d2e" }}>
                লোগো
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-36 h-36 border-2 border-dashed border-border rounded-full flex items-center justify-center overflow-hidden bg-muted hover:border-primary/50 transition-colors flex-shrink-0"
                  data-ocid="settings.upload_button"
                  title="লোগো আপলোড করুন"
                >
                  {settings.logoDataUrl ? (
                    <img
                      src={settings.logoDataUrl}
                      alt="প্রতিষ্ঠানের লোগো"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Building2 size={32} />
                      <span className="text-xs text-center">লোগো নেই</span>
                    </div>
                  )}
                </button>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG বা SVG ফাইল আপলোড করুন (সর্বোচ্চ ২ MB)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5"
                      data-ocid="settings.upload_button"
                    >
                      <Upload size={14} />
                      লোগো পরিবর্তন করুন
                    </Button>
                    {settings.logoDataUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSettings((s) => ({ ...s, logoDataUrl: "" }))
                        }
                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                        data-ocid="settings.delete_button"
                      >
                        <X size={14} />
                        লোগো সরান
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: "#1a4d2e" }}>
                সংগঠনের নাম ও রঙ
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>সংগঠনের নাম (১ম অংশ)</Label>
                <Input
                  value={settings.orgName1}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, orgName1: e.target.value }))
                  }
                  placeholder="আপন"
                  data-ocid="settings.org_name1.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>নাম রঙ (১ম অংশ)</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.color1}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, color1: e.target.value }))
                    }
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                    data-ocid="settings.color1.input"
                  />
                  <Input
                    value={settings.color1}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, color1: e.target.value }))
                    }
                    className="font-mono uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>সংগঠনের নাম (২য় অংশ)</Label>
                <Input
                  value={settings.orgName2}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, orgName2: e.target.value }))
                  }
                  placeholder="ফাউন্ডেশন"
                  data-ocid="settings.org_name2.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>নাম রঙ (২য় অংশ)</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.color2}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, color2: e.target.value }))
                    }
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                    data-ocid="settings.color2.input"
                  />
                  <Input
                    value={settings.color2}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, color2: e.target.value }))
                    }
                    className="font-mono uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>ট্যাগলাইন</Label>
                <Input
                  value={settings.tagline}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, tagline: e.target.value }))
                  }
                  placeholder="মানবসেবায় প্রতিশ্রুতিবদ্ধ"
                  data-ocid="settings.tagline.input"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                লাইভ প্রিভিউ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 flex-shrink-0 rounded-full overflow-hidden bg-white border border-border flex items-center justify-center">
                  {settings.logoDataUrl ? (
                    <img
                      src={settings.logoDataUrl}
                      alt="লোগো"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={logoSrc}
                      alt="লোগো"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                </div>
                <div>
                  <div className="text-xl font-bold leading-tight">
                    <span style={{ color: settings.color1 }}>
                      {settings.orgName1}
                    </span>{" "}
                    <span style={{ color: settings.color2 }}>
                      {settings.orgName2}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {settings.tagline}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Contact */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: "#1a4d2e" }}>
                যোগাযোগ তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>ঠিকানা</Label>
                <Input
                  value={settings.address}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, address: e.target.value }))
                  }
                  placeholder="বাংলাদেশ"
                  data-ocid="settings.address.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>ইমেইল</Label>
                <Input
                  value={settings.email}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, email: e.target.value }))
                  }
                  placeholder="info@example.org"
                  type="email"
                  data-ocid="settings.email.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>হোয়াটসঅ্যাপ</Label>
                <Input
                  value={settings.whatsapp}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, whatsapp: e.target.value }))
                  }
                  placeholder="+880 1700-000000"
                  data-ocid="settings.whatsapp.input"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>ওয়েবসাইট</Label>
                <Input
                  value={settings.website}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, website: e.target.value }))
                  }
                  placeholder="www.example.org"
                  data-ocid="settings.website.input"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Admin Info */}
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: "#1a4d2e" }}>
                অ্যাডমিন তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <div className="flex gap-3 items-start bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  এডমিন একাউন্ট পরিচালনার জন্য <strong>এডমিন ব্যবস্থাপনা</strong> ট্যাবে
                  যান। সেখান থেকে সুপার এডমিনের ইমেইল ও পাসওয়ার্ড পরিবর্তন করা এবং নতুন
                  এডমিন যোগ করা যাবে।
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Admin Management (super admin only) */}
        {isSuperAdmin && (
          <TabsContent value="adminmgmt" className="space-y-6">
            {/* Section 1: Super Admin credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base" style={{ color: "#1a4d2e" }}>
                  পাসওয়ার্ড রিসেট
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Default credentials info box */}
                <div
                  className="rounded-lg p-3 mb-4 text-xs space-y-1"
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    color: "#166534",
                  }}
                >
                  <p className="font-semibold">ডিফল্ট সুপার এডমিন তথ্য:</p>
                  <p>ইমেইল: {DEFAULT_SUPER_ADMIN_EMAIL}</p>
                  <p>পাসওয়ার্ড: {DEFAULT_SUPER_ADMIN_PASSWORD}</p>
                </div>

                <form onSubmit={handleSuperAdminUpdate} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sa-email">ইমেইল আইডি</Label>
                    <input
                      id="sa-email"
                      type="email"
                      value={saEmail}
                      onChange={(e) => setSaEmail(e.target.value)}
                      placeholder="admin@aponfoundation.org"
                      required
                      className="w-full px-3 py-2 rounded-md border text-sm"
                      style={{
                        borderColor: "#d1d5db",
                        background: "#f9fafb",
                        color: "#111827",
                      }}
                      data-ocid="settings.sa_email.input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sa-current-password">বর্তমান পাসওয়ার্ড</Label>
                    <div className="relative">
                      <input
                        id="sa-current-password"
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="বর্তমান পাসওয়ার্ড দিন"
                        className="w-full px-3 py-2 pr-10 rounded-md border text-sm"
                        style={{
                          borderColor: "#d1d5db",
                          background: "#f9fafb",
                          color: "#111827",
                        }}
                        data-ocid="settings.sa_current_password.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPass ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sa-password">নতুন পাসওয়ার্ড</Label>
                    <div className="relative">
                      <input
                        id="sa-password"
                        type={saShowPass ? "text" : "password"}
                        value={saPassword}
                        onChange={(e) => setSaPassword(e.target.value)}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        required
                        className="w-full px-3 py-2 pr-10 rounded-md border text-sm"
                        style={{
                          borderColor: "#d1d5db",
                          background: "#f9fafb",
                          color: "#111827",
                        }}
                        data-ocid="settings.sa_password.input"
                      />
                      <button
                        type="button"
                        onClick={() => setSaShowPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {saShowPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sa-confirm">নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
                    <div className="relative">
                      <input
                        id="sa-confirm"
                        type={saShowConfirm ? "text" : "password"}
                        value={saConfirm}
                        onChange={(e) => setSaConfirm(e.target.value)}
                        placeholder="পাসওয়ার্ড পুনরায় দিন"
                        required
                        className="w-full px-3 py-2 pr-10 rounded-md border text-sm"
                        style={{
                          borderColor: "#d1d5db",
                          background: "#f9fafb",
                          color: "#111827",
                        }}
                        data-ocid="settings.sa_confirm.input"
                      />
                      <button
                        type="button"
                        onClick={() => setSaShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {saShowConfirm ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {saError && (
                    <p
                      className="text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                      style={{ color: "#dc2626" }}
                      data-ocid="settings.sa.error_state"
                    >
                      ⚠️ {saError}
                    </p>
                  )}
                  {resetSuccess && (
                    <p
                      className="text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                      style={{ color: "#166534" }}
                      data-ocid="settings.sa.success_state"
                    >
                      ✅ পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <Button
                      type="submit"
                      style={{ background: "#1a4d2e" }}
                      className="text-white gap-2 flex-1"
                      data-ocid="settings.sa.save_button"
                    >
                      <Save size={16} />
                      পাসওয়ার্ড পরিবর্তন করুন
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetToDefault}
                      className="gap-2 flex-1"
                      style={{ borderColor: "#dc2626", color: "#dc2626" }}
                      data-ocid="settings.sa.reset_default_button"
                    >
                      <AlertTriangle size={16} />
                      ডিফল্ট পাসওয়ার্ড রিসেট
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Section 2: Admin list */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base" style={{ color: "#1a4d2e" }}>
                  এডমিন তালিকা
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setShowAddForm((v) => !v);
                    setAddError("");
                  }}
                  style={{ background: "#1a4d2e" }}
                  className="text-white gap-1.5"
                  data-ocid="settings.add_admin.button"
                >
                  <Plus size={14} />
                  নতুন এডমিন যুক্ত করুন
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAddForm && (
                  <form
                    onSubmit={handleAddAdmin}
                    className="bg-muted/50 border border-border rounded-lg p-4 space-y-3"
                    data-ocid="settings.add_admin.panel"
                  >
                    <h3 className="text-sm font-semibold">নতুন এডমিন যোগ করুন</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="new-admin-email">ইমেইল আইডি</Label>
                      <Input
                        id="new-admin-email"
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin2@example.org"
                        required
                        data-ocid="settings.new_admin_email.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="new-admin-password">পাসওয়ার্ড</Label>
                      <div className="relative">
                        <Input
                          id="new-admin-password"
                          type={showNewPass ? "text" : "password"}
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="কমপক্ষে ৬ অক্ষর"
                          required
                          className="pr-10"
                          data-ocid="settings.new_admin_password.input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPass ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                    {addError && (
                      <p
                        className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                        data-ocid="settings.add_admin.error_state"
                      >
                        {addError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        style={{ background: "#1a4d2e" }}
                        className="text-white"
                        data-ocid="settings.add_admin.submit_button"
                      >
                        যুক্ত করুন
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          setAddError("");
                        }}
                        data-ocid="settings.add_admin.cancel_button"
                      >
                        বাতিল
                      </Button>
                    </div>
                  </form>
                )}

                {admins.length === 0 ? (
                  <p
                    className="text-sm text-muted-foreground text-center py-6"
                    data-ocid="settings.admins.empty_state"
                  >
                    কোনো এডমিন যুক্ত করা হয়নি
                  </p>
                ) : (
                  <div className="space-y-2" data-ocid="settings.admins.list">
                    {admins.map((admin, idx) => (
                      <div
                        key={admin.email}
                        className="flex items-center justify-between px-4 py-3 bg-white border border-border rounded-lg"
                        data-ocid={`settings.admin.item.${idx + 1}`}
                      >
                        <div>
                          <p className="text-sm font-medium">{admin.email}</p>
                          <p className="text-xs text-muted-foreground">এডমিন</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdmin(admin.email)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="মুছুন"
                          data-ocid={`settings.admin.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Backup & Restore Section */}
      <div
        className="rounded-xl border-2 p-6 space-y-4"
        style={{ background: "#0f2d1a", borderColor: "#D4AF37" }}
        data-ocid="settings.backup_restore.section"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💾</span>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#D4AF37" }}>
              ডেটা ব্যাকআপ ও রিস্টোর
            </h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              সব মডিউলের ডেটা একটি ফাইলে ব্যাকআপ করুন এবং প্রয়োজনে ফিরিয়ে আনুন
            </p>
          </div>
        </div>
        {lastBackupDate && (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            শেষ ব্যাকআপ: {lastBackupDate}
          </p>
        )}
        <Separator style={{ background: "rgba(212,175,55,0.3)" }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Backup */}
          <div
            className="rounded-lg p-4 space-y-3"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <h3 className="font-semibold text-sm" style={{ color: "#D4AF37" }}>
              📤 ব্যাকআপ করুন
            </h3>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              সদস্য, আর্থিক তথ্য, নোটিশ, রেজুলেশন, বংশপরম্পরা ও রক্তদাতা তালিকা সহ সব ডেটা
              একটি ফাইলে সংরক্ষণ করুন।
            </p>
            <Button
              onClick={handleBackup}
              disabled={backupLoading}
              className="w-full gap-2 font-semibold"
              style={{ background: "#1a6b35", color: "white" }}
              data-ocid="settings.backup.button"
            >
              {backupLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {backupLoading ? "ব্যাকআপ হচ্ছে..." : "সম্পূর্ণ ডেটা ব্যাকআপ করুন"}
            </Button>
            {backupMsg && (
              <p
                className="text-xs rounded px-3 py-2"
                style={{
                  background:
                    backupMsg.type === "success"
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(239,68,68,0.15)",
                  color: backupMsg.type === "success" ? "#4ade80" : "#f87171",
                  border: `1px solid ${backupMsg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                }}
                data-ocid="settings.backup.status"
              >
                {backupMsg.text}
              </p>
            )}
          </div>

          {/* Restore */}
          <div
            className="rounded-lg p-4 space-y-3"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <h3 className="font-semibold text-sm" style={{ color: "#D4AF37" }}>
              📥 রিস্টোর করুন
            </h3>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              পূর্বে নেওয়া ব্যাকআপ ফাইল (.json) আপলোড করে সব ডেটা পুনরুদ্ধার করুন।
            </p>
            <Button
              onClick={() => restoreFileInputRef.current?.click()}
              disabled={restoreLoading}
              className="w-full gap-2 font-semibold"
              style={{ background: "#b45309", color: "white" }}
              data-ocid="settings.restore.button"
            >
              {restoreLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {restoreLoading ? "রিস্টোর হচ্ছে..." : "ব্যাকআপ থেকে রিস্টোর করুন"}
            </Button>
            <input
              ref={restoreFileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleRestoreFileSelect}
            />
            {restoreMsg && (
              <p
                className="text-xs rounded px-3 py-2"
                style={{
                  background:
                    restoreMsg.type === "success"
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(239,68,68,0.15)",
                  color: restoreMsg.type === "success" ? "#4ade80" : "#f87171",
                  border: `1px solid ${restoreMsg.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                }}
                data-ocid="settings.restore.status"
              >
                {restoreMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          data-ocid="settings.restore_confirm.modal"
        >
          <div
            className="w-full max-w-md rounded-xl p-6 space-y-4 shadow-2xl"
            style={{ background: "#0f2d1a", border: "2px solid #D4AF37" }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle
                size={24}
                style={{ color: "#f59e0b", flexShrink: 0 }}
              />
              <h3 className="text-lg font-bold" style={{ color: "#D4AF37" }}>
                সতর্কতা
              </h3>
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
              রিস্টোর করলে বর্তমান সব ডেটা মুছে যাবে এবং ব্যাকআপের ডেটা দিয়ে প্রতিস্থাপিত
              হবে। আপনি কি নিশ্চিত?
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleRestoreConfirm}
                className="flex-1 font-semibold"
                style={{ background: "#b45309", color: "white" }}
                data-ocid="settings.restore_confirm.yes_button"
              >
                হ্যাঁ, রিস্টোর করুন
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRestoreConfirm(false);
                  setPendingRestoreData(null);
                }}
                className="flex-1"
                style={{
                  borderColor: "rgba(212,175,55,0.4)",
                  color: "rgba(255,255,255,0.8)",
                }}
                data-ocid="settings.restore_confirm.cancel_button"
              >
                বাতিল
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-6">
        <Button
          onClick={handleSave}
          style={{ background: hasChanges ? "#1a4d2e" : undefined }}
          className="w-full sm:w-auto text-white gap-2"
          disabled={!hasChanges}
          data-ocid="settings.submit_button"
        >
          <Save size={16} />
          সেটিং সংরক্ষণ করুন
        </Button>
      </div>
    </div>
  );
}
