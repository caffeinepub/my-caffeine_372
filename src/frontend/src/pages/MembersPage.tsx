import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  MemberStatus,
  MembershipRole,
  type backendInterface,
} from "../backend";
import type { Member } from "../backend";
import { loadSettings } from "../store/settingsStore";

// Council mapping: MembershipRole → Bengali council name
const COUNCILS = [
  { role: MembershipRole.member, label: "সাধারণ পরিষদ", tab: "sadharan" },
  {
    role: MembershipRole.board,
    label: "কার্যনির্বাহী পরিষদ",
    tab: "karyanirbahai",
  },
  { role: MembershipRole.volunteer, label: "উপদেষ্টা পরিষদ", tab: "upadeshata" },
] as const;

type CouncilTab = "sadharan" | "karyanirbahai" | "upadeshata";

// Extra fields stored in `notes` as JSON
interface MemberExtras {
  fatherName: string;
  bloodGroup: string;
  designation: string;
  currentAddress: string;
  permanentAddress: string;
  serial: number;
}

function parseExtras(notes: string): MemberExtras {
  try {
    const parsed = JSON.parse(notes);
    return {
      fatherName: parsed.fatherName ?? "",
      bloodGroup: parsed.bloodGroup ?? "",
      designation: parsed.designation ?? "",
      currentAddress: parsed.currentAddress ?? "",
      permanentAddress: parsed.permanentAddress ?? "",
      serial: parsed.serial ?? 0,
    };
  } catch {
    return {
      fatherName: "",
      bloodGroup: "",
      designation: "",
      currentAddress: "",
      permanentAddress: "",
      serial: 0,
    };
  }
}

