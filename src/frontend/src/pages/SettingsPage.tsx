import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Info, Save, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  type OrgSettings,
  loadSettings,
  saveSettings,
} from "../store/settingsStore";

interface Props {
  onSave: () => void;
}

export default function SettingsPage({ onSave }: Props) {
  const [settings, setSettings] = useState<OrgSettings>(loadSettings);
  const [original] = useState<OrgSettings>(loadSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const logoSrc =
    settings.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

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
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="identity" data-ocid="settings.identity.tab">
            সংগঠনের পরিচয়
          </TabsTrigger>
          <TabsTrigger value="contact" data-ocid="settings.contact.tab">
            যোগাযোগ তথ্য
          </TabsTrigger>
          <TabsTrigger value="admin" data-ocid="settings.admin.tab">
            অ্যাডমিন তথ্য
          </TabsTrigger>
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
                {/* Logo box */}
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

          {/* Live Preview */}
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
                <Info
                  size={18}
                  className="text-blue-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-blue-800">
                  অ্যাডমিন রোল পরিবর্তন করতে আপনার <strong>Principal ID</strong>{" "}
                  শেয়ার করুন। Internet Identity দিয়ে লগইন করার পর ড্যাশবোর্ডের উপরে
                  আপনার Principal ID দেখা যাবে। সেটি কপি করে অ্যাডমিনকে পাঠান।
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Save Button (mobile-friendly) */}
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
