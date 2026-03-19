import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  addAdmin,
  getAdmins,
  getSuperAdmin,
  removeAdmin,
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
}

export default function SettingsPage({ onSave, isSuperAdmin }: Props) {
  const [settings, setSettings] = useState<OrgSettings>(loadSettings);
  const [original] = useState<OrgSettings>(loadSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Super admin credentials form
  const superAdmin = getSuperAdmin();
  const [saEmail, setSaEmail] = useState(superAdmin?.email ?? "");
  const [saPassword, setSaPassword] = useState("");
  const [saConfirm, setSaConfirm] = useState("");
  const [saShowPass, setSaShowPass] = useState(false);
  const [saShowConfirm, setSaShowConfirm] = useState(false);
  const [saError, setSaError] = useState("");

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
    onSave();
  }

  function handleSuperAdminUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaError("");
    if (!saEmail) {
      setSaError("ইমেইল আবশ্যক");
      return;
    }
    if (saPassword.length < 6) {
      setSaError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    if (saPassword !== saConfirm) {
      setSaError("পাসওয়ার্ড মিলছে না");
      return;
    }
    updateSuperAdmin(saEmail, saPassword);
    setSaPassword("");
    setSaConfirm("");
    toast.success("সুপার এডমিন তথ্য আপডেট হয়েছে");
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

  const logoSrc =
    settings.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

  const tabCols = isSuperAdmin ? "grid-cols-4" : "grid-cols-3";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">সেটিং</h1>
        {hasChanges && (
          <Button
            onClick={handleSave}
            style={{ background: "#1a6b2a" }}
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
              <CardTitle className="text-base" style={{ color: "#1a6b2a" }}>
                লোগো
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-36 h-36 border-2 border-dashed border-border rounded-xl flex items-center justify-center overflow-hidden bg-muted hover:border-primary/50 transition-colors flex-shrink-0"
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
              <CardTitle className="text-base" style={{ color: "#1a6b2a" }}>
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
                <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-border flex items-center justify-center">
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
              <CardTitle className="text-base" style={{ color: "#1a6b2a" }}>
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
              <CardTitle className="text-base" style={{ color: "#1a6b2a" }}>
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
                <CardTitle className="text-base" style={{ color: "#1a6b2a" }}>
                  সুপার এডমিন একাউন্ট
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSuperAdminUpdate} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sa-email">নতুন ইমেইল আইডি</Label>
                    <Input
                      id="sa-email"
                      type="email"
                      value={saEmail}
                      onChange={(e) => setSaEmail(e.target.value)}
                      placeholder="admin@aponfoundation.org"
                      required
                      data-ocid="settings.sa_email.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sa-password">নতুন পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Input
                        id="sa-password"
                        type={saShowPass ? "text" : "password"}
                        value={saPassword}
                        onChange={(e) => setSaPassword(e.target.value)}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        required
                        className="pr-10"
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
                    <Label htmlFor="sa-confirm">পাসওয়ার্ড নিশ্চিত করুন</Label>
                    <div className="relative">
                      <Input
                        id="sa-confirm"
                        type={saShowConfirm ? "text" : "password"}
                        value={saConfirm}
                        onChange={(e) => setSaConfirm(e.target.value)}
                        placeholder="পাসওয়ার্ড পুনরায় দিন"
                        required
                        className="pr-10"
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
                      className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                      data-ocid="settings.sa.error_state"
                    >
                      {saError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    style={{ background: "#1a6b2a" }}
                    className="text-white gap-2"
                    data-ocid="settings.sa.save_button"
                  >
                    <Save size={16} />
                    পরিবর্তন সংরক্ষণ করুন
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Section 2: Admin list */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base" style={{ color: "#1a6b2a" }}>
                  এডমিন তালিকা
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setShowAddForm((v) => !v);
                    setAddError("");
                  }}
                  style={{ background: "#1a6b2a" }}
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
                        style={{ background: "#1a6b2a" }}
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

      <div className="pb-6">
        <Button
          onClick={handleSave}
          style={{ background: hasChanges ? "#1a6b2a" : undefined }}
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
