import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import {
  buildDocumentHeader,
  buildDocumentWatermark,
  getDocumentFontLink,
} from "../utils/pdfHeader";

interface IncomeRecord {
  id: bigint;
  serialNumber: bigint;
  date: string;
  category: string;
  donorName: string;
  fatherName: string;
  donorAddress: string;
  mobile: string;
  amount: number;
  designation: string;
}

interface ExpenseRecord {
  id: bigint;
  serialNumber: bigint;
  date: string;
  category: string;
  recipientName: string;
  fatherName: string;
  recipientAddress: string;
  mobile: string;
  amount: number;
  proofFileId: string;
}

interface ExpenseCategory {
  id: bigint;
  name: string;
}

const INIT_INCOME_CATS = ["বাহিরের অনুদান", "সদস্যদের নিয়মিত ত্রৈমাসিক চাঁদা"];
const DEFAULT_EXPENSE_CATS = ["শীতবস্ত্র বিতরণ", "শিক্ষা উপকরণ বিতরণ"];

const MONTHS = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯", "১০", "১১", "১২"];

interface OrgSettings {
  orgName?: string;
  address?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  logoUrl?: string;
}

function getOrgSettings(): OrgSettings {
  try {
    const raw = localStorage.getItem("orgSettings");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function buildOrgHeader(settings: OrgSettings): string {
  return buildDocumentHeader({
    logoDataUrl: settings.logoUrl,
    orgName1: "আপন",
    orgName2: "ফাউন্ডেশন",
    tagline: "মানবসেবায় আমরা",
    address: settings.address || "বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ",
    email: settings.email || "aponfoundation.baligaw@gmail.com",
    whatsapp: settings.whatsapp || "+8801608427115",
  });
}

function printReceipt(record: IncomeRecord) {
  const settings = getOrgSettings();
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>টাকা গ্রহণের রসিদ - ${record.serialNumber}</title>
${getDocumentFontLink()}
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans Bengali', sans-serif; padding: 32px; color: #111; background: #fff; }
  .title { text-align: center; font-size: 22px; font-weight: 800; color: #166534; margin-bottom: 6px; letter-spacing: 0.5px; }
  .subtitle { text-align: center; font-size: 13px; color: #666; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  td { padding: 10px 14px; border: 1px solid #d1d5db; font-size: 14px; }
  td:first-child { font-weight: 600; background: #f0fdf4; width: 38%; color: #166534; }
  .amount-row td:last-child { font-size: 18px; font-weight: 800; color: #166534; }
  .footer { margin-top: 32px; display: flex; justify-content: space-between; font-size: 12px; color: #888; }
  .sign-box { text-align: center; border-top: 1px solid #999; width: 160px; padding-top: 6px; margin-top: 48px; }
  .no-print { text-align: center; margin-top: 24px; }
  .print-btn { background: #166534; color: white; border: none; padding: 10px 28px; font-family: 'Noto Sans Bengali', sans-serif; font-size: 15px; border-radius: 6px; cursor: pointer; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
${buildDocumentWatermark(settings.logoUrl)}
${buildOrgHeader(settings)}
<div class="title">টাকা গ্রহণের রসিদ</div>
<div class="subtitle">রসিদ নং: ${record.serialNumber} &nbsp;|&nbsp; তারিখ: ${record.date}</div>
<table>
  <tr><td>ক্রমিক নম্বর</td><td>${record.serialNumber}</td></tr>
  <tr><td>তারিখ</td><td>${record.date}</td></tr>
  <tr><td>আয়ের খাত</td><td>${record.category}</td></tr>
  <tr><td>দাতার নাম</td><td>${record.donorName}</td></tr>
  ${record.fatherName ? `<tr><td>পিতার নাম</td><td>${record.fatherName}</td></tr>` : ""}
  <tr><td>মোবাইল নম্বর</td><td>${record.mobile || "—"}</td></tr>
  <tr><td>ঠিকানা</td><td>${record.donorAddress || "—"}</td></tr>
  ${record.designation ? `<tr><td>পদবী</td><td>${record.designation}</td></tr>` : ""}
  <tr class="amount-row"><td>টাকার পরিমাণ</td><td>৳ ${record.amount.toLocaleString()} টাকা</td></tr>
</table>
<div class="footer">
  <div>মুদ্রণের তারিখ: ${new Date().toLocaleDateString("bn-BD")}</div>
  <div class="sign-box">অনুমোদনকারীর স্বাক্ষর</div>
</div>
<div class="no-print">
  <button class="print-btn" onclick="window.print()">🖨️ প্রিন্ট / PDF সংরক্ষণ করুন</button>
</div>
</body></html>`);
  win.document.close();
}

function printVoucher(record: ExpenseRecord) {
  const settings = getOrgSettings();
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>খরচের ভাউচার - ${record.serialNumber}</title>
${getDocumentFontLink()}
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans Bengali', sans-serif; padding: 32px; color: #111; background: #fff; }
  .title { text-align: center; font-size: 22px; font-weight: 800; color: #991b1b; margin-bottom: 6px; letter-spacing: 0.5px; }
  .subtitle { text-align: center; font-size: 13px; color: #666; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  td { padding: 10px 14px; border: 1px solid #d1d5db; font-size: 14px; }
  td:first-child { font-weight: 600; background: #fff1f2; width: 38%; color: #991b1b; }
  .amount-row td:last-child { font-size: 18px; font-weight: 800; color: #991b1b; }
  .footer { margin-top: 32px; display: flex; justify-content: space-between; font-size: 12px; color: #888; }
  .sign-box { text-align: center; border-top: 1px solid #999; width: 160px; padding-top: 6px; margin-top: 48px; }
  .no-print { text-align: center; margin-top: 24px; }
  .print-btn { background: #991b1b; color: white; border: none; padding: 10px 28px; font-family: 'Noto Sans Bengali', sans-serif; font-size: 15px; border-radius: 6px; cursor: pointer; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
${buildDocumentWatermark(settings.logoUrl)}
${buildOrgHeader(settings)}
<div class="title">খরচের ভাউচার</div>
<div class="subtitle">ভাউচার নং: ${record.serialNumber} &nbsp;|&nbsp; তারিখ: ${record.date}</div>
<table>
  <tr><td>ক্রমিক নম্বর</td><td>${record.serialNumber}</td></tr>
  <tr><td>তারিখ</td><td>${record.date}</td></tr>
  <tr><td>ব্যয়ের খাত</td><td>${record.category}</td></tr>
  <tr><td>গ্রহীতার নাম</td><td>${record.recipientName}</td></tr>
  ${record.fatherName ? `<tr><td>পিতার নাম</td><td>${record.fatherName}</td></tr>` : ""}
  <tr><td>মোবাইল নম্বর</td><td>${record.mobile || "—"}</td></tr>
  <tr><td>ঠিকানা</td><td>${record.recipientAddress || "—"}</td></tr>
  <tr class="amount-row"><td>টাকার পরিমাণ</td><td>৳ ${record.amount.toLocaleString()} টাকা</td></tr>
</table>
<div class="footer">
  <div>মুদ্রণের তারিখ: ${new Date().toLocaleDateString("bn-BD")}</div>
  <div class="sign-box">অনুমোদনকারীর স্বাক্ষর</div>
</div>
<div class="no-print">
  <button class="print-btn" onclick="window.print()">🖨️ প্রিন্ট / PDF সংরক্ষণ করুন</button>
</div>
</body></html>`);
  win.document.close();
}

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
  defaultTab?: string;
}

export default function FinancialPage({ actor, isAdmin, defaultTab }: Props) {
  const qc = useQueryClient();

  // Income categories (local, extendable)
  const [incomeCats, setIncomeCats] = useState<string[]>(INIT_INCOME_CATS);
  const [showNewIncomeCat, setShowNewIncomeCat] = useState(false);

  // Income dialog
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [incomeDeleteTarget, setIncomeDeleteTarget] =
    useState<IncomeRecord | null>(null);
  const [editIncomeTarget, setEditIncomeTarget] = useState<IncomeRecord | null>(
    null,
  );
  const [incomeEdits, setIncomeEdits] = useState<Record<string, IncomeRecord>>(
    {},
  );
  const [incomeForm, setIncomeForm] = useState({
    date: "",
    category: "",
    donorName: "",
    fatherName: "",
    donorAddress: "",
    mobile: "",
    amount: "",
    designation: "",
    newCategory: "",
  });
  const [incomeFilter, setIncomeFilter] = useState({
    category: "",
    name: "",
    month: "",
    year: "",
  });

  // Expense dialog
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expenseDeleteTarget, setExpenseDeleteTarget] =
    useState<ExpenseRecord | null>(null);
  const [editExpenseTarget, setEditExpenseTarget] =
    useState<ExpenseRecord | null>(null);
  const [expenseEdits, setExpenseEdits] = useState<
    Record<string, ExpenseRecord>
  >({});
  const [expenseForm, setExpenseForm] = useState({
    date: "",
    category: "",
    recipientName: "",
    fatherName: "",
    recipientAddress: "",
    mobile: "",
    amount: "",
    proofFileName: "",
    newCategory: "",
  });
  const [expenseFilter, setExpenseFilter] = useState({
    category: "",
    name: "",
    month: "",
    year: "",
  });
  const [showNewCat, setShowNewCat] = useState(false);

  const { data: incomeRecordsRaw = [], isLoading: incomeLoading } = useQuery<
    IncomeRecord[]
  >({
    queryKey: ["incomeRecords"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const l = await (actor as any).getAllIncomeRecords();
        const parsed = l.map((r: any) => {
          const des: string = r.designation || "";
          const sepIdx = des.indexOf("|FATHER|");
          const fatherName = sepIdx >= 0 ? des.slice(0, sepIdx) : "";
          const designation = sepIdx >= 0 ? des.slice(sepIdx + 8) : des;
          return { ...r, fatherName, designation };
        });
        return parsed.length > 0 ? parsed : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor,
  });

  // Merge local edits
  const incomeRecords = incomeRecordsRaw.map(
    (r) => incomeEdits[String(r.id)] ?? r,
  );

  const { data: expenseRecordsRaw = [], isLoading: expenseLoading } = useQuery<
    ExpenseRecord[]
  >({
    queryKey: ["expenseRecords"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const l = await (actor as any).getAllExpenseRecords();
        const parsedExp = l.map((r: any) => {
          const pf: string = r.proofFileId || "";
          const sepIdx = pf.indexOf("|PROOF|");
          const fatherName = sepIdx >= 0 ? pf.slice(0, sepIdx) : "";
          const proofFileId = sepIdx >= 0 ? pf.slice(sepIdx + 7) : pf;
          return { ...r, fatherName, proofFileId };
        });
        return parsedExp.length > 0 ? parsedExp : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor,
  });

  const expenseRecords = expenseRecordsRaw.map(
    (r) => expenseEdits[String(r.id)] ?? r,
  );

  const { data: expenseCats = [] } = useQuery<ExpenseCategory[]>({
    queryKey: ["expenseCategories"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as any).getAllExpenseCategories();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
  });

  const addIncomeMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const encodedDesignation = incomeForm.fatherName
        ? `${incomeForm.fatherName}|FATHER|${incomeForm.designation}`
        : incomeForm.designation;
      await (actor as any).addIncomeRecord(
        incomeForm.date,
        incomeForm.category,
        incomeForm.donorName,
        incomeForm.donorAddress,
        incomeForm.mobile,
        Number.parseFloat(incomeForm.amount) || 0,
        encodedDesignation,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomeRecords"] });
      toast.success("আয়ের তথ্য সংরক্ষিত হয়েছে");
      closeIncomeDialog();
    },
    onError: () => {
      // Fallback: save locally
      const newRecord: IncomeRecord = {
        id: BigInt(Date.now()),
        serialNumber: BigInt(incomeRecords.length + 1),
        date: incomeForm.date,
        category: showNewIncomeCat
          ? incomeForm.newCategory
          : incomeForm.category,
        donorName: incomeForm.donorName,
        fatherName: incomeForm.fatherName,
        donorAddress: incomeForm.donorAddress,
        mobile: incomeForm.mobile,
        amount: Number.parseFloat(incomeForm.amount) || 0,
        designation: incomeForm.designation,
      };
      setIncomeEdits((prev) => ({
        ...prev,
        [String(newRecord.id)]: newRecord,
      }));
      // add to raw via local hack — just treat it as an edit/addition via query cache
      qc.setQueryData(["incomeRecords"], (old: IncomeRecord[] = []) => [
        ...old,
        newRecord,
      ]);
      toast.success("আয়ের তথ্য সংরক্ষিত হয়েছে (স্থানীয়)");
      closeIncomeDialog();
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await (actor as any).deleteIncomeRecord(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomeRecords"] });
      toast.success("রেকর্ড মুছে ফেলা হয়েছে");
      setIncomeDeleteTarget(null);
    },
    onError: (_, id) => {
      // remove locally
      qc.setQueryData(["incomeRecords"], (old: IncomeRecord[] = []) =>
        old.filter((r) => r.id !== id),
      );
      toast.success("রেকর্ড মুছে ফেলা হয়েছে");
      setIncomeDeleteTarget(null);
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const cat = showNewCat ? expenseForm.newCategory : expenseForm.category;
      if (showNewCat && expenseForm.newCategory.trim())
        await (actor as any).addExpenseCategory(expenseForm.newCategory.trim());
      const encodedProofFileId = expenseForm.fatherName
        ? `${expenseForm.fatherName}|PROOF|${expenseForm.proofFileName}`
        : expenseForm.proofFileName;
      await (actor as any).addExpenseRecord(
        expenseForm.date,
        cat,
        expenseForm.recipientName,
        expenseForm.recipientAddress,
        expenseForm.mobile,
        Number.parseFloat(expenseForm.amount) || 0,
        encodedProofFileId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["expenseRecords", "expenseCategories"],
      });
      toast.success("ব্যয়ের তথ্য সংরক্ষিত হয়েছে");
      closeExpenseDialog();
    },
    onError: () => {
      const cat = showNewCat ? expenseForm.newCategory : expenseForm.category;
      const newRecord: ExpenseRecord = {
        id: BigInt(Date.now()),
        serialNumber: BigInt(expenseRecords.length + 1),
        date: expenseForm.date,
        category: cat,
        recipientName: expenseForm.recipientName,
        fatherName: expenseForm.fatherName,
        recipientAddress: expenseForm.recipientAddress,
        mobile: expenseForm.mobile,
        amount: Number.parseFloat(expenseForm.amount) || 0,
        proofFileId: expenseForm.proofFileName,
      };
      qc.setQueryData(["expenseRecords"], (old: ExpenseRecord[] = []) => [
        ...old,
        newRecord,
      ]);
      toast.success("ব্যয়ের তথ্য সংরক্ষিত হয়েছে (স্থানীয়)");
      closeExpenseDialog();
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await (actor as any).deleteExpenseRecord(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenseRecords"] });
      toast.success("রেকর্ড মুছে ফেলা হয়েছে");
      setExpenseDeleteTarget(null);
    },
    onError: (_, id) => {
      qc.setQueryData(["expenseRecords"], (old: ExpenseRecord[] = []) =>
        old.filter((r) => r.id !== id),
      );
      toast.success("রেকর্ড মুছে ফেলা হয়েছে");
      setExpenseDeleteTarget(null);
    },
  });

  function closeIncomeDialog() {
    setIncomeDialogOpen(false);
    setEditIncomeTarget(null);
    setShowNewIncomeCat(false);
    setIncomeForm({
      date: "",
      category: "",
      donorName: "",
      fatherName: "",
      donorAddress: "",
      mobile: "",
      amount: "",
      designation: "",
      newCategory: "",
    });
  }

  function openIncomeEdit(r: IncomeRecord) {
    setEditIncomeTarget(r);
    setIncomeForm({
      date: r.date,
      category: r.category,
      donorName: r.donorName,
      fatherName: r.fatherName,
      donorAddress: r.donorAddress,
      mobile: r.mobile,
      amount: String(r.amount),
      designation: r.designation,
      newCategory: "",
    });
    setShowNewIncomeCat(false);
    setIncomeDialogOpen(true);
  }

  function closeExpenseDialog() {
    setExpenseDialogOpen(false);
    setEditExpenseTarget(null);
    setShowNewCat(false);
    setExpenseForm({
      date: "",
      category: "",
      recipientName: "",
      fatherName: "",
      recipientAddress: "",
      mobile: "",
      amount: "",
      proofFileName: "",
      newCategory: "",
    });
  }

  function openExpenseEdit(r: ExpenseRecord) {
    setEditExpenseTarget(r);
    setExpenseForm({
      date: r.date,
      category: r.category,
      recipientName: r.recipientName,
      fatherName: r.fatherName,
      recipientAddress: r.recipientAddress,
      mobile: r.mobile,
      amount: String(r.amount),
      proofFileName: r.proofFileId,
      newCategory: "",
    });
    setShowNewCat(false);
    setExpenseDialogOpen(true);
  }

  function handleIncomeSubmit() {
    if (!incomeForm.date) {
      toast.error("তারিখ আবশ্যক");
      return;
    }
    const cat = showNewIncomeCat ? incomeForm.newCategory : incomeForm.category;
    if (!cat.trim()) {
      toast.error("খাত নির্বাচন করুন বা নতুন খাত লিখুন");
      return;
    }
    if (!incomeForm.donorName.trim()) {
      toast.error("দাতার নাম আবশ্যক");
      return;
    }
    if (!incomeForm.amount) {
      toast.error("টাকার পরিমাণ আবশ্যক");
      return;
    }

    if (editIncomeTarget) {
      // Add new category to local list if new
      if (
        showNewIncomeCat &&
        incomeForm.newCategory.trim() &&
        !incomeCats.includes(incomeForm.newCategory.trim())
      ) {
        setIncomeCats((prev) => [...prev, incomeForm.newCategory.trim()]);
      }
      const updated: IncomeRecord = {
        ...editIncomeTarget,
        date: incomeForm.date,
        category: cat,
        donorName: incomeForm.donorName,
        fatherName: incomeForm.fatherName,
        donorAddress: incomeForm.donorAddress,
        mobile: incomeForm.mobile,
        amount: Number.parseFloat(incomeForm.amount) || 0,
        designation: incomeForm.designation,
      };
      setIncomeEdits((prev) => ({
        ...prev,
        [String(editIncomeTarget.id)]: updated,
      }));
      toast.success("আয়ের তথ্য আপডেট হয়েছে");
      closeIncomeDialog();
      return;
    }
    if (
      showNewIncomeCat &&
      incomeForm.newCategory.trim() &&
      !incomeCats.includes(incomeForm.newCategory.trim())
    ) {
      setIncomeCats((prev) => [...prev, incomeForm.newCategory.trim()]);
    }
    addIncomeMutation.mutate();
  }

  function handleExpenseSubmit() {
    if (!expenseForm.date) {
      toast.error("তারিখ আবশ্যক");
      return;
    }
    const cat = showNewCat ? expenseForm.newCategory : expenseForm.category;
    if (!cat.trim()) {
      toast.error("খাত নির্বাচন করুন বা নতুন খাত লিখুন");
      return;
    }
    if (!expenseForm.recipientName.trim()) {
      toast.error("গ্রহীতার নাম আবশ্যক");
      return;
    }
    if (!expenseForm.amount) {
      toast.error("টাকার পরিমাণ আবশ্যক");
      return;
    }

    if (editExpenseTarget) {
      const updated: ExpenseRecord = {
        ...editExpenseTarget,
        date: expenseForm.date,
        category: cat,
        recipientName: expenseForm.recipientName,
        fatherName: expenseForm.fatherName,
        recipientAddress: expenseForm.recipientAddress,
        mobile: expenseForm.mobile,
        amount: Number.parseFloat(expenseForm.amount) || 0,
      };
      setExpenseEdits((prev) => ({
        ...prev,
        [String(editExpenseTarget.id)]: updated,
      }));
      toast.success("ব্যয়ের তথ্য আপডেট হয়েছে");
      closeExpenseDialog();
      return;
    }
    addExpenseMutation.mutate();
  }

  const filteredIncome = incomeRecords.filter((r) => {
    if (incomeFilter.category && r.category !== incomeFilter.category)
      return false;
    if (
      incomeFilter.name &&
      !r.donorName.toLowerCase().includes(incomeFilter.name.toLowerCase())
    )
      return false;
    if (
      incomeFilter.month &&
      String(new Date(r.date).getMonth() + 1) !== incomeFilter.month
    )
      return false;
    if (
      incomeFilter.year &&
      String(new Date(r.date).getFullYear()) !== incomeFilter.year
    )
      return false;
    return true;
  });

  const filteredExpense = expenseRecords.filter((r) => {
    if (expenseFilter.category && r.category !== expenseFilter.category)
      return false;
    if (
      expenseFilter.name &&
      !r.recipientName.toLowerCase().includes(expenseFilter.name.toLowerCase())
    )
      return false;
    if (
      expenseFilter.month &&
      String(new Date(r.date).getMonth() + 1) !== expenseFilter.month
    )
      return false;
    if (
      expenseFilter.year &&
      String(new Date(r.date).getFullYear()) !== expenseFilter.year
    )
      return false;
    return true;
  });

  const totalIncome = incomeRecords.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expenseRecords.reduce((s, r) => s + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const allExpCats = [
    ...DEFAULT_EXPENSE_CATS,
    ...expenseCats.map((c) => c.name),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wallet size={24} style={{ color: "#166534" }} />
        <h1 className="text-2xl font-bold text-foreground">আর্থিক ব্যবস্থাপনা</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4" style={{ borderLeftColor: "#166534" }}>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ArrowUpCircle size={16} style={{ color: "#166534" }} /> মোট আয়
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: "#166534" }}>
              ৳{totalIncome.toLocaleString()} টাকা
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: "#991b1b" }}>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ArrowDownCircle size={16} style={{ color: "#991b1b" }} /> মোট ব্যয়
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: "#991b1b" }}>
              ৳{totalExpense.toLocaleString()} টাকা
            </p>
          </CardContent>
        </Card>
        <Card
          className="border-l-4"
          style={{ borderLeftColor: balance >= 0 ? "#166534" : "#991b1b" }}
        >
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Wallet size={16} /> উদ্বৃত্ত
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-2xl font-bold"
              style={{ color: balance >= 0 ? "#166534" : "#991b1b" }}
            >
              ৳{balance.toLocaleString()} টাকা
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab || "income"}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income" data-ocid="financial.income.tab">
            <ArrowUpCircle size={14} className="mr-1.5" /> আয় (রসিদ)
          </TabsTrigger>
          <TabsTrigger value="expense" data-ocid="financial.expense.tab">
            <ArrowDownCircle size={14} className="mr-1.5" /> ব্যয় (ভাউচার)
          </TabsTrigger>
        </TabsList>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2 top-2.5 text-muted-foreground"
                />
                <Input
                  placeholder="দাতার নাম"
                  value={incomeFilter.name}
                  onChange={(e) =>
                    setIncomeFilter((f) => ({ ...f, name: e.target.value }))
                  }
                  className="pl-7 w-40"
                  data-ocid="financial.income.search_input"
                />
              </div>
              <Select
                value={incomeFilter.category || "all"}
                onValueChange={(v) =>
                  setIncomeFilter((f) => ({
                    ...f,
                    category: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger
                  className="w-44"
                  data-ocid="financial.income.category.select"
                >
                  <SelectValue placeholder="খাত" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল খাত</SelectItem>
                  {incomeCats.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={incomeFilter.month || "all"}
                onValueChange={(v) =>
                  setIncomeFilter((f) => ({
                    ...f,
                    month: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger
                  className="w-28"
                  data-ocid="financial.income.month.select"
                >
                  <SelectValue placeholder="মাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব মাস</SelectItem>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={String(i + 1)} value={String(i + 1)}>
                      {m} মাস
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="বছর"
                value={incomeFilter.year}
                onChange={(e) =>
                  setIncomeFilter((f) => ({ ...f, year: e.target.value }))
                }
                className="w-24"
                type="number"
              />
            </div>
            {isAdmin && (
              <Button
                onClick={() => {
                  setEditIncomeTarget(null);
                  setIncomeDialogOpen(true);
                }}
                style={{ background: "#166534" }}
                className="text-white flex-shrink-0 text-base px-5 py-2"
                data-ocid="financial.income.open_modal_button"
              >
                <Plus size={18} className="mr-2" /> ➕ নতুন আয় রেকর্ড করুন
              </Button>
            )}
          </div>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              {incomeLoading ? (
                <div
                  className="flex justify-center py-12"
                  data-ocid="financial.income.loading_state"
                >
                  <Loader2
                    className="animate-spin h-8 w-8"
                    style={{ color: "#166534" }}
                  />
                </div>
              ) : filteredIncome.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="financial.income.empty_state"
                >
                  <p>কোনো আয়ের রেকর্ড পাওয়া যায়নি</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ক্রমিক</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>খাত</TableHead>
                      <TableHead>দাতার নাম</TableHead>
                      <TableHead>পিতার নাম</TableHead>
                      <TableHead>মোবাইল</TableHead>
                      <TableHead>পরিমাণ</TableHead>
                      <TableHead>পদবী</TableHead>
                      <TableHead className="text-right">কার্যক্রম</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncome.map((r, idx) => (
                      <TableRow
                        key={String(r.id)}
                        data-ocid={`financial.income.item.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-center">
                          {String(r.serialNumber)}
                        </TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {r.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.donorName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {r.fatherName || "—"}
                        </TableCell>
                        <TableCell>{r.mobile}</TableCell>
                        <TableCell
                          className="font-semibold"
                          style={{ color: "#166534" }}
                        >
                          ৳{r.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{r.designation || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isAdmin && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openIncomeEdit(r)}
                                className="h-7 w-7"
                                style={{ color: "#166534" }}
                                data-ocid={`financial.income.edit_button.${idx + 1}`}
                              >
                                <Pencil size={13} />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => printReceipt(r)}
                              className="h-7 w-7 text-gray-500 hover:text-gray-700"
                              data-ocid={`financial.income.print.${idx + 1}`}
                            >
                              <Printer size={13} />
                            </Button>
                            {isAdmin && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIncomeDeleteTarget(r)}
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                data-ocid={`financial.income.delete_button.${idx + 1}`}
                              >
                                <Trash2 size={13} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Tab */}
        <TabsContent value="expense" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2 top-2.5 text-muted-foreground"
                />
                <Input
                  placeholder="গ্রহীতার নাম"
                  value={expenseFilter.name}
                  onChange={(e) =>
                    setExpenseFilter((f) => ({ ...f, name: e.target.value }))
                  }
                  className="pl-7 w-40"
                  data-ocid="financial.expense.search_input"
                />
              </div>
              <Select
                value={expenseFilter.category || "all"}
                onValueChange={(v) =>
                  setExpenseFilter((f) => ({
                    ...f,
                    category: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger
                  className="w-44"
                  data-ocid="financial.expense.category.select"
                >
                  <SelectValue placeholder="খাত" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল খাত</SelectItem>
                  {allExpCats.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={expenseFilter.month || "all"}
                onValueChange={(v) =>
                  setExpenseFilter((f) => ({
                    ...f,
                    month: v === "all" ? "" : v,
                  }))
                }
              >
                <SelectTrigger
                  className="w-28"
                  data-ocid="financial.expense.month.select"
                >
                  <SelectValue placeholder="মাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব মাস</SelectItem>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={String(i + 1)} value={String(i + 1)}>
                      {m} মাস
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="বছর"
                value={expenseFilter.year}
                onChange={(e) =>
                  setExpenseFilter((f) => ({ ...f, year: e.target.value }))
                }
                className="w-24"
                type="number"
              />
            </div>
            {isAdmin && (
              <Button
                onClick={() => {
                  setEditExpenseTarget(null);
                  setExpenseDialogOpen(true);
                }}
                style={{ background: "#991b1b" }}
                className="text-white flex-shrink-0 text-base px-5 py-2"
                data-ocid="financial.expense.open_modal_button"
              >
                <Plus size={18} className="mr-2" /> ➕ নতুন ব্যয় রেকর্ড করুন
              </Button>
            )}
          </div>
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              {expenseLoading ? (
                <div
                  className="flex justify-center py-12"
                  data-ocid="financial.expense.loading_state"
                >
                  <Loader2
                    className="animate-spin h-8 w-8"
                    style={{ color: "#991b1b" }}
                  />
                </div>
              ) : filteredExpense.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="financial.expense.empty_state"
                >
                  <p>কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ক্রমিক</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>খাত</TableHead>
                      <TableHead>গ্রহীতার নাম</TableHead>
                      <TableHead>পিতার নাম</TableHead>
                      <TableHead>মোবাইল</TableHead>
                      <TableHead>পরিমাণ</TableHead>
                      <TableHead className="text-right">কার্যক্রম</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpense.map((r, idx) => (
                      <TableRow
                        key={String(r.id)}
                        data-ocid={`financial.expense.item.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-center">
                          {String(r.serialNumber)}
                        </TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {r.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.recipientName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {r.fatherName || "—"}
                        </TableCell>
                        <TableCell>{r.mobile}</TableCell>
                        <TableCell
                          className="font-semibold"
                          style={{ color: "#991b1b" }}
                        >
                          ৳{r.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isAdmin && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openExpenseEdit(r)}
                                className="h-7 w-7"
                                style={{ color: "#991b1b" }}
                                data-ocid={`financial.expense.edit_button.${idx + 1}`}
                              >
                                <Pencil size={13} />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => printVoucher(r)}
                              className="h-7 w-7 text-gray-500 hover:text-gray-700"
                              data-ocid={`financial.expense.print.${idx + 1}`}
                            >
                              <Printer size={13} />
                            </Button>
                            {isAdmin && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setExpenseDeleteTarget(r)}
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                data-ocid={`financial.expense.delete_button.${idx + 1}`}
                              >
                                <Trash2 size={13} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Income Dialog (Add / Edit) */}
      <Dialog
        open={incomeDialogOpen}
        onOpenChange={(o) => {
          if (!o) closeIncomeDialog();
        }}
      >
        <DialogContent className="max-w-lg" data-ocid="financial.income.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "#166534" }}>
              {editIncomeTarget ? "আয়ের তথ্য সম্পাদনা" : "আয়ের তথ্য যোগ করুন"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  ক্রমিক নম্বর
                </Label>
                <Input
                  value={
                    editIncomeTarget
                      ? String(editIncomeTarget.serialNumber)
                      : incomeRecords.length + 1
                  }
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  তারিখ *
                </Label>
                <Input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) =>
                    setIncomeForm((f) => ({ ...f, date: e.target.value }))
                  }
                  data-ocid="financial.income.dialog.input"
                />
              </div>
            </div>
            {/* Income category with add-new */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                আয়ের খাত *
              </Label>
              {showNewIncomeCat ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={incomeForm.newCategory}
                    onChange={(e) =>
                      setIncomeForm((f) => ({
                        ...f,
                        newCategory: e.target.value,
                      }))
                    }
                    placeholder="নতুন খাতের নাম লিখুন"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewIncomeCat(false);
                      setIncomeForm((f) => ({ ...f, newCategory: "" }));
                    }}
                  >
                    বাতিল
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Select
                    value={incomeForm.category}
                    onValueChange={(v) =>
                      setIncomeForm((f) => ({ ...f, category: v }))
                    }
                  >
                    <SelectTrigger
                      className="flex-1"
                      data-ocid="financial.income.dialog.select"
                    >
                      <SelectValue placeholder="খাত নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeCats.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewIncomeCat(true)}
                    className="flex-shrink-0"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  দাতার নাম *
                </Label>
                <Input
                  value={incomeForm.donorName}
                  onChange={(e) =>
                    setIncomeForm((f) => ({ ...f, donorName: e.target.value }))
                  }
                  placeholder="পূর্ণ নাম"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  পিতার নাম
                </Label>
                <Input
                  value={incomeForm.fatherName}
                  onChange={(e) =>
                    setIncomeForm((f) => ({ ...f, fatherName: e.target.value }))
                  }
                  placeholder="পিতার পূর্ণ নাম"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  মোবাইল নম্বর
                </Label>
                <Input
                  value={incomeForm.mobile}
                  onChange={(e) =>
                    setIncomeForm((f) => ({ ...f, mobile: e.target.value }))
                  }
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  পদবী (ঐচ্ছিক)
                </Label>
                <Input
                  value={incomeForm.designation}
                  onChange={(e) =>
                    setIncomeForm((f) => ({
                      ...f,
                      designation: e.target.value,
                    }))
                  }
                  placeholder="যেমন: সভাপতি"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                দাতার ঠিকানা
              </Label>
              <Input
                value={incomeForm.donorAddress}
                onChange={(e) =>
                  setIncomeForm((f) => ({ ...f, donorAddress: e.target.value }))
                }
                placeholder="সম্পূর্ণ ঠিকানা"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                টাকার পরিমাণ *
              </Label>
              <Input
                type="number"
                value={incomeForm.amount}
                onChange={(e) =>
                  setIncomeForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="০"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeIncomeDialog}
              data-ocid="financial.income.dialog.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleIncomeSubmit}
              disabled={addIncomeMutation.isPending}
              style={{ background: "#166534" }}
              className="text-white"
              data-ocid="financial.income.dialog.submit_button"
            >
              {addIncomeMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editIncomeTarget ? "আপডেট করুন" : "রশিদ সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog (Add / Edit) */}
      <Dialog
        open={expenseDialogOpen}
        onOpenChange={(o) => {
          if (!o) closeExpenseDialog();
        }}
      >
        <DialogContent
          className="max-w-lg"
          data-ocid="financial.expense.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#991b1b" }}>
              {editExpenseTarget ? "ব্যয়ের তথ্য সম্পাদনা" : "ব্যয়ের তথ্য যোগ করুন"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  ক্রমিক নম্বর
                </Label>
                <Input
                  value={
                    editExpenseTarget
                      ? String(editExpenseTarget.serialNumber)
                      : expenseRecords.length + 1
                  }
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  তারিখ *
                </Label>
                <Input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm((f) => ({ ...f, date: e.target.value }))
                  }
                  data-ocid="financial.expense.dialog.input"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                ব্যয়ের খাত *
              </Label>
              {showNewCat ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={expenseForm.newCategory}
                    onChange={(e) =>
                      setExpenseForm((f) => ({
                        ...f,
                        newCategory: e.target.value,
                      }))
                    }
                    placeholder="নতুন খাতের নাম লিখুন"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewCat(false);
                      setExpenseForm((f) => ({ ...f, newCategory: "" }));
                    }}
                  >
                    বাতিল
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Select
                    value={expenseForm.category}
                    onValueChange={(v) =>
                      setExpenseForm((f) => ({ ...f, category: v }))
                    }
                  >
                    <SelectTrigger
                      className="flex-1"
                      data-ocid="financial.expense.dialog.select"
                    >
                      <SelectValue placeholder="খাত নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {allExpCats.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCat(true)}
                    className="flex-shrink-0"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  গ্রহীতার নাম *
                </Label>
                <Input
                  value={expenseForm.recipientName}
                  onChange={(e) =>
                    setExpenseForm((f) => ({
                      ...f,
                      recipientName: e.target.value,
                    }))
                  }
                  placeholder="পূর্ণ নাম"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  পিতার নাম
                </Label>
                <Input
                  value={expenseForm.fatherName}
                  onChange={(e) =>
                    setExpenseForm((f) => ({
                      ...f,
                      fatherName: e.target.value,
                    }))
                  }
                  placeholder="পিতার পূর্ণ নাম"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  মোবাইল নম্বর
                </Label>
                <Input
                  value={expenseForm.mobile}
                  onChange={(e) =>
                    setExpenseForm((f) => ({ ...f, mobile: e.target.value }))
                  }
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                  প্রমাণপত্র আপলোড
                </Label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  className="text-xs"
                  data-ocid="financial.expense.dialog.upload_button"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      setExpenseForm((f) => ({
                        ...f,
                        proofFileName: file.name,
                      }));
                  }}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                গ্রহীতার ঠিকানা
              </Label>
              <Input
                value={expenseForm.recipientAddress}
                onChange={(e) =>
                  setExpenseForm((f) => ({
                    ...f,
                    recipientAddress: e.target.value,
                  }))
                }
                placeholder="সম্পূর্ণ ঠিকানা"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                টাকার পরিমাণ *
              </Label>
              <Input
                type="number"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="০"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeExpenseDialog}
              data-ocid="financial.expense.dialog.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleExpenseSubmit}
              disabled={addExpenseMutation.isPending}
              style={{ background: "#991b1b" }}
              className="text-white"
              data-ocid="financial.expense.dialog.submit_button"
            >
              {addExpenseMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editExpenseTarget ? "আপডেট করুন" : "ভাউচার সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Income Confirm */}
      <Dialog
        open={!!incomeDeleteTarget}
        onOpenChange={(o) => !o && setIncomeDeleteTarget(null)}
      >
        <DialogContent data-ocid="financial.income.delete.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "#991b1b" }}>
              রেকর্ড মুছে ফেলুন
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            আপনি কি নিশ্চিত যে <strong>{incomeDeleteTarget?.donorName}</strong>
            -এর আয়ের রেকর্ডটি মুছে ফেলতে চান?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIncomeDeleteTarget(null)}
              data-ocid="financial.income.delete.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={() =>
                incomeDeleteTarget &&
                deleteIncomeMutation.mutate(incomeDeleteTarget.id)
              }
              disabled={deleteIncomeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="financial.income.delete.confirm_button"
            >
              {deleteIncomeMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Expense Confirm */}
      <Dialog
        open={!!expenseDeleteTarget}
        onOpenChange={(o) => !o && setExpenseDeleteTarget(null)}
      >
        <DialogContent data-ocid="financial.expense.delete.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "#991b1b" }}>
              রেকর্ড মুছে ফেলুন
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            আপনি কি নিশ্চিত যে{" "}
            <strong>{expenseDeleteTarget?.recipientName}</strong>-এর ব্যয়ের
            রেকর্ডটি মুছে ফেলতে চান?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExpenseDeleteTarget(null)}
              data-ocid="financial.expense.delete.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={() =>
                expenseDeleteTarget &&
                deleteExpenseMutation.mutate(expenseDeleteTarget.id)
              }
              disabled={deleteExpenseMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="financial.expense.delete.confirm_button"
            >
              {deleteExpenseMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