function stringifyExtras(extras: MemberExtras): string {
  return JSON.stringify(extras);
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Seed data for first-load experience
const SEED_MEMBERS: Member[] = [
  {
    id: Principal.fromText("aaaaa-aa"),
    name: "মোহাম্মদ আবদুল করিম",
    email: "karim@example.com",
    phone: "01711-123456",
    role: MembershipRole.member,
    status: MemberStatus.active,
    joinDate: BigInt(Date.now() - 86400000 * 30),
    notes: stringifyExtras({
      fatherName: "মোহাম্মদ আবদুল রহিম",
      bloodGroup: "A+",
      designation: "সাধারণ সদস্য",
      currentAddress: "ঢাকা, বাংলাদেশ",
      permanentAddress: "রাজশাহী, বাংলাদেশ",
      serial: 1,
    }),
  },
  {
    id: Principal.fromText("aaaaa-aa"),
    name: "রাহেলা বেগম",
    email: "rahela@example.com",
    phone: "01811-234567",
    role: MembershipRole.member,
    status: MemberStatus.active,
    joinDate: BigInt(Date.now() - 86400000 * 25),
    notes: stringifyExtras({
      fatherName: "মোহাম্মদ সিরাজুল ইসলাম",
      bloodGroup: "B+",
      designation: "সহ-সভাপতি",
      currentAddress: "চট্টগ্রাম, বাংলাদেশ",
      permanentAddress: "চট্টগ্রাম, বাংলাদেশ",
      serial: 2,
    }),
  },
  {
    id: Principal.fromText("aaaaa-aa"),
    name: "ড. মাহমুদুল হাসান",
    email: "mahmud@example.com",
    phone: "01911-345678",
    role: MembershipRole.board,
    status: MemberStatus.active,
    joinDate: BigInt(Date.now() - 86400000 * 20),
    notes: stringifyExtras({
      fatherName: "আলহাজ্ব হাসানুর রহমান",
      bloodGroup: "O+",
      designation: "কার্যনির্বাহী পরিচালক",
      currentAddress: "ঢাকা, বাংলাদেশ",
      permanentAddress: "ময়মনসিংহ, বাংলাদেশ",
      serial: 1,
    }),
  },
  {
    id: Principal.fromText("aaaaa-aa"),
    name: "সালমা খানম",
    email: "salma@example.com",
    phone: "01611-456789",
    role: MembershipRole.board,
    status: MemberStatus.active,
    joinDate: BigInt(Date.now() - 86400000 * 15),
    notes: stringifyExtras({
      fatherName: "মোহাম্মদ ইউসুফ আলী",
      bloodGroup: "AB+",
      designation: "অর্থ সম্পাদক",
      currentAddress: "সিলেট, বাংলাদেশ",
      permanentAddress: "সিলেট, বাংলাদেশ",
      serial: 2,
    }),
  },
  {
    id: Principal.fromText("aaaaa-aa"),
    name: "অধ্যাপক জামাল উদ্দিন",
    email: "jamal@example.com",
    phone: "01511-567890",
    role: MembershipRole.volunteer,
    status: MemberStatus.active,
    joinDate: BigInt(Date.now() - 86400000 * 10),
    notes: stringifyExtras({
      fatherName: "মৌলানা উদ্দিন আহমেদ",
      bloodGroup: "B-",
      designation: "উপদেষ্টা",
      currentAddress: "রাজশাহী, বাংলাদেশ",
      permanentAddress: "রাজশাহী, বাংলাদেশ",
      serial: 1,
    }),
  },
  {
    id: Principal.fromText("aaaaa-aa"),
    name: "বেগম নাসরিন আক্তার",
    email: "nasrin@example.com",
    phone: "01411-678901",
    role: MembershipRole.volunteer,
    status: MemberStatus.active,
    joinDate: BigInt(Date.now() - 86400000 * 5),
    notes: stringifyExtras({
      fatherName: "হাজী মতিউর রহমান",
      bloodGroup: "A-",
      designation: "বিশেষ উপদেষ্টা",
      currentAddress: "খুলনা, বাংলাদেশ",
      permanentAddress: "খুলনা, বাংলাদেশ",
      serial: 2,
    }),
  },
];

interface FormState {
  name: string;
  fatherName: string;
  mobile: string;
  email: string;
  bloodGroup: string;
  currentAddress: string;
  permanentAddress: string;
  designation: string;
  council: MembershipRole;
}

const emptyForm: FormState = {
  name: "",
  fatherName: "",
  mobile: "",
  email: "",
  bloodGroup: "",
  currentAddress: "",
  permanentAddress: "",
  designation: "",
  council: MembershipRole.member,
};

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

/**
 * Opens a print-ready window with Bengali font support.
 * The browser handles font rendering natively — no external PDF library needed.
 * User can save as PDF from the print dialog ("Save as PDF" destination).
 */
function exportPDF(
  role: MembershipRole,
  councilLabel: string,
  members: Member[],
) {
  const orgSettings = loadSettings();
  const councilMembers = members.filter((m) => m.role === role);

  const rowsHtml = councilMembers
    .map((m, idx) => {
      const extras = parseExtras(m.notes);
      const bg = idx % 2 === 0 ? "#f0f8f0" : "#ffffff";
      const serial = extras.serial || idx + 1;
      return `<tr style="background:${bg}">
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd;text-align:center">${serial}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd">${m.name}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd">${extras.fatherName}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd">${extras.designation}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd">${m.phone}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd;text-align:center">${extras.bloodGroup}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd">${extras.currentAddress}</td>
      </tr>`;
    })
    .join("");

  const logoImgHtml = orgSettings.logoDataUrl
    ? `<img src="${orgSettings.logoDataUrl}" width="60" height="60" style="object-fit:contain" />`
    : "";

  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>${councilLabel} - সদস্য তালিকা</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&family=Hind+Siliguri:wght@400;600;700&display=block" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Sans Bengali', 'Hind Siliguri', Arial, sans-serif;
      background: #fff;
      color: #222;
      padding: 20px 28px;
    }
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
    .header { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
    .header-logo { width: 60px; height: 60px; object-fit: contain; flex-shrink: 0; }
    .header-logo-placeholder { width: 60px; height: 60px; background: #e8f5e9; border-radius: 8px; flex-shrink: 0; }
    .org-name { font-size: 22px; font-weight: 700; line-height: 1.3; }
    .org-address { font-size: 11px; color: #555; margin-top: 3px; }
    .org-contact { font-size: 10px; color: #777; margin-top: 2px; }
    hr { border: none; border-top: 1.5px solid #ccc; margin: 8px 0 12px; }
    .council-title {
      text-align: center;
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 14px;
      color: ${orgSettings.color1};
    }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: ${orgSettings.color1}; color: #fff; }
    th { padding: 6px 8px; font-size: 12px; border: 1px solid #155722; white-space: nowrap; }
    th:first-child, th:last-child { text-align: center; }
    th { text-align: left; }
    td { vertical-align: top; }
    .print-btn {
      display: block;
      margin: 16px auto 0;
      padding: 10px 32px;
      background: ${orgSettings.color1};
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-family: 'Noto Sans Bengali', 'Hind Siliguri', sans-serif;
      cursor: pointer;
    }
    .print-hint {
      text-align: center;
      font-size: 12px;
      color: #888;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    ${logoImgHtml ? `<div>${logoImgHtml}</div>` : ""}
    <div>
      <div class="org-name">
        <span style="color:${orgSettings.color1}">${orgSettings.orgName1}</span><span style="color:${orgSettings.color2}"> ${orgSettings.orgName2}</span>
      </div>
      <div class="org-address">${orgSettings.address}</div>
      <div class="org-contact">
        ${orgSettings.email ? `ইমেইল: ${orgSettings.email} &nbsp;|&nbsp;` : ""}
        ${orgSettings.whatsapp ? `হোয়াটসঅ্যাপ: ${orgSettings.whatsapp} &nbsp;|&nbsp;` : ""}
        ${orgSettings.website ? `ওয়েব: ${orgSettings.website}` : ""}
      </div>
    </div>
  </div>
  <hr />
  <div class="council-title">${councilLabel} - সদস্য তালিকা</div>
  <table>
    <thead>
      <tr>
        <th style="text-align:center">ক্র.নং</th>
        <th>নাম</th>
        <th>পিতার নাম</th>
        <th>পদবী</th>
        <th>মোবাইল</th>
        <th style="text-align:center">রক্তের গ্রুপ</th>
        <th>ঠিকানা</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <div class="no-print" style="margin-top:20px;text-align:center">
    <button class="print-btn" onclick="window.print()">PDF সংরক্ষণ / প্রিন্ট করুন</button>
    <p class="print-hint">প্রিন্ট ডায়ালগে "Destination" থেকে "Save as PDF" বেছে নিন</p>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("পপআপ ব্লক করা আছে। অনুগ্রহ করে পপআপ অনুমতি দিন।");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Auto-trigger print after fonts load
  printWindow.onload = () => {
    printWindow.focus();
  };
}

export default function MembersPage({ actor, isAdmin }: Props) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<CouncilTab>("sadharan");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const { data: members = SEED_MEMBERS, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) return SEED_MEMBERS;
      const list = await actor.getAllMembers();
      return list.length > 0 ? list : SEED_MEMBERS;
    },
    enabled: !!actor,
  });

  // Compute next serial per council
  function getNextSerial(role: MembershipRole): number {
    const councilMembers = members.filter((m) => m.role === role);
    return councilMembers.length + 1;
  }

  const addMutation = useMutation({
    mutationFn: async (f: FormState) => {
      if (!actor) throw new Error("No actor");
      const serial = getNextSerial(f.council);
      const extras: MemberExtras = {
        fatherName: f.fatherName,
        bloodGroup: f.bloodGroup,
        designation: f.designation,
        currentAddress: f.currentAddress,
        permanentAddress: f.permanentAddress,
        serial,
      };
      const member: Member = {
        id: Principal.anonymous(),
        name: f.name,
        email: f.email,
        phone: f.mobile,
        role: f.council,
        status: MemberStatus.active,
        joinDate: BigInt(Date.now()),
        notes: stringifyExtras(extras),
      };
      await actor.addMember(member);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("সদস্য যোগ করা হয়েছে");
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("সদস্য যোগ করতে ব্যর্থ হয়েছে"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ member, f }: { member: Member; f: FormState }) => {
      if (!actor) throw new Error("No actor");
      const existingExtras = parseExtras(member.notes);
      const extras: MemberExtras = {
        fatherName: f.fatherName,
        bloodGroup: f.bloodGroup,
        designation: f.designation,
        currentAddress: f.currentAddress,
        permanentAddress: f.permanentAddress,
        serial: existingExtras.serial,
      };
      const updated: Member = {
        ...member,
        name: f.name,
        email: f.email,
        phone: f.mobile,
        role: f.council,
        notes: stringifyExtras(extras),
      };
      await actor.updateMember(member.id, updated);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("সদস্য তথ্য আপডেট হয়েছে");
      setDialogOpen(false);
      setEditMember(null);
      setForm(emptyForm);
    },
    onError: () => toast.error("আপডেট ব্যর্থ হয়েছে"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: Principal) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteMember(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("সদস্য মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
    },
    onError: () => toast.error("মুছে ফেলতে ব্যর্থ হয়েছে"),
  });

  function openAdd() {
    setEditMember(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(m: Member) {
    const extras = parseExtras(m.notes);
    setEditMember(m);
    setForm({
      name: m.name,
      fatherName: extras.fatherName,
      mobile: m.phone,
      email: m.email,
      bloodGroup: extras.bloodGroup,
      currentAddress: extras.currentAddress,
      permanentAddress: extras.permanentAddress,
      designation: extras.designation,
      council: m.role,
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("সদস্যের নাম আবশ্যক");
      return;
    }
    if (editMember) {
      updateMutation.mutate({ member: editMember, f: form });
    } else {
      addMutation.mutate(form);
    }
  }

  function getMembersByRole(role: MembershipRole) {
    return members.filter((m) => m.role === role);
  }

  const isMutating = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">সদস্য তালিকা</h1>
        {isAdmin && (
          <Button
            onClick={openAdd}
            style={{ background: "#1a6b2a" }}
            className="text-white"
            data-ocid="members.open_modal_button"
          >
            <Plus size={16} className="mr-1" /> নতুন সদস্য ভর্তি
          </Button>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as CouncilTab)}
      >
        <TabsList className="grid w-full grid-cols-3 mb-4">
          {COUNCILS.map((c) => (
            <TabsTrigger
              key={c.tab}
              value={c.tab}
              className="text-xs sm:text-sm"
              data-ocid={`members.${c.tab}.tab`}
            >
              {c.label}
              <span className="ml-1.5 bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0">
                {getMembersByRole(c.role).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {COUNCILS.map((council) => {
          const councilMembers = getMembersByRole(council.role);
          return (
            <TabsContent key={council.tab} value={council.tab}>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className="font-semibold text-lg"
                      style={{ color: "#1a6b2a" }}
                    >
                      {council.label}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        exportPDF(council.role, council.label, members)
                      }
                      className="gap-1.5 border-primary/30 hover:bg-primary/5"
                      style={{ color: "#1a6b2a" }}
                      data-ocid={`members.${council.tab}.download.button`}
                    >
                      <Download size={14} />
                      PDF ডাউনলোড
                    </Button>
                  </div>

                  {isLoading ? (
                    <div
                      className="flex justify-center py-12"
                      data-ocid="members.loading_state"
                    >
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                  ) : councilMembers.length === 0 ? (
                    <div
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="members.empty_state"
                    >
                      <p className="text-lg">এই পরিষদে কোনো সদস্য নেই</p>
                      {isAdmin && (
                        <p className="text-sm mt-1">
                          উপরের &#34;নতুন সদস্য ভর্তি&#34; বোতামে ক্লিক করে সদস্য যোগ
                          করুন
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-14">ক্র.নং</TableHead>
                            <TableHead>নাম</TableHead>
                            <TableHead>পিতার নাম</TableHead>
                            <TableHead>পদবী</TableHead>
                            <TableHead>মোবাইল</TableHead>
                            <TableHead>রক্তের গ্রুপ</TableHead>
                            <TableHead>বর্তমান ঠিকানা</TableHead>
                            {isAdmin && (
                              <TableHead className="text-right">
                                কার্যক্রম
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {councilMembers.map((m, idx) => {
                            const extras = parseExtras(m.notes);
                            return (
                              <TableRow
                                key={`${m.email}-${idx}`}
                                data-ocid={`members.${council.tab}.item.${idx + 1}`}
                              >
                                <TableCell className="font-mono text-center">
                                  {extras.serial || idx + 1}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {m.name}
                                </TableCell>
                                <TableCell>{extras.fatherName}</TableCell>
                                <TableCell>{extras.designation}</TableCell>
                                <TableCell>{m.phone}</TableCell>
                                <TableCell>
                                  {extras.bloodGroup && (
                                    <span className="bg-red-50 text-red-700 border border-red-200 text-xs px-1.5 py-0.5 rounded font-medium">
                                      {extras.bloodGroup}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="max-w-[150px] truncate">
                                  {extras.currentAddress}
                                </TableCell>
                                {isAdmin && (
                                  <TableCell className="text-right">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => openEdit(m)}
                                      className="h-7 w-7"
                                      data-ocid={`members.${council.tab}.edit_button.${idx + 1}`}
                                    >
                                      <Pencil size={13} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => setDeleteTarget(m)}
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      data-ocid={`members.${council.tab}.delete_button.${idx + 1}`}
                                    >
                                      <Trash2 size={13} />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="members.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1a6b2a" }}>
              {editMember ? "সদস্য তথ্য সম্পাদনা" : "নতুন সদস্য ভর্তি ফরম"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Serial number */}
            <div className="sm:col-span-1">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ক্রমিক নম্বর
              </Label>
              <Input
                value={
                  editMember
                    ? parseExtras(editMember.notes).serial
                    : getNextSerial(form.council)
                }
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>

            {/* Council */}
            <div className="sm:col-span-1">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                পরিষদ *
              </Label>
              <Select
                value={form.council}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, council: v as MembershipRole }))
                }
              >
                <SelectTrigger data-ocid="members.form.select">
                  <SelectValue placeholder="পরিষদ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {COUNCILS.map((c) => (
                    <SelectItem key={c.role} value={c.role}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                সদস্যের নাম *
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="সম্পূর্ণ নাম লিখুন"
                data-ocid="members.form.input"
              />
            </div>

            {/* Father's name */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                পিতার নাম
              </Label>
              <Input
                value={form.fatherName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fatherName: e.target.value }))
                }
                placeholder="পিতার সম্পূর্ণ নাম"
              />
            </div>

            {/* Mobile */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                মোবাইল নম্বর
              </Label>
              <Input
                value={form.mobile}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mobile: e.target.value }))
                }
                placeholder="01XXXXXXXXX"
              />
            </div>

            {/* Email */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ইমেইল আইডি
              </Label>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="email@example.com"
                type="email"
              />
            </div>

            {/* Blood Group */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                রক্তের গ্রুপ
              </Label>
              <Select
                value={form.bloodGroup}
                onValueChange={(v) => setForm((f) => ({ ...f, bloodGroup: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="গ্রুপ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Designation */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                পদবী
              </Label>
              <Input
                value={form.designation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, designation: e.target.value }))
                }
                placeholder="যেমন: সভাপতি, সম্পাদক"
              />
            </div>

            {/* Current Address */}
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                বর্তমান ঠিকানা
              </Label>
              <Textarea
                value={form.currentAddress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, currentAddress: e.target.value }))
                }
                placeholder="বর্তমান বাসস্থানের ঠিকানা"
                rows={2}
                data-ocid="members.form.textarea"
              />
            </div>

            {/* Permanent Address */}
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                স্থায়ী ঠিকানা
              </Label>
              <Textarea
                value={form.permanentAddress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, permanentAddress: e.target.value }))
                }
                placeholder="স্থায়ী বাসস্থানের ঠিকানা"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditMember(null);
              }}
              data-ocid="members.dialog.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isMutating}
              style={{ background: "#1a6b2a" }}
              className="text-white"
              data-ocid="members.dialog.submit_button"
            >
              {isMutating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editMember ? "আপডেট করুন" : "ভর্তি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent data-ocid="members.delete.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "#8b0000" }}>
              সদস্য মুছে ফেলুন
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            আপনি কি নিশ্চিত যে <strong>{deleteTarget?.name}</strong>-কে তালিকা থেকে
            মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="members.delete.cancel_button"
            >
              না, বাতিল
            </Button>
            <Button
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="members.delete.confirm_button"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              হ্যাঁ, মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
