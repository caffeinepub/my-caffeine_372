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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { FileDown, Filter, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Council } from "../backend";
import ModuleHeader from "../components/ModuleHeader";
import { loadSettings } from "../store/settingsStore";
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

interface CouncilMember {
  id: bigint;
  memberName: string;
  fatherName: string;
  mobile: string;
  email: string;
  bloodGroup: string;
  currentAddress: string;
  permanentAddress: string;
  designation: string;
  council: Council;
  serialNumber: string;
}

const MONTHS_BN = [
  { val: "01", label: "জানুয়ারি" },
  { val: "02", label: "ফেব্রুয়ারি" },
  { val: "03", label: "মার্চ" },
  { val: "04", label: "এপ্রিল" },
  { val: "05", label: "মে" },
  { val: "06", label: "জুন" },
  { val: "07", label: "জুলাই" },
  { val: "08", label: "আগস্ট" },
  { val: "09", label: "সেপ্টেম্বর" },
  { val: "10", label: "অক্টোবর" },
  { val: "11", label: "নভেম্বর" },
  { val: "12", label: "ডিসেম্বর" },
];

const COUNCILS = [
  { value: "all", label: "সকল পরিষদ" },
  { value: "sadharan", label: "সাধারণ পরিষদ", role: Council.sadharanParishad },
  {
    value: "karyanirbahai",
    label: "কার্যনির্বাহী পরিষদ",
    role: Council.karyanirbahaParishad,
  },
  {
    value: "upadeshata",
    label: "উপদেষ্টা পরিষদ",
    role: Council.upadeshataParishad,
  },
];

function getCouncilLabel(council: Council): string {
  if (council === Council.sadharanParishad) return "সাধারণ পরিষদ";
  if (council === Council.karyanirbahaParishad) return "কার্যনির্বাহী পরিষদ";
  if (council === Council.upadeshataParishad) return "উপদেষ্টা পরিষদ";
  return "";
}

function buildPDFHeader(settings: ReturnType<typeof loadSettings>): string {
  return buildDocumentHeader({
    logoDataUrl: settings.logoDataUrl,
    orgName1: settings.orgName1,
    orgName2: settings.orgName2,
    tagline: settings.tagline,
    address: settings.address,
    email: settings.email,
    whatsapp: settings.whatsapp,
    color1: settings.color1,
    color2: settings.color2,
  });
}

function buildWatermark(settings: ReturnType<typeof loadSettings>): string {
  return buildDocumentWatermark(settings.logoDataUrl);
}

function openPrintWindow(
  title: string,
  bodyHtml: string,
  settings: ReturnType<typeof loadSettings>,
): void {
  const win = window.open("", "_blank");
  if (!win) return;
  const now = new Date().toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  win.document.write(`<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  ${getDocumentFontLink()}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; font-size: 13px; color: #222; background: white; }
    .page { width: 210mm; min-height: 297mm; padding: 25.4mm 25.4mm 25.4mm; margin: 0 auto; position: relative; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #1a6b2a; color: white; padding: 8px 10px; text-align: left; font-size: 12px; font-weight: 600; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    tr:nth-child(even) td { background: #f0faf2; }
    .report-title { text-align: center; font-size: 18px; font-weight: 700; color: #1a6b2a; margin: 16px 0 8px; padding-bottom: 8px; border-bottom: 1px dashed #1a6b2a; }
    .report-meta { text-align: center; font-size: 11px; color: #777; margin-bottom: 16px; }
    .summary-row td { background: #f0faf2; font-weight: 700; color: #1a6b2a; }
    .footer { position: fixed; bottom: 15mm; left: 18mm; right: 18mm; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 6px; }
    @media print {
      @page { size: A4; margin: 0; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${buildWatermark(settings)}
  <div class="page">
    ${buildPDFHeader(settings)}
    ${bodyHtml}
  </div>
  <div class="footer">তৈরির তারিখ: ${now} &nbsp;|&nbsp; ${settings.orgName1} ${settings.orgName2}</div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 600); }<\/script>
</body>
</html>`);
  win.document.close();
}

interface QuarterlyFee {
  id: string;
  memberName: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  year: string;
  amount: number;
  paymentDate: string;
  status: "paid" | "due";
}

interface ExternalDonation {
  id: string;
  donorName: string;
  mobile: string;
  address: string;
  amount: number;
  category: string;
  date: string;
}

interface Props {
  actor: any;
  isAdmin?: boolean;
}

