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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Loader2,
  Pencil,
  Plus,
  Printer,
  Trash2,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Council, type CouncilMember, type backendInterface } from "../backend";
import ModuleHeader from "../components/ModuleHeader";
import { loadSettings } from "../store/settingsStore";
import {
  buildDocumentHeader,
  buildDocumentWatermark,
  getDocumentFontLink,
} from "../utils/pdfHeader";

const COUNCILS = [
  { role: Council.sadharanParishad, label: "সাধারণ পরিষদ", tab: "sadharan" },
  {
    role: Council.karyanirbahaParishad,
    label: "কার্যনির্বাহী পরিষদ",
    tab: "karyanirbahai",
  },
  {
    role: Council.upadeshataParishad,
    label: "উপদেষ্টা পরিষদ",
    tab: "upadeshata",
  },
] as const;

type CouncilTab = "sadharan" | "karyanirbahai" | "upadeshata";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface FormState {
  memberName: string;
  fatherName: string;
  mobile: string;
  email: string;
  bloodGroup: string;
  currentAddress: string;
  permanentAddress: string;
  designation: string;
  council: Council;
  photoDataUrl: string;
  dateOfBirth: string;
  occupation: string;
  education: string;
  admissionDate: string;
}

interface MemberExtra {
  dateOfBirth: string;
  occupation: string;
  education: string;
  admissionDate: string;
}

function saveExtraToLS(memberId: bigint, extra: MemberExtra) {
  localStorage.setItem(
    `memberExtra_${String(memberId)}`,
    JSON.stringify(extra),
  );
}

function loadExtraFromLS(memberId: bigint): MemberExtra {
  try {
    const raw = localStorage.getItem(`memberExtra_${String(memberId)}`);
    if (raw) return JSON.parse(raw) as MemberExtra;
  } catch {}
  return { dateOfBirth: "", occupation: "", education: "", admissionDate: "" };
}

const today = new Date().toISOString().split("T")[0];

const emptyForm: FormState = {
  memberName: "",
  fatherName: "",
  mobile: "",
  email: "",
  bloodGroup: "",
  currentAddress: "",
  permanentAddress: "",
  designation: "",
  council: Council.sadharanParishad,
  photoDataUrl: "",
  dateOfBirth: "",
  occupation: "",
  education: "",
  admissionDate: today,
};

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

interface ConstitutionChapter {
  id: number;
  chapterNumber: string;
  title: string;
  content: string;
}

function loadChaptersFromLS(): ConstitutionChapter[] {
  try {
    const raw = localStorage.getItem("aponConstitutionChapters");
    if (raw) return JSON.parse(raw) as ConstitutionChapter[];
  } catch {}
  return [];
}