export default function ReportsPage({ actor, isAdmin = false }: Props) {
  const settings = loadSettings();
  const currentYear = new Date().getFullYear().toString();

  // Income filters
  const [incomeMonth, setIncomeMonth] = useState("all");
  const [incomeYear, setIncomeYear] = useState("all");
  const [incomeSearch, setIncomeSearch] = useState("");
  const [incomeCategory, setIncomeCategory] = useState("all");

  // Expense filters
  const [expenseMonth, setExpenseMonth] = useState("all");
  const [expenseYear, setExpenseYear] = useState("all");
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("all");

  // Member filters
  const [memberCouncil, setMemberCouncil] = useState("all");
  const [memberSearch, setMemberSearch] = useState("");

  // Donation (income-based) filters
  const [donationFilter, setDonationFilter] = useState("person"); // person | month | year | sector
  const [donationSearch, setDonationSearch] = useState("");
  const [donationYear, setDonationYear] = useState("all");
  const [donationMonth, setDonationMonth] = useState("all");

  // Quarterly fees state
  const [quarterlyFees, setQuarterlyFees] = useState<QuarterlyFee[]>([]);
  const [qfSearch, setQfSearch] = useState("");
  const [qfQuarter, setQfQuarter] = useState("all");
  const [qfYear, setQfYear] = useState("all");
  const [qfStatus, setQfStatus] = useState("all");
  const [showQfModal, setShowQfModal] = useState(false);
  const [qfForm, setQfForm] = useState<Omit<QuarterlyFee, "id">>({
    memberName: "",
    quarter: "Q1",
    year: currentYear,
    amount: 0,
    paymentDate: new Date().toISOString().slice(0, 10),
    status: "paid",
  });

  // External donations state
  const [externalDonations, setExternalDonations] = useState<
    ExternalDonation[]
  >([]);
  const [edSearch, setEdSearch] = useState("");
  const [edMonth, setEdMonth] = useState("all");
  const [edYear, setEdYear] = useState("all");
  const [edCategory, setEdCategory] = useState("all");
  const [showEdModal, setShowEdModal] = useState(false);
  const [edForm, setEdForm] = useState<Omit<ExternalDonation, "id">>({
    donorName: "",
    mobile: "",
    address: "",
    amount: 0,
    category: "",
    date: new Date().toISOString().slice(0, 10),
  });

  // Load from localStorage
  useEffect(() => {
    const qf = localStorage.getItem("quarterly_fees");
    if (qf) setQuarterlyFees(JSON.parse(qf));
    const ed = localStorage.getItem("external_donations");
    if (ed) setExternalDonations(JSON.parse(ed));
  }, []);

  // Save quarterly fees to localStorage
  useEffect(() => {
    localStorage.setItem("quarterly_fees", JSON.stringify(quarterlyFees));
  }, [quarterlyFees]);

  // Save external donations to localStorage
  useEffect(() => {
    localStorage.setItem(
      "external_donations",
      JSON.stringify(externalDonations),
    );
  }, [externalDonations]);

  const { data: incomeRecords = [] } = useQuery<IncomeRecord[]>({
    queryKey: ["incomeRecords"],
    queryFn: async () => {
      if (!actor) return [];
      const l = await (actor as any).getAllIncomeRecords();
      return l.map((r: any) => ({
        id: r.id,
        serialNumber: r.serialNumber,
        date: r.date,
        category: r.category,
        donorName: r.donorName,
        fatherName: r.fatherName ?? "",
        donorAddress: r.donorAddress,
        mobile: r.mobile,
        amount: Number(r.amount),
        designation: r.designation ?? "",
      }));
    },
    enabled: !!actor,
  });

  const { data: expenseRecords = [] } = useQuery<ExpenseRecord[]>({
    queryKey: ["expenseRecords"],
    queryFn: async () => {
      if (!actor) return [];
      const l = await (actor as any).getAllExpenseRecords();
      return l.map((r: any) => ({
        id: r.id,
        serialNumber: r.serialNumber,
        date: r.date,
        category: r.category,
        recipientName: r.recipientName,
        fatherName: r.fatherName ?? "",
        recipientAddress: r.recipientAddress,
        mobile: r.mobile,
        amount: Number(r.amount),
        proofFileId: r.proofFileId ?? "",
      }));
    },
    enabled: !!actor,
  });

  const { data: members = [] } = useQuery<CouncilMember[]>({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembers();
    },
    enabled: !!actor,
  });

  // Derived year options
  const incomeYears = [...new Set(incomeRecords.map((r) => r.date.slice(0, 4)))]
    .sort()
    .reverse();
  const expenseYears = [
    ...new Set(expenseRecords.map((r) => r.date.slice(0, 4))),
  ]
    .sort()
    .reverse();
  const donationYears = [
    ...new Set(incomeRecords.map((r) => r.date.slice(0, 4))),
  ]
    .sort()
    .reverse();
  const incomeCategories = [...new Set(incomeRecords.map((r) => r.category))];
  const expenseCategories = [...new Set(expenseRecords.map((r) => r.category))];

  // Filtered data
  const filteredIncome = incomeRecords.filter((r) => {
    const month = r.date.slice(5, 7);
    const year = r.date.slice(0, 4);
    return (
      (incomeMonth === "all" || month === incomeMonth) &&
      (incomeYear === "all" || year === incomeYear) &&
      (incomeCategory === "all" || r.category === incomeCategory) &&
      (incomeSearch === "" ||
        r.donorName.toLowerCase().includes(incomeSearch.toLowerCase()))
    );
  });

  const filteredExpense = expenseRecords.filter((r) => {
    const month = r.date.slice(5, 7);
    const year = r.date.slice(0, 4);
    return (
      (expenseMonth === "all" || month === expenseMonth) &&
      (expenseYear === "all" || year === expenseYear) &&
      (expenseCategory === "all" || r.category === expenseCategory) &&
      (expenseSearch === "" ||
        r.recipientName.toLowerCase().includes(expenseSearch.toLowerCase()))
    );
  });

  const filteredMembers = members.filter((m) => {
    const matchCouncil =
      memberCouncil === "all" ||
      (() => {
        const c = COUNCILS.find((c) => c.value === memberCouncil);
        return c?.role !== undefined && m.council === c.role;
      })();
    const matchSearch =
      memberSearch === "" ||
      m.memberName.toLowerCase().includes(memberSearch.toLowerCase());
    return matchCouncil && matchSearch;
  });

  // Donation grouping based on filter
  const donationBase = incomeRecords.filter((r) => {
    const year = r.date.slice(0, 4);
    const month = r.date.slice(5, 7);
    return (
      (donationYear === "all" || year === donationYear) &&
      (donationMonth === "all" || month === donationMonth)
    );
  });

  function getTotalIncome() {
    return filteredIncome.reduce((s, r) => s + r.amount, 0);
  }
  function getTotalExpense() {
    return filteredExpense.reduce((s, r) => s + r.amount, 0);
  }
  // Quarterly fees helpers
  const quarterLabel = (q: string) => {
    const map: Record<string, string> = {
      Q1: "জানু-মার্চ",
      Q2: "এপ্রিল-জুন",
      Q3: "জুলাই-সেপ্টে",
      Q4: "অক্টো-ডিসে",
    };
    return `${q} (${map[q] ?? q})`;
  };

  const filteredQF = quarterlyFees.filter((r) => {
    return (
      (qfSearch === "" ||
        r.memberName.toLowerCase().includes(qfSearch.toLowerCase())) &&
      (qfQuarter === "all" || r.quarter === qfQuarter) &&
      (qfYear === "all" || r.year === qfYear) &&
      (qfStatus === "all" || r.status === qfStatus)
    );
  });

  const filteredED = externalDonations.filter((r) => {
    const month = r.date.slice(5, 7);
    const year = r.date.slice(0, 4);
    return (
      (edSearch === "" ||
        r.donorName.toLowerCase().includes(edSearch.toLowerCase())) &&
      (edMonth === "all" || month === edMonth) &&
      (edYear === "all" || year === edYear) &&
      (edCategory === "all" || r.category === edCategory)
    );
  });

  const edCategories = [
    ...new Set(externalDonations.map((r) => r.category)),
  ].filter(Boolean);
  const qfYears = [...new Set(quarterlyFees.map((r) => r.year))]
    .sort()
    .reverse();
  const edYears = [...new Set(externalDonations.map((r) => r.date.slice(0, 4)))]
    .sort()
    .reverse();

  function exportQFPDF() {
    const body = `
      <table border="1" cellpadding="6" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:12px;">
        <thead style="background:#e8f5e9;">
          <tr>
            <th>ক্রমিক</th><th>সদস্যের নাম</th><th>ত্রৈমাসিক</th><th>বছর</th><th>পরিমাণ</th><th>প্রদানের তারিখ</th><th>অবস্থা</th>
          </tr>
        </thead>
        <tbody>
          ${filteredQF
            .map(
              (r, i) => `<tr>
            <td>${i + 1}</td>
            <td>${r.memberName}</td>
            <td>${quarterLabel(r.quarter)}</td>
            <td>${r.year}</td>
            <td style="text-align:right">৳${r.amount.toLocaleString("bn-BD")}</td>
            <td>${r.paymentDate}</td>
            <td style="color:${r.status === "paid" ? "green" : "red"}">${r.status === "paid" ? "পরিশোধিত" : "বকেয়া"}</td>
          </tr>`,
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr><td colspan="4" style="text-align:right;font-weight:bold">মোট:</td>
          <td style="text-align:right;font-weight:bold">৳${filteredQF.reduce((s, r) => s + r.amount, 0).toLocaleString("bn-BD")}</td><td colspan="2"></td></tr>
        </tfoot>
      </table>`;
    openPrintWindow("ত্রৈমাসিক চাঁদার তালিকা", body, settings);
  }

  function exportEDPDF() {
    const body = `
      <table border="1" cellpadding="6" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:12px;">
        <thead style="background:#e8f5e9;">
          <tr>
            <th>ক্রমিক</th><th>দাতার নাম</th><th>মোবাইল</th><th>ঠিকানা</th><th>খাত</th><th>তারিখ</th><th>পরিমাণ</th>
          </tr>
        </thead>
        <tbody>
          ${filteredED
            .map(
              (r, i) => `<tr>
            <td>${i + 1}</td>
            <td>${r.donorName}</td>
            <td>${r.mobile}</td>
            <td>${r.address}</td>
            <td>${r.category}</td>
            <td>${r.date}</td>
            <td style="text-align:right">৳${r.amount.toLocaleString("bn-BD")}</td>
          </tr>`,
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr><td colspan="6" style="text-align:right;font-weight:bold">মোট:</td>
          <td style="text-align:right;font-weight:bold">৳${filteredED.reduce((s, r) => s + r.amount, 0).toLocaleString("bn-BD")}</td></tr>
        </tfoot>
      </table>`;
    openPrintWindow("বহিরাগত অনুদানের তালিকা", body, settings);
  }

  function addQuarterlyFee() {
    if (!qfForm.memberName.trim() || !qfForm.year.trim()) return;
    const newFee: QuarterlyFee = { ...qfForm, id: crypto.randomUUID() };
    setQuarterlyFees((prev) => [newFee, ...prev]);
    setShowQfModal(false);
    setQfForm({
      memberName: "",
      quarter: "Q1",
      year: currentYear,
      amount: 0,
      paymentDate: new Date().toISOString().slice(0, 10),
      status: "paid",
    });
  }

  function addExternalDonation() {
    if (!edForm.donorName.trim() || !edForm.category.trim()) return;
    const newDon: ExternalDonation = { ...edForm, id: crypto.randomUUID() };
    setExternalDonations((prev) => [newDon, ...prev]);
    setShowEdModal(false);
    setEdForm({
      donorName: "",
      mobile: "",
      address: "",
      amount: 0,
      category: "",
      date: new Date().toISOString().slice(0, 10),
    });
  }

  function formatAmount(n: number) {
    return `৳${n.toLocaleString("en-BD")}`;
  }

  // PDF Export functions
  function exportIncomePDF() {
    const rows = filteredIncome
      .map(
        (r, i) => `<tr>
          <td>${i + 1}</td>
          <td>${r.date}</td>
          <td>${r.category}</td>
          <td>${r.donorName}</td>
          <td>${r.donorAddress}</td>
          <td>${r.mobile}</td>
          <td style="text-align:right;font-weight:600;">৳${r.amount.toLocaleString("en-BD")}</td>
        </tr>`,
      )
      .join("");
    const total = getTotalIncome();
    const filterDesc = [
      incomeMonth !== "all"
        ? `মাস: ${MONTHS_BN.find((m) => m.val === incomeMonth)?.label}`
        : "",
      incomeYear !== "all" ? `বছর: ${incomeYear}` : "",
      incomeCategory !== "all" ? `খাত: ${incomeCategory}` : "",
      incomeSearch ? `নাম: ${incomeSearch}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
    const body = `
      <div class="report-title">আয় রিপোর্ট (Income Report)</div>
      <div class="report-meta">${filterDesc || "সকল রেকর্ড"} &nbsp;|&nbsp; মোট ${filteredIncome.length}টি</div>
      <table>
        <thead><tr>
          <th>#</th><th>তারিখ</th><th>খাত</th><th>দাতার নাম</th><th>ঠিকানা</th><th>মোবাইল</th><th>পরিমাণ</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr class="summary-row"><td colspan="6" style="text-align:right;padding:8px 10px;">মোট আয়:</td><td style="text-align:right;padding:8px 10px;">৳${total.toLocaleString("en-BD")}</td></tr></tfoot>
      </table>`;
    openPrintWindow("আয় রিপোর্ট", body, settings);
  }

  function exportExpensePDF() {
    const rows = filteredExpense
      .map(
        (r, i) => `<tr>
          <td>${i + 1}</td>
          <td>${r.date}</td>
          <td>${r.category}</td>
          <td>${r.recipientName}</td>
          <td>${r.recipientAddress}</td>
          <td>${r.mobile}</td>
          <td style="text-align:right;font-weight:600;">৳${r.amount.toLocaleString("en-BD")}</td>
        </tr>`,
      )
      .join("");
    const total = getTotalExpense();
    const filterDesc = [
      expenseMonth !== "all"
        ? `মাস: ${MONTHS_BN.find((m) => m.val === expenseMonth)?.label}`
        : "",
      expenseYear !== "all" ? `বছর: ${expenseYear}` : "",
      expenseCategory !== "all" ? `খাত: ${expenseCategory}` : "",
      expenseSearch ? `নাম: ${expenseSearch}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
    const body = `
      <div class="report-title">ব্যয় রিপোর্ট (Expense Report)</div>
      <div class="report-meta">${filterDesc || "সকল রেকর্ড"} &nbsp;|&nbsp; মোট ${filteredExpense.length}টি</div>
      <table>
        <thead><tr>
          <th>#</th><th>তারিখ</th><th>খাত</th><th>প্রাপকের নাম</th><th>ঠিকানা</th><th>মোবাইল</th><th>পরিমাণ</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr class="summary-row"><td colspan="6" style="text-align:right;padding:8px 10px;">মোট ব্যয়:</td><td style="text-align:right;padding:8px 10px;">৳${total.toLocaleString("en-BD")}</td></tr></tfoot>
      </table>`;
    openPrintWindow("ব্যয় রিপোর্ট", body, settings);
  }

  function exportMembersPDF() {
    const rows = filteredMembers
      .map(
        (m, i) => `<tr>
          <td>${i + 1}</td>
          <td>${m.memberName}</td>
          <td>${m.fatherName}</td>
          <td>${getCouncilLabel(m.council)}</td>
          <td>${m.designation}</td>
          <td>${m.mobile}</td>
          <td>${m.bloodGroup}</td>
        </tr>`,
      )
      .join("");
    const councilDesc =
      memberCouncil === "all"
        ? "সকল পরিষদ"
        : (COUNCILS.find((c) => c.value === memberCouncil)?.label ?? "");
    const body = `
      <div class="report-title">সদস্য তালিকা (Member List)</div>
      <div class="report-meta">${councilDesc} &nbsp;|&nbsp; মোট ${filteredMembers.length} জন সদস্য</div>
      <table>
        <thead><tr>
          <th>#</th><th>নাম</th><th>পিতার নাম</th><th>পরিষদ</th><th>পদবী</th><th>মোবাইল</th><th>রক্তের গ্রুপ</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    openPrintWindow("সদস্য তালিকা", body, settings);
  }

  function exportDonationPDF() {
    let body = "";
    const filterDesc = [
      donationYear !== "all" ? `বছর: ${donationYear}` : "",
      donationMonth !== "all"
        ? `মাস: ${MONTHS_BN.find((m) => m.val === donationMonth)?.label}`
        : "",
    ]
      .filter(Boolean)
      .join(" | ");

    if (donationFilter === "person") {
      // Group by person
      const personMap = new Map<
        string,
        { name: string; mobile: string; total: number; count: number }
      >();
      for (const r of donationBase) {
        const key = r.donorName.trim();
        const existing = personMap.get(key);
        if (existing) {
          existing.total += r.amount;
          existing.count += 1;
        } else {
          personMap.set(key, {
            name: r.donorName,
            mobile: r.mobile,
            total: r.amount,
            count: 1,
          });
        }
      }
      const sorted = [...personMap.values()].sort((a, b) => b.total - a.total);
      const filtered = sorted.filter(
        (p) =>
          donationSearch === "" ||
          p.name.toLowerCase().includes(donationSearch.toLowerCase()),
      );
      const rows = filtered
        .map(
          (p, i) => `<tr>
        <td>${i + 1}</td><td>${p.name}</td><td>${p.mobile}</td>
        <td style="text-align:center;">${p.count}টি</td>
        <td style="text-align:right;font-weight:600;">৳${p.total.toLocaleString("en-BD")}</td>
      </tr>`,
        )
        .join("");
      const total = filtered.reduce((s, p) => s + p.total, 0);
      body = `<div class="report-title">অনুদানের তালিকা - ব্যক্তি অনুযায়ী</div>
        <div class="report-meta">${filterDesc || "সকল সময়কাল"} &nbsp;|&nbsp; ${filtered.length} জন দাতা</div>
        <table><thead><tr><th>#</th><th>দাতার নাম</th><th>মোবাইল</th><th style="text-align:center;">অনুদান সংখ্যা</th><th>মোট পরিমাণ</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr class="summary-row"><td colspan="4" style="text-align:right;padding:8px 10px;">মোট:</td><td style="text-align:right;padding:8px 10px;">৳${total.toLocaleString("en-BD")}</td></tr></tfoot>
        </table>`;
    } else if (donationFilter === "month") {
      const monthMap = new Map<string, number>();
      for (const r of donationBase) {
        const key = r.date.slice(0, 7); // YYYY-MM
        monthMap.set(key, (monthMap.get(key) ?? 0) + r.amount);
      }
      const sorted = [...monthMap.entries()].sort((a, b) =>
        a[0].localeCompare(b[0]),
      );
      const rows = sorted
        .map(([ym, total], i) => {
          const [y, m] = ym.split("-");
          const mLabel = MONTHS_BN.find((mb) => mb.val === m)?.label ?? m;
          return `<tr><td>${i + 1}</td><td>${mLabel} ${y}</td><td style="text-align:right;font-weight:600;">৳${total.toLocaleString("en-BD")}</td></tr>`;
        })
        .join("");
      const total = donationBase.reduce((s, r) => s + r.amount, 0);
      body = `<div class="report-title">অনুদানের তালিকা - মাস অনুযায়ী</div>
        <div class="report-meta">${filterDesc || "সকল সময়কাল"}</div>
        <table><thead><tr><th>#</th><th>মাস-বছর</th><th>মোট পরিমাণ</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr class="summary-row"><td colspan="2" style="text-align:right;padding:8px 10px;">মোট:</td><td style="text-align:right;padding:8px 10px;">৳${total.toLocaleString("en-BD")}</td></tr></tfoot>
        </table>`;
    } else if (donationFilter === "year") {
      const yearMap = new Map<string, number>();
      for (const r of incomeRecords) {
        const y = r.date.slice(0, 4);
        yearMap.set(y, (yearMap.get(y) ?? 0) + r.amount);
      }
      const sorted = [...yearMap.entries()].sort((a, b) =>
        a[0].localeCompare(b[0]),
      );
      const rows = sorted
        .map(
          ([y, total], i) =>
            `<tr><td>${i + 1}</td><td>${y}</td><td style="text-align:right;font-weight:600;">৳${total.toLocaleString("en-BD")}</td></tr>`,
        )
        .join("");
      const total = incomeRecords.reduce((s, r) => s + r.amount, 0);
      body = `<div class="report-title">অনুদানের তালিকা - বছর অনুযায়ী</div>
        <div class="report-meta">সকল বছর</div>
        <table><thead><tr><th>#</th><th>বছর</th><th>মোট পরিমাণ</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr class="summary-row"><td colspan="2" style="text-align:right;padding:8px 10px;">মোট:</td><td style="text-align:right;padding:8px 10px;">৳${total.toLocaleString("en-BD")}</td></tr></tfoot>
        </table>`;
    } else {
      // sector
      const sectorMap = new Map<string, number>();
      for (const r of donationBase) {
        sectorMap.set(r.category, (sectorMap.get(r.category) ?? 0) + r.amount);
      }
      const sorted = [...sectorMap.entries()].sort((a, b) => b[1] - a[1]);
      const rows = sorted
        .map(
          ([cat, total], i) =>
            `<tr><td>${i + 1}</td><td>${cat}</td><td style="text-align:right;font-weight:600;">৳${total.toLocaleString("en-BD")}</td></tr>`,
        )
        .join("");
      const total = donationBase.reduce((s, r) => s + r.amount, 0);
      body = `<div class="report-title">অনুদানের তালিকা - খাত অনুযায়ী</div>
        <div class="report-meta">${filterDesc || "সকল সময়কাল"}</div>
        <table><thead><tr><th>#</th><th>খাত</th><th>মোট পরিমাণ</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr class="summary-row"><td colspan="2" style="text-align:right;padding:8px 10px;">মোট:</td><td style="text-align:right;padding:8px 10px;">৳${total.toLocaleString("en-BD")}</td></tr></tfoot>
        </table>`;
    }
    openPrintWindow("অনুদানের তালিকা", body, settings);
  }

  const yearOptions = Array.from({ length: 10 }, (_, i) =>
    (Number(currentYear) - i).toString(),
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <ModuleHeader
        title="রিপোর্ট ও এক্সপোর্ট"
        subtitle="যেকোনো রিপোর্ট ফিল্টার করে হাই-কোয়ালিটি PDF ডাউনলোড করুন"
        icon={<FileDown size={22} />}
      />

      <Tabs defaultValue="income">
        <TabsList
          className="grid grid-cols-3 sm:grid-cols-6 mb-6 w-full gap-y-1"
          data-ocid="reports.tab"
        >
          <TabsTrigger value="income" className="text-xs">
            আয়
          </TabsTrigger>
          <TabsTrigger value="expense" className="text-xs">
            ব্যয়
          </TabsTrigger>
          <TabsTrigger value="members" className="text-xs">
            সদস্য তালিকা
          </TabsTrigger>
          <TabsTrigger value="donation" className="text-xs">
            অনুদান
          </TabsTrigger>
          <TabsTrigger value="quarterly" className="text-xs">
            ত্রৈমাসিক চাঁদা
          </TabsTrigger>
          <TabsTrigger value="external" className="text-xs">
            বহিরাগত অনুদান
          </TabsTrigger>
        </TabsList>

        {/* ====== INCOME TAB ====== */}
        <TabsContent value="income">
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">ফিল্টার:</span>
              </div>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2 top-2.5 text-muted-foreground"
                />
                <Input
                  placeholder="দাতার নাম খুঁজুন"
                  value={incomeSearch}
                  onChange={(e) => setIncomeSearch(e.target.value)}
                  className="pl-7 w-44 h-9 text-sm"
                  data-ocid="reports.search_input"
                />
              </div>
              <Select value={incomeMonth} onValueChange={setIncomeMonth}>
                <SelectTrigger
                  className="w-36 h-9 text-sm"
                  data-ocid="reports.income.select"
                >
                  <SelectValue placeholder="মাস নির্বাচন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল মাস</SelectItem>
                  {MONTHS_BN.map((m) => (
                    <SelectItem key={m.val} value={m.val}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={incomeYear} onValueChange={setIncomeYear}>
                <SelectTrigger className="w-28 h-9 text-sm">
                  <SelectValue placeholder="বছর" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল বছর</SelectItem>
                  {(incomeYears.length ? incomeYears : yearOptions).map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={incomeCategory} onValueChange={setIncomeCategory}>
                <SelectTrigger className="w-44 h-9 text-sm">
                  <SelectValue placeholder="খাত" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল খাত</SelectItem>
                  {incomeCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <Button
                  onClick={exportIncomePDF}
                  className="bg-primary hover:bg-primary/90 gap-2"
                  data-ocid="reports.income.primary_button"
                >
                  <FileDown size={15} />
                  PDF ডাউনলোড করুন
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">
                {filteredIncome.length}টি রেকর্ড
              </span>
              <Badge variant="outline" className="text-primary border-primary">
                মোট আয়: {formatAmount(getTotalIncome())}
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>খাত</TableHead>
                    <TableHead>দাতার নাম</TableHead>
                    <TableHead>মোবাইল</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncome.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-12"
                        data-ocid="reports.income.empty_state"
                      >
                        কোনো রেকর্ড পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIncome.map((r, i) => (
                      <TableRow
                        key={String(r.id)}
                        data-ocid={`reports.income.item.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {r.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.donorName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.mobile}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {formatAmount(r.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ====== EXPENSE TAB ====== */}
        <TabsContent value="expense">
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">ফিল্টার:</span>
              </div>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2 top-2.5 text-muted-foreground"
                />
                <Input
                  placeholder="প্রাপকের নাম খুঁজুন"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="pl-7 w-44 h-9 text-sm"
                  data-ocid="reports.expense.search_input"
                />
              </div>
              <Select value={expenseMonth} onValueChange={setExpenseMonth}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder="মাস নির্বাচন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল মাস</SelectItem>
                  {MONTHS_BN.map((m) => (
                    <SelectItem key={m.val} value={m.val}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={expenseYear} onValueChange={setExpenseYear}>
                <SelectTrigger className="w-28 h-9 text-sm">
                  <SelectValue placeholder="বছর" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল বছর</SelectItem>
                  {(expenseYears.length ? expenseYears : yearOptions).map(
                    (y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <Select
                value={expenseCategory}
                onValueChange={setExpenseCategory}
              >
                <SelectTrigger className="w-44 h-9 text-sm">
                  <SelectValue placeholder="খাত" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল খাত</SelectItem>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <Button
                  onClick={exportExpensePDF}
                  className="bg-primary hover:bg-primary/90 gap-2"
                  data-ocid="reports.expense.primary_button"
                >
                  <FileDown size={15} />
                  PDF ডাউনলোড করুন
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">
                {filteredExpense.length}টি রেকর্ড
              </span>
              <Badge
                variant="outline"
                className="text-destructive border-destructive"
              >
                মোট ব্যয়: {formatAmount(getTotalExpense())}
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>খাত</TableHead>
                    <TableHead>প্রাপকের নাম</TableHead>
                    <TableHead>মোবাইল</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpense.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-12"
                        data-ocid="reports.expense.empty_state"
                      >
                        কোনো রেকর্ড পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpense.map((r, i) => (
                      <TableRow
                        key={String(r.id)}
                        data-ocid={`reports.expense.item.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {r.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.recipientName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.mobile}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          {formatAmount(r.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ====== MEMBERS TAB ====== */}
        <TabsContent value="members">
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">ফিল্টার:</span>
              </div>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2 top-2.5 text-muted-foreground"
                />
                <Input
                  placeholder="নাম খুঁজুন"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-7 w-44 h-9 text-sm"
                  data-ocid="reports.members.search_input"
                />
              </div>
              <Select value={memberCouncil} onValueChange={setMemberCouncil}>
                <SelectTrigger
                  className="w-48 h-9 text-sm"
                  data-ocid="reports.members.select"
                >
                  <SelectValue placeholder="পরিষদ নির্বাচন" />
                </SelectTrigger>
                <SelectContent>
                  {COUNCILS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <Button
                  onClick={exportMembersPDF}
                  className="bg-primary hover:bg-primary/90 gap-2"
                  data-ocid="reports.members.primary_button"
                >
                  <FileDown size={15} />
                  PDF ডাউনলোড করুন
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">
                {filteredMembers.length} জন সদস্য
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead>পিতার নাম</TableHead>
                    <TableHead>পরিষদ</TableHead>
                    <TableHead>পদবী</TableHead>
                    <TableHead>মোবাইল</TableHead>
                    <TableHead>রক্তের গ্রুপ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-12"
                        data-ocid="reports.members.empty_state"
                      >
                        কোনো সদস্য পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((m, i) => (
                      <TableRow
                        key={String(m.id)}
                        data-ocid={`reports.members.item.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {m.memberName}
                        </TableCell>
                        <TableCell>{m.fatherName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getCouncilLabel(m.council)}
                          </Badge>
                        </TableCell>
                        <TableCell>{m.designation}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {m.mobile}
                        </TableCell>
                        <TableCell>
                          <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
                            {m.bloodGroup}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ====== DONATION TAB ====== */}
        <TabsContent value="donation">
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">গ্রুপিং:</span>
              </div>
              <Select value={donationFilter} onValueChange={setDonationFilter}>
                <SelectTrigger
                  className="w-44 h-9 text-sm"
                  data-ocid="reports.donation.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">ব্যক্তি অনুযায়ী</SelectItem>
                  <SelectItem value="month">মাস অনুযায়ী</SelectItem>
                  <SelectItem value="year">বছর অনুযায়ী</SelectItem>
                  <SelectItem value="sector">খাত অনুযায়ী</SelectItem>
                </SelectContent>
              </Select>
              {donationFilter === "person" && (
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-2 top-2.5 text-muted-foreground"
                  />
                  <Input
                    placeholder="দাতার নাম খুঁজুন"
                    value={donationSearch}
                    onChange={(e) => setDonationSearch(e.target.value)}
                    className="pl-7 w-44 h-9 text-sm"
                    data-ocid="reports.donation.search_input"
                  />
                </div>
              )}
              {donationFilter !== "year" && (
                <Select value={donationYear} onValueChange={setDonationYear}>
                  <SelectTrigger className="w-28 h-9 text-sm">
                    <SelectValue placeholder="বছর" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল বছর</SelectItem>
                    {(donationYears.length ? donationYears : yearOptions).map(
                      (y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
              {donationFilter === "person" || donationFilter === "sector" ? (
                <Select value={donationMonth} onValueChange={setDonationMonth}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue placeholder="মাস" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল মাস</SelectItem>
                    {MONTHS_BN.map((m) => (
                      <SelectItem key={m.val} value={m.val}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <div className="ml-auto">
                <Button
                  onClick={exportDonationPDF}
                  className="bg-primary hover:bg-primary/90 gap-2"
                  data-ocid="reports.donation.primary_button"
                >
                  <FileDown size={15} />
                  PDF ডাউনলোড করুন
                </Button>
              </div>
            </div>
          </div>

          {/* Donation Preview Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">
                {donationFilter === "person" && "ব্যক্তি অনুযায়ী অনুদান"}
                {donationFilter === "month" && "মাস অনুযায়ী অনুদান"}
                {donationFilter === "year" && "বছর অনুযায়ী অনুদান"}
                {donationFilter === "sector" && "খাত অনুযায়ী অনুদান"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10">#</TableHead>
                    {donationFilter === "person" && (
                      <>
                        <TableHead>দাতার নাম</TableHead>
                        <TableHead>মোবাইল</TableHead>
                        <TableHead className="text-center">সংখ্যা</TableHead>
                        <TableHead className="text-right">মোট</TableHead>
                      </>
                    )}
                    {donationFilter === "month" && (
                      <>
                        <TableHead>মাস-বছর</TableHead>
                        <TableHead className="text-right">মোট পরিমাণ</TableHead>
                      </>
                    )}
                    {donationFilter === "year" && (
                      <>
                        <TableHead>বছর</TableHead>
                        <TableHead className="text-right">মোট পরিমাণ</TableHead>
                      </>
                    )}
                    {donationFilter === "sector" && (
                      <>
                        <TableHead>খাত</TableHead>
                        <TableHead className="text-right">মোট পরিমাণ</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donationFilter === "person" &&
                    (() => {
                      const personMap = new Map<
                        string,
                        {
                          name: string;
                          mobile: string;
                          total: number;
                          count: number;
                        }
                      >();
                      for (const r of donationBase) {
                        const key = r.donorName.trim();
                        const ex = personMap.get(key);
                        if (ex) {
                          ex.total += r.amount;
                          ex.count += 1;
                        } else
                          personMap.set(key, {
                            name: r.donorName,
                            mobile: r.mobile,
                            total: r.amount,
                            count: 1,
                          });
                      }
                      const list = [...personMap.values()]
                        .sort((a, b) => b.total - a.total)
                        .filter(
                          (p) =>
                            donationSearch === "" ||
                            p.name
                              .toLowerCase()
                              .includes(donationSearch.toLowerCase()),
                        );
                      if (list.length === 0)
                        return (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center text-muted-foreground py-12"
                              data-ocid="reports.donation.empty_state"
                            >
                              কোনো ডেটা নেই
                            </TableCell>
                          </TableRow>
                        );
                      return list.map((p, i) => (
                        <TableRow
                          key={p.name}
                          data-ocid={`reports.donation.item.${i + 1}`}
                        >
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium">
                            {p.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {p.mobile}
                          </TableCell>
                          <TableCell className="text-center">
                            {p.count}টি
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {formatAmount(p.total)}
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  {donationFilter === "month" &&
                    (() => {
                      const monthMap = new Map<string, number>();
                      for (const r of donationBase) {
                        const k = r.date.slice(0, 7);
                        monthMap.set(k, (monthMap.get(k) ?? 0) + r.amount);
                      }
                      const list = [...monthMap.entries()].sort((a, b) =>
                        a[0].localeCompare(b[0]),
                      );
                      if (list.length === 0)
                        return (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center text-muted-foreground py-12"
                              data-ocid="reports.donation.empty_state"
                            >
                              কোনো ডেটা নেই
                            </TableCell>
                          </TableRow>
                        );
                      return list.map(([ym, total], i) => {
                        const [y, m] = ym.split("-");
                        const mLabel =
                          MONTHS_BN.find((mb) => mb.val === m)?.label ?? m;
                        return (
                          <TableRow
                            key={ym}
                            data-ocid={`reports.donation.item.${i + 1}`}
                          >
                            <TableCell>{i + 1}</TableCell>
                            <TableCell className="font-medium">
                              {mLabel} {y}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              {formatAmount(total)}
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                  {donationFilter === "year" &&
                    (() => {
                      const yearMap = new Map<string, number>();
                      for (const r of incomeRecords) {
                        const y = r.date.slice(0, 4);
                        yearMap.set(y, (yearMap.get(y) ?? 0) + r.amount);
                      }
                      const list = [...yearMap.entries()].sort((a, b) =>
                        a[0].localeCompare(b[0]),
                      );
                      if (list.length === 0)
                        return (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center text-muted-foreground py-12"
                              data-ocid="reports.donation.empty_state"
                            >
                              কোনো ডেটা নেই
                            </TableCell>
                          </TableRow>
                        );
                      return list.map(([y, total], i) => (
                        <TableRow
                          key={y}
                          data-ocid={`reports.donation.item.${i + 1}`}
                        >
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium">{y}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {formatAmount(total)}
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  {donationFilter === "sector" &&
                    (() => {
                      const sectorMap = new Map<string, number>();
                      for (const r of donationBase) {
                        sectorMap.set(
                          r.category,
                          (sectorMap.get(r.category) ?? 0) + r.amount,
                        );
                      }
                      const list = [...sectorMap.entries()].sort(
                        (a, b) => b[1] - a[1],
                      );
                      if (list.length === 0)
                        return (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center text-muted-foreground py-12"
                              data-ocid="reports.donation.empty_state"
                            >
                              কোনো ডেটা নেই
                            </TableCell>
                          </TableRow>
                        );
                      return list.map(([cat, total], i) => (
                        <TableRow
                          key={cat}
                          data-ocid={`reports.donation.item.${i + 1}`}
                        >
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium">{cat}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {formatAmount(total)}
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ====== QUARTERLY FEES TAB ====== */}
        <TabsContent value="quarterly">
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">ফিল্টার:</span>
              </div>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-2.5 text-muted-foreground"
                />
                <Input
                  placeholder="সদস্যের নাম"
                  value={qfSearch}
                  onChange={(e) => setQfSearch(e.target.value)}
                  className="pl-8 h-9 w-44 text-sm"
                  data-ocid="quarterly.search_input"
                />
              </div>
              <Select value={qfQuarter} onValueChange={setQfQuarter}>
                <SelectTrigger
                  className="h-9 w-36 text-sm"
                  data-ocid="quarterly.select"
                >
                  <SelectValue placeholder="ত্রৈমাসিক" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ত্রৈমাসিক</SelectItem>
                  <SelectItem value="Q1">Q1 (জানু-মার্চ)</SelectItem>
                  <SelectItem value="Q2">Q2 (এপ্রিল-জুন)</SelectItem>
                  <SelectItem value="Q3">Q3 (জুলাই-সেপ্টে)</SelectItem>
                  <SelectItem value="Q4">Q4 (অক্টো-ডিসে)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={qfYear} onValueChange={setQfYear}>
                <SelectTrigger
                  className="h-9 w-28 text-sm"
                  data-ocid="quarterly.select"
                >
                  <SelectValue placeholder="বছর" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব বছর</SelectItem>
                  {qfYears.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={qfStatus} onValueChange={setQfStatus}>
                <SelectTrigger
                  className="h-9 w-32 text-sm"
                  data-ocid="quarterly.select"
                >
                  <SelectValue placeholder="অবস্থা" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব অবস্থা</SelectItem>
                  <SelectItem value="paid">পরিশোধিত</SelectItem>
                  <SelectItem value="due">বকেয়া</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 ml-auto">
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowQfModal(true)}
                    className="gap-1"
                    data-ocid="quarterly.open_modal_button"
                  >
                    <Plus size={14} /> নতুন যোগ করুন
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={exportQFPDF}
                  className="gap-1 bg-primary text-primary-foreground"
                  data-ocid="quarterly.button"
                >
                  <FileDown size={14} /> PDF ডাউনলোড
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead className="text-xs">ক্রমিক</TableHead>
                  <TableHead className="text-xs">সদস্যের নাম</TableHead>
                  <TableHead className="text-xs">ত্রৈমাসিক</TableHead>
                  <TableHead className="text-xs">বছর</TableHead>
                  <TableHead className="text-xs text-right">পরিমাণ</TableHead>
                  <TableHead className="text-xs">প্রদানের তারিখ</TableHead>
                  <TableHead className="text-xs">অবস্থা</TableHead>
                  {isAdmin && <TableHead className="text-xs">অ্যাকশন</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQF.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 8 : 7}
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="quarterly.empty_state"
                    >
                      কোনো রেকর্ড পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQF.map((r, i) => (
                    <TableRow key={r.id} data-ocid={`quarterly.item.${i + 1}`}>
                      <TableCell className="text-sm">{i + 1}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {r.memberName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {quarterLabel(r.quarter)}
                      </TableCell>
                      <TableCell className="text-sm">{r.year}</TableCell>
                      <TableCell className="text-sm text-right font-semibold text-primary">
                        {formatAmount(r.amount)}
                      </TableCell>
                      <TableCell className="text-sm">{r.paymentDate}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            r.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {r.status === "paid" ? "পরিশোধিত" : "বকেয়া"}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() =>
                              setQuarterlyFees((prev) =>
                                prev.filter((x) => x.id !== r.id),
                              )
                            }
                            data-ocid={`quarterly.delete_button.${i + 1}`}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Dialog open={showQfModal} onOpenChange={setShowQfModal}>
            <DialogContent data-ocid="quarterly.dialog">
              <DialogHeader>
                <DialogTitle>নতুন ত্রৈমাসিক চাঁদা যোগ করুন</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-1.5">
                  <Label>সদস্যের নাম *</Label>
                  <Input
                    value={qfForm.memberName}
                    onChange={(e) =>
                      setQfForm((p) => ({ ...p, memberName: e.target.value }))
                    }
                    data-ocid="quarterly.input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>ত্রৈমাসিক *</Label>
                    <Select
                      value={qfForm.quarter}
                      onValueChange={(v) =>
                        setQfForm((p) => ({
                          ...p,
                          quarter: v as QuarterlyFee["quarter"],
                        }))
                      }
                    >
                      <SelectTrigger data-ocid="quarterly.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1">Q1 (জানু-মার্চ)</SelectItem>
                        <SelectItem value="Q2">Q2 (এপ্রিল-জুন)</SelectItem>
                        <SelectItem value="Q3">Q3 (জুলাই-সেপ্টে)</SelectItem>
                        <SelectItem value="Q4">Q4 (অক্টো-ডিসে)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>বছর *</Label>
                    <Input
                      value={qfForm.year}
                      onChange={(e) =>
                        setQfForm((p) => ({ ...p, year: e.target.value }))
                      }
                      data-ocid="quarterly.input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>পরিমাণ (৳)</Label>
                    <Input
                      type="number"
                      value={qfForm.amount || ""}
                      onChange={(e) =>
                        setQfForm((p) => ({
                          ...p,
                          amount: Number(e.target.value),
                        }))
                      }
                      data-ocid="quarterly.input"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>প্রদানের তারিখ</Label>
                    <Input
                      type="date"
                      value={qfForm.paymentDate}
                      onChange={(e) =>
                        setQfForm((p) => ({
                          ...p,
                          paymentDate: e.target.value,
                        }))
                      }
                      data-ocid="quarterly.input"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>অবস্থা</Label>
                  <Select
                    value={qfForm.status}
                    onValueChange={(v) =>
                      setQfForm((p) => ({ ...p, status: v as "paid" | "due" }))
                    }
                  >
                    <SelectTrigger data-ocid="quarterly.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">পরিশোধিত</SelectItem>
                      <SelectItem value="due">বকেয়া</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowQfModal(false)}
                    data-ocid="quarterly.cancel_button"
                  >
                    বাতিল
                  </Button>
                  <Button
                    onClick={addQuarterlyFee}
                    data-ocid="quarterly.submit_button"
                  >
                    সংরক্ষণ করুন
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ====== EXTERNAL DONATIONS TAB ====== */}
        <TabsContent value="external">
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium">ফিল্টার:</span>
              </div>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-2.5 text-muted-foreground"
                />
                <Input
                  placeholder="দাতার নাম"
                  value={edSearch}
                  onChange={(e) => setEdSearch(e.target.value)}
                  className="pl-8 h-9 w-44 text-sm"
                  data-ocid="external.search_input"
                />
              </div>
              <Select value={edMonth} onValueChange={setEdMonth}>
                <SelectTrigger
                  className="h-9 w-28 text-sm"
                  data-ocid="external.select"
                >
                  <SelectValue placeholder="মাস" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব মাস</SelectItem>
                  {[
                    "01",
                    "02",
                    "03",
                    "04",
                    "05",
                    "06",
                    "07",
                    "08",
                    "09",
                    "10",
                    "11",
                    "12",
                  ].map((m, i) => (
                    <SelectItem key={m} value={m}>
                      {
                        [
                          "জানুয়ারি",
                          "ফেব্রুয়ারি",
                          "মার্চ",
                          "এপ্রিল",
                          "মে",
                          "জুন",
                          "জুলাই",
                          "আগস্ট",
                          "সেপ্টেম্বর",
                          "অক্টোবর",
                          "নভেম্বর",
                          "ডিসেম্বর",
                        ][i]
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={edYear} onValueChange={setEdYear}>
                <SelectTrigger
                  className="h-9 w-28 text-sm"
                  data-ocid="external.select"
                >
                  <SelectValue placeholder="বছর" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব বছর</SelectItem>
                  {edYears.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={edCategory} onValueChange={setEdCategory}>
                <SelectTrigger
                  className="h-9 w-40 text-sm"
                  data-ocid="external.select"
                >
                  <SelectValue placeholder="খাত" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব খাত</SelectItem>
                  {edCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 ml-auto">
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEdModal(true)}
                    className="gap-1"
                    data-ocid="external.open_modal_button"
                  >
                    <Plus size={14} /> নতুন যোগ করুন
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={exportEDPDF}
                  className="gap-1 bg-primary text-primary-foreground"
                  data-ocid="external.button"
                >
                  <FileDown size={14} /> PDF ডাউনলোড
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10">
                  <TableHead className="text-xs">ক্রমিক</TableHead>
                  <TableHead className="text-xs">দাতার নাম</TableHead>
                  <TableHead className="text-xs">মোবাইল</TableHead>
                  <TableHead className="text-xs">ঠিকানা</TableHead>
                  <TableHead className="text-xs">খাত</TableHead>
                  <TableHead className="text-xs">তারিখ</TableHead>
                  <TableHead className="text-xs text-right">পরিমাণ</TableHead>
                  {isAdmin && <TableHead className="text-xs">অ্যাকশন</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredED.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 8 : 7}
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="external.empty_state"
                    >
                      কোনো রেকর্ড পাওয়া যায়নি
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredED.map((r, i) => (
                    <TableRow key={r.id} data-ocid={`external.item.${i + 1}`}>
                      <TableCell className="text-sm">{i + 1}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {r.donorName}
                      </TableCell>
                      <TableCell className="text-sm">{r.mobile}</TableCell>
                      <TableCell className="text-sm">{r.address}</TableCell>
                      <TableCell className="text-sm">{r.category}</TableCell>
                      <TableCell className="text-sm">{r.date}</TableCell>
                      <TableCell className="text-sm text-right font-semibold text-primary">
                        {formatAmount(r.amount)}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() =>
                              setExternalDonations((prev) =>
                                prev.filter((x) => x.id !== r.id),
                              )
                            }
                            data-ocid={`external.delete_button.${i + 1}`}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Dialog open={showEdModal} onOpenChange={setShowEdModal}>
            <DialogContent data-ocid="external.dialog">
              <DialogHeader>
                <DialogTitle>নতুন বহিরাগত অনুদান যোগ করুন</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-1.5">
                  <Label>দাতার নাম *</Label>
                  <Input
                    value={edForm.donorName}
                    onChange={(e) =>
                      setEdForm((p) => ({ ...p, donorName: e.target.value }))
                    }
                    data-ocid="external.input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>মোবাইল</Label>
                    <Input
                      value={edForm.mobile}
                      onChange={(e) =>
                        setEdForm((p) => ({ ...p, mobile: e.target.value }))
                      }
                      data-ocid="external.input"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>ঠিকানা</Label>
                    <Input
                      value={edForm.address}
                      onChange={(e) =>
                        setEdForm((p) => ({ ...p, address: e.target.value }))
                      }
                      data-ocid="external.input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>পরিমাণ (৳)</Label>
                    <Input
                      type="number"
                      value={edForm.amount || ""}
                      onChange={(e) =>
                        setEdForm((p) => ({
                          ...p,
                          amount: Number(e.target.value),
                        }))
                      }
                      data-ocid="external.input"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>তারিখ</Label>
                    <Input
                      type="date"
                      value={edForm.date}
                      onChange={(e) =>
                        setEdForm((p) => ({ ...p, date: e.target.value }))
                      }
                      data-ocid="external.input"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>খাত * (যেমন: শীতবস্ত্র বিতরণ)</Label>
                  <Input
                    value={edForm.category}
                    onChange={(e) =>
                      setEdForm((p) => ({ ...p, category: e.target.value }))
                    }
                    data-ocid="external.input"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEdModal(false)}
                    data-ocid="external.cancel_button"
                  >
                    বাতিল
                  </Button>
                  <Button
                    onClick={addExternalDonation}
                    data-ocid="external.submit_button"
                  >
                    সংরক্ষণ করুন
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