function getCouncilLabel(council: Council): string {
  return COUNCILS.find((c) => c.role === council)?.label ?? "";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function generateAdmissionFormHTML(
  member: CouncilMember,
  serialNumber: string | number,
  photoDataUrl: string,
  chapters: ConstitutionChapter[],
  extra: MemberExtra,
): string {
  const org = loadSettings();

  const photoHtml = photoDataUrl
    ? `<img src="${photoDataUrl}" style="width:100%;height:100%;object-fit:cover" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#f5f5f5">
        <div style="font-size:24px;color:#999">👤</div>
        <div style="font-size:10px;color:#aaa;margin-top:4px">ছবি</div>
      </div>`;

  const fieldRow = (label: string, value: string) =>
    value
      ? `<tr>
          <td style="padding:5px 10px;font-weight:600;color:#333;width:38%;border:1px solid #e0e0e0;background:#f9fbe7;font-size:12px">${label}</td>
          <td style="padding:5px 10px;color:#222;border:1px solid #e0e0e0;font-size:12px">${value}</td>
        </tr>`
      : "";

  const chaptersHtml =
    chapters.length > 0
      ? `<div style="margin-top:28px;border-top:2px solid #1a6b2a;padding-top:16px">
          <h3 style="font-size:13px;font-weight:700;color:#1a6b2a;margin:0 0 10px;text-align:center">ভর্তি সংক্রান্ত বিধিমালার সারসংক্ষেপ</h3>
          <ol style="margin:0;padding-left:20px;font-size:11px;color:#444;line-height:1.8">
            ${chapters
              .map(
                (ch) =>
                  `<li><strong>${ch.chapterNumber ? `${ch.chapterNumber}: ` : ""}${ch.title}</strong></li>`,
              )
              .join("")}
          </ol>
          <p style="margin:12px 0 0;font-size:11px;color:#555;font-style:italic">আমি উপরোক্ত বিধিমালা মেনে চলতে সম্মত আছি।</p>
        </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>সদস্যপদ আবেদন ফর্ম - ${member.memberName}</title>
  ${getDocumentFontLink()}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans Bengali', 'Hind Siliguri', Arial, sans-serif; background: #fff; color: #222; padding: 24px 30px; max-width: 794px; margin: 0 auto; }
    @page { size: A4; margin: 15mm; }
    @media print { body { padding: 0; max-width: 100%; } .no-print { display: none !important; } }
    .form-title-wrap { text-align: center; margin-bottom: 20px; }
    .form-title { display: inline-block; font-size: 17px; font-weight: 700; color: #1a6b2a; border: 2px solid #1a6b2a; padding: 6px 28px; border-radius: 4px; letter-spacing: 1px; }
    .form-body { position: relative; }
    .photo-box { position: absolute; top: 0; right: 0; width: 110px; height: 130px; border: 2px solid #1a6b2a; overflow: hidden; border-radius: 4px; background: #f5f5f5; }
    .photo-label { text-align: center; font-size: 10px; color: #999; margin-top: 4px; }
    .member-table { width: calc(100% - 124px); border-collapse: collapse; }
    table { border-collapse: collapse; }
    .sig-row { display: flex; justify-content: space-between; margin-top: 32px; padding-top: 12px; border-top: 1px dashed #ccc; }
    .sig-block { text-align: center; font-size: 11px; color: #555; }
    .sig-line { border-bottom: 1.5px solid #555; width: 160px; margin: 20px auto 4px; }
    .print-btn { display: block; margin: 20px auto 0; padding: 10px 36px; background: #1a6b2a; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-family: 'Noto Sans Bengali', sans-serif; cursor: pointer; }
    .print-hint { text-align: center; font-size: 11px; color: #999; margin-top: 6px; }
  </style>
</head>
<body>
  ${buildDocumentWatermark(org.logoDataUrl)}
  ${buildDocumentHeader({
    logoDataUrl: org.logoDataUrl,
    orgName1: org.orgName1 || "আপন",
    orgName2: org.orgName2 || "ফাউন্ডেশন",
    tagline: org.tagline || "মানবসেবায় আমরা",
    address: org.address || "বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ",
    email: org.email || "aponfoundation.baligaw@gmail.com",
    whatsapp: org.whatsapp || "+8801608427115",
    color1: org.color1 || "#166534",
    color2: org.color2 || "#c2410c",
  })}

  <!-- Form Title -->
  <div class="form-title-wrap">
    <span class="form-title">সদস্যপদ আবেদন ফর্ম</span>
  </div>

  <!-- Form Body with photo -->
  <div class="form-body">
    <!-- Photo top-right -->
    <div class="photo-box">${photoHtml}</div>
    <div class="photo-label" style="position:absolute;top:134px;right:0;width:110px;text-align:center;font-size:10px;color:#888">সদস্যের ছবি</div>

    <!-- Member Info Table -->
    <table class="member-table">
      <tbody>
        ${fieldRow("ক্রমিক নম্বর", String(serialNumber))}
        ${fieldRow("পরিষদ", getCouncilLabel(member.council))}
        ${fieldRow("সদস্যের নাম", member.memberName)}
        ${fieldRow("পিতার নাম", member.fatherName)}
        ${fieldRow("মোবাইল নম্বর", member.mobile)}
        ${fieldRow("ইমেইল আইডি", member.email)}
        ${fieldRow("রক্তের গ্রুপ", member.bloodGroup)}
        ${fieldRow("জন্ম তারিখ", formatDate(extra.dateOfBirth))}
        ${fieldRow("পেশা", extra.occupation)}
        ${fieldRow("শিক্ষাগত যোগ্যতা", extra.education)}
        ${fieldRow("ভর্তির তারিখ", formatDate(extra.admissionDate))}
        ${fieldRow("পদবী", member.designation)}
        ${fieldRow("বর্তমান ঠিকানা", member.currentAddress)}
        ${fieldRow("স্থায়ী ঠিকানা", member.permanentAddress)}
      </tbody>
    </table>
  </div>

  <!-- Constitution Summary -->
  ${chaptersHtml}

  <!-- Signature Row -->
  <div class="sig-row">
    <div class="sig-block">
      <div class="sig-line"></div>
      আবেদনকারীর স্বাক্ষর
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      তারিখ
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      অনুমোদনকারীর স্বাক্ষর
    </div>
  </div>

  <!-- Print Button -->
  <div class="no-print" style="margin-top:20px;text-align:center">
    <button class="print-btn" onclick="window.print()">PDF সংরক্ষণ / প্রিন্ট করুন</button>
    <p class="print-hint">প্রিন্ট ডায়ালগে "Destination" থেকে "Save as PDF" বেছে নিন</p>
  </div>
</body>
</html>`;
}

function exportPDF(
  councilRole: Council,
  councilLabel: string,
  members: CouncilMember[],
) {
  const orgSettings = loadSettings();
  const councilMembers = members.filter((m) => m.council === councilRole);

  const rowsHtml = councilMembers
    .map((m, idx) => {
      const bg = idx % 2 === 0 ? "#f0f8f0" : "#ffffff";
      return `<tr style="background:${bg}">
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd;text-align:center">${String(m.serialNumber) || idx + 1}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd">${m.memberName}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd">${m.fatherName}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd">${m.designation}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd">${m.mobile}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd;text-align:center">${m.bloodGroup}</td>
        <td style="padding:6px 8px;font-size:12px;border:1px solid #ddd">${m.currentAddress}</td>
      </tr>`;
    })
    .join("");

  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>${councilLabel} - সদস্য তালিকা</title>
  ${getDocumentFontLink()}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans Bengali', 'Hind Siliguri', Arial, sans-serif; background: #fff; color: #222; padding: 20px 28px; }
    @page { size: A4; margin: 15mm; }
    @media print { body { padding: 0; } .no-print { display: none !important; } }
    .council-title { text-align: center; font-size: 15px; font-weight: 700; margin-bottom: 14px; color: ${orgSettings.color1}; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: ${orgSettings.color1}; color: #fff; }
    th { padding: 6px 8px; font-size: 12px; border: 1px solid #155722; text-align: left; }
    td { vertical-align: top; }
    .print-btn { display: block; margin: 16px auto 0; padding: 10px 32px; background: ${orgSettings.color1}; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-family: 'Noto Sans Bengali', sans-serif; cursor: pointer; }
    .print-hint { text-align: center; font-size: 12px; color: #888; margin-top: 8px; }
  </style>
</head>
<body>
  ${buildDocumentWatermark(orgSettings.logoDataUrl)}
  ${buildDocumentHeader({
    logoDataUrl: orgSettings.logoDataUrl,
    orgName1: orgSettings.orgName1 || "আপন",
    orgName2: orgSettings.orgName2 || "ফাউন্ডেশন",
    tagline: orgSettings.tagline || "মানবসেবায় আমরা",
    address: orgSettings.address || "বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ",
    email: orgSettings.email || "aponfoundation.baligaw@gmail.com",
    whatsapp: orgSettings.whatsapp || "+8801608427115",
    color1: orgSettings.color1 || "#166534",
    color2: orgSettings.color2 || "#c2410c",
  })}
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
  printWindow.onload = () => printWindow.focus();
}

function printAdmissionForm(m: CouncilMember, serialNumber: string | number) {
  const photoDataUrl =
    localStorage.getItem(`memberPhoto_${String(m.id)}`) ?? "";
  const extra = loadExtraFromLS(m.id);
  const chapters = loadChaptersFromLS();
  const html = generateAdmissionFormHTML(
    m,
    serialNumber,
    photoDataUrl,
    chapters,
    extra,
  );
  const win = window.open("", "_blank");
  if (!win) {
    toast.error("পপআপ ব্লক করা আছে। অনুগ্রহ করে পপআপ অনুমতি দিন।");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => win.focus();
}

export default function MembersPage({ actor, isAdmin }: Props) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<CouncilTab>("sadharan");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<CouncilMember | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<CouncilMember | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const list = await actor.getAllMembers();
        return list.length > 0 ? list : [];
      } catch {
        return [];
      }
    },
    enabled: true,
  });

  function getNextSerial(council: Council): number {
    return members.filter((m) => m.council === council).length + 1;
  }

  function savePhotoToLS(memberId: bigint, photoDataUrl: string) {
    if (photoDataUrl) {
      localStorage.setItem(`memberPhoto_${String(memberId)}`, photoDataUrl);
    }
  }

  const addMutation = useMutation({
    mutationFn: async (f: FormState) => {
      if (!actor) throw new Error("No actor");
      await actor.addMember(
        f.council,
        f.memberName,
        f.fatherName,
        f.mobile,
        f.email,
        f.bloodGroup,
        f.currentAddress,
        f.permanentAddress,
        f.designation,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("সদস্য যোগ করা হয়েছে");
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: () => {
      const serial = getNextSerial(form.council);
      const newId = BigInt(Date.now());
      const newMember: CouncilMember = {
        id: newId,
        council: form.council,
        memberName: form.memberName,
        fatherName: form.fatherName,
        mobile: form.mobile,
        email: form.email,
        bloodGroup: form.bloodGroup,
        currentAddress: form.currentAddress,
        permanentAddress: form.permanentAddress,
        designation: form.designation,
        serialNumber: BigInt(serial),
      };
      savePhotoToLS(newId, form.photoDataUrl);
      saveExtraToLS(newId, {
        dateOfBirth: form.dateOfBirth,
        occupation: form.occupation,
        education: form.education,
        admissionDate: form.admissionDate,
      });
      qc.setQueryData(["members"], (old: CouncilMember[] = []) => [
        ...old,
        newMember,
      ]);
      toast.success("সদস্য যোগ করা হয়েছে (স্থানীয়)");
      setDialogOpen(false);
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      member,
      f,
    }: { member: CouncilMember; f: FormState }) => {
      if (!actor) throw new Error("No actor");
      const updated: CouncilMember = {
        ...member,
        council: f.council,
        memberName: f.memberName,
        fatherName: f.fatherName,
        mobile: f.mobile,
        email: f.email,
        bloodGroup: f.bloodGroup,
        currentAddress: f.currentAddress,
        permanentAddress: f.permanentAddress,
        designation: f.designation,
      };
      await actor.updateMember(member.id, updated);
      savePhotoToLS(member.id, f.photoDataUrl);
      saveExtraToLS(member.id, {
        dateOfBirth: f.dateOfBirth,
        occupation: f.occupation,
        education: f.education,
        admissionDate: f.admissionDate,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("সদস্যের তথ্য আপডেট হয়েছে");
      setDialogOpen(false);
      setEditMember(null);
      setForm(emptyForm);
    },
    onError: () => {
      if (editMember) {
        const updated: CouncilMember = {
          ...editMember,
          council: form.council,
          memberName: form.memberName,
          fatherName: form.fatherName,
          mobile: form.mobile,
          email: form.email,
          bloodGroup: form.bloodGroup,
          currentAddress: form.currentAddress,
          permanentAddress: form.permanentAddress,
          designation: form.designation,
        };
        savePhotoToLS(editMember.id, form.photoDataUrl);
        saveExtraToLS(editMember.id, {
          dateOfBirth: form.dateOfBirth,
          occupation: form.occupation,
          education: form.education,
          admissionDate: form.admissionDate,
        });
        qc.setQueryData(["members"], (old: CouncilMember[] = []) =>
          old.map((m) => (m.id === editMember.id ? updated : m)),
        );
        toast.success("সদস্যের তথ্য আপডেট হয়েছে");
        setDialogOpen(false);
        setEditMember(null);
        setForm(emptyForm);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteMember(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("সদস্য মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
    },
    onError: (_, id) => {
      qc.setQueryData(["members"], (old: CouncilMember[] = []) =>
        old.filter((m) => m.id !== id),
      );
      toast.success("সদস্য মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
    },
  });

  function openAdd() {
    setEditMember(null);
    const councilForTab =
      COUNCILS.find((c) => c.tab === activeTab)?.role ??
      Council.sadharanParishad;
    setForm({ ...emptyForm, council: councilForTab });
    setDialogOpen(true);
  }

  function openEdit(m: CouncilMember) {
    setEditMember(m);
    const savedPhoto =
      localStorage.getItem(`memberPhoto_${String(m.id)}`) ?? "";
    const extra = loadExtraFromLS(m.id);
    setForm({
      memberName: m.memberName,
      fatherName: m.fatherName,
      mobile: m.mobile,
      email: m.email,
      bloodGroup: m.bloodGroup,
      currentAddress: m.currentAddress,
      permanentAddress: m.permanentAddress,
      designation: m.designation,
      council: m.council,
      photoDataUrl: savedPhoto,
      dateOfBirth: extra.dateOfBirth,
      occupation: extra.occupation,
      education: extra.education,
      admissionDate: extra.admissionDate || today,
    });
    setDialogOpen(true);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((f) => ({ ...f, photoDataUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.memberName.trim()) {
      toast.error("সদস্যের নাম আবশ্যক");
      return;
    }
    if (editMember) {
      updateMutation.mutate({ member: editMember, f: form });
    } else {
      addMutation.mutate(form);
    }
  }

  function handlePrintFromDialog() {
    const chapters = loadChaptersFromLS();
    const serialNumber = editMember
      ? String(editMember.serialNumber)
      : getNextSerial(form.council);
    const tempMember: CouncilMember = {
      id: editMember?.id ?? BigInt(0),
      council: form.council,
      memberName: form.memberName,
      fatherName: form.fatherName,
      mobile: form.mobile,
      email: form.email,
      bloodGroup: form.bloodGroup,
      currentAddress: form.currentAddress,
      permanentAddress: form.permanentAddress,
      designation: form.designation,
      serialNumber: editMember?.serialNumber ?? BigInt(serialNumber),
    };
    const extra: MemberExtra = {
      dateOfBirth: form.dateOfBirth,
      occupation: form.occupation,
      education: form.education,
      admissionDate: form.admissionDate,
    };
    const html = generateAdmissionFormHTML(
      tempMember,
      serialNumber,
      form.photoDataUrl,
      chapters,
      extra,
    );
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("পপআপ ব্লক করা আছে।");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onload = () => win.focus();
  }

  function getMembersByRole(role: Council) {
    return members.filter((m) => m.council === role);
  }

  const isMutating = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="সদস্য তালিকা"
        subtitle="সকল পরিষদের সদস্যদের তালিকা ও ব্যবস্থাপনা"
        icon={<Users size={22} />}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: "#1a4d2e" }}>
          সদস্য তালিকা
        </h2>
        {isAdmin && (
          <Button
            onClick={openAdd}
            style={{ background: "#1a4d2e" }}
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
                            <TableHead className="text-right">কার্যক্রম</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {councilMembers.map((m, idx) => (
                            <TableRow
                              key={String(m.id)}
                              data-ocid={`members.${council.tab}.item.${idx + 1}`}
                            >
                              <TableCell className="font-mono text-center">
                                {String(m.serialNumber) || idx + 1}
                              </TableCell>
                              <TableCell className="font-medium">
                                {m.memberName}
                              </TableCell>
                              <TableCell>{m.fatherName}</TableCell>
                              <TableCell>{m.designation}</TableCell>
                              <TableCell>{m.mobile}</TableCell>
                              <TableCell>
                                {m.bloodGroup && (
                                  <span className="bg-red-50 text-red-700 border border-red-200 text-xs px-1.5 py-0.5 rounded font-medium">
                                    {m.bloodGroup}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">
                                {m.currentAddress}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    printAdmissionForm(
                                      m,
                                      String(m.serialNumber) || idx + 1,
                                    )
                                  }
                                  className="h-7 w-7"
                                  title="ভর্তি ফর্ম প্রিন্ট করুন"
                                  data-ocid={`members.${council.tab}.print.button.${idx + 1}`}
                                >
                                  <Printer size={13} />
                                </Button>
                                {isAdmin && (
                                  <>
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
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
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

      {/* Add/Edit Dialog */}
      {isAdmin && (
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            if (!o) {
              setDialogOpen(false);
              setEditMember(null);
            }
          }}
        >
          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            data-ocid="members.dialog"
          >
            <DialogHeader>
              <DialogTitle style={{ color: "#1a6b2a" }}>
                {editMember ? "সদস্যের তথ্য সম্পাদনা" : "নতুন সদস্য ভর্তি ফর্ম"}
              </DialogTitle>
            </DialogHeader>

            {/* Photo Upload Section */}
            <div className="flex flex-col items-center gap-2 py-3 border border-dashed border-primary/40 rounded-lg bg-primary/5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                সদস্যের ছবি
              </Label>
              <button
                type="button"
                className="w-24 h-28 border-2 border-dashed border-primary/50 rounded-md overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => photoInputRef.current?.click()}
                data-ocid="members.form.dropzone"
              >
                {form.photoDataUrl ? (
                  <img
                    src={form.photoDataUrl}
                    alt="সদস্যের ছবি"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <span className="text-2xl">👤</span>
                    <span className="text-xs">ছবি যুক্ত করুন</span>
                  </div>
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                data-ocid="members.form.upload_button"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => photoInputRef.current?.click()}
              >
                {form.photoDataUrl ? "ছবি পরিবর্তন করুন" : "ছবি আপলোড করুন"}
              </Button>
              {form.photoDataUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive"
                  onClick={() => setForm((f) => ({ ...f, photoDataUrl: "" }))}
                >
                  ছবি সরান
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="sm:col-span-1">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  ক্রমিক নম্বর
                </Label>
                <Input
                  value={
                    editMember
                      ? String(editMember.serialNumber)
                      : getNextSerial(form.council)
                  }
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-1">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  পরিষদ *
                </Label>
                <Select
                  value={form.council}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, council: v as Council }))
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

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  সদস্যের নাম *
                </Label>
                <Input
                  value={form.memberName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, memberName: e.target.value }))
                  }
                  placeholder="সম্পূর্ণ নাম লিখুন"
                  data-ocid="members.form.input"
                />
              </div>

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

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  রক্তের গ্রুপ
                </Label>
                <Select
                  value={form.bloodGroup}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, bloodGroup: v }))
                  }
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

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  জন্ম তারিখ
                </Label>
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dateOfBirth: e.target.value }))
                  }
                  data-ocid="members.form.dob.input"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  পেশা
                </Label>
                <Input
                  value={form.occupation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, occupation: e.target.value }))
                  }
                  placeholder="যেমন: শিক্ষক, ব্যবসায়ী"
                  data-ocid="members.form.occupation.input"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  শিক্ষাগত যোগ্যতা
                </Label>
                <Input
                  value={form.education}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, education: e.target.value }))
                  }
                  placeholder="যেমন: স্নাতক, মাস্টার্স"
                  data-ocid="members.form.education.input"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  ভর্তির তারিখ
                </Label>
                <Input
                  type="date"
                  value={form.admissionDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, admissionDate: e.target.value }))
                  }
                  data-ocid="members.form.admission-date.input"
                />
              </div>

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

            <DialogFooter className="mt-2 flex-wrap gap-2">
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
              {form.memberName.trim() && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrintFromDialog}
                  className="gap-1.5"
                  style={{ color: "#1a6b2a", borderColor: "#1a6b2a" }}
                  data-ocid="members.dialog.print_button"
                >
                  <Printer size={14} />
                  ভর্তি ফর্ম প্রিন্ট করুন
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isMutating}
                style={{ background: "#1a6b2a" }}
                className="text-white"
                data-ocid="members.dialog.submit_button"
              >
                {isMutating && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editMember ? "আপডেট করুন" : "ভর্তি করুন"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {isAdmin && (
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
              আপনি কি নিশ্চিত যে <strong>{deleteTarget?.memberName}</strong>-কে
              তালিকা থেকে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
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
      )}
    </div>
  );
}
