import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  Droplets,
  FileDown,
  GitBranch,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { Page } from "../App";
import type { backendInterface } from "../backend";

interface IncomeRecord {
  id: bigint;
  amount: number;
}

interface ExpenseRecord {
  id: bigint;
  amount: number;
}

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
  onNavigate: (page: Page, tab?: string) => void;
}

const GOLD = "#D4AF37";
const DARK_GREEN = "#1a4d2e";
const DARKEST_GREEN = "#0f2d1a";

const quickActions = [
  {
    page: "financial" as Page,
    tab: "income",
    label: "আয় যোগ করুন",
    icon: <ArrowUpCircle size={22} />,
    color: "#166534",
    bg: "#dcfce7",
    emoji: "💰",
    ocid: "dashboard.income.primary_button",
  },
  {
    page: "financial" as Page,
    tab: "expense",
    label: "ব্যয় যোগ করুন",
    icon: <ArrowDownCircle size={22} />,
    color: "#991b1b",
    bg: "#fee2e2",
    emoji: "💸",
    ocid: "dashboard.expense.primary_button",
  },
  {
    page: "constitution" as Page,
    tab: undefined,
    label: "গঠনতন্ত্র দেখুন",
    icon: <BookOpen size={22} />,
    color: "#92400e",
    bg: "#fef3c7",
    emoji: "📖",
    ocid: "dashboard.constitution.secondary_button",
  },
  {
    page: "financial" as Page,
    tab: undefined,
    label: "আর্থিক হিসাব",
    icon: <TrendingUp size={22} />,
    color: "#1e40af",
    bg: "#dbeafe",
    emoji: "📊",
    ocid: "dashboard.financial.secondary_button",
  },
  {
    page: "members" as Page,
    tab: undefined,
    label: "সদস্য তালিকা",
    icon: <Users size={22} />,
    color: DARK_GREEN,
    bg: "#d1fae5",
    emoji: "👥",
    ocid: "dashboard.members.secondary_button",
  },
  {
    page: "reports" as Page,
    tab: undefined,
    label: "রিপোর্ট ডাউনলোড",
    icon: <FileDown size={22} />,
    color: "#5b21b6",
    bg: "#ede9fe",
    emoji: "📄",
    ocid: "dashboard.reports.secondary_button",
  },
  {
    page: "blooddonor" as Page,
    tab: undefined,
    label: "রক্তদাতা গ্রুপ",
    icon: <Droplets size={22} />,
    color: "#991b1b",
    bg: "#fee2e2",
    emoji: "🩸",
    ocid: "dashboard.blooddonor.secondary_button",
  },
  {
    page: "familytree" as Page,
    tab: undefined,
    label: "বংশপরম্পরা চার্ট",
    icon: <GitBranch size={22} />,
    color: "#065f46",
    bg: "#d1fae5",
    emoji: "🌳",
    ocid: "dashboard.familytree.secondary_button",
  },
  {
    page: "financial" as Page,
    tab: "quarterly",
    label: "ত্রৈমাসিক চাঁদা",
    icon: <Wallet size={22} />,
    color: "#b45309",
    bg: "#fef9c3",
    emoji: "💳",
    ocid: "dashboard.quarterly.secondary_button",
  },
];

export default function DashboardPage({ actor, onNavigate }: Props) {
  const { data: incomeRecords = [] } = useQuery<IncomeRecord[]>({
    queryKey: ["incomeRecords"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const l = await (actor as any).getAllIncomeRecords();
        return l;
      } catch {
        return [];
      }
    },
    enabled: !!actor,
  });

  const { data: expenseRecords = [] } = useQuery<ExpenseRecord[]>({
    queryKey: ["expenseRecords"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const l = await (actor as any).getAllExpenseRecords();
        return l;
      } catch {
        return [];
      }
    },
    enabled: !!actor,
  });

  const totalIncome = incomeRecords.reduce(
    (s, r) => s + (Number(r.amount) || 0),
    0,
  );
  const totalExpense = expenseRecords.reduce(
    (s, r) => s + (Number(r.amount) || 0),
    0,
  );
  const surplus = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-xl p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${DARK_GREEN} 0%, ${DARKEST_GREEN} 100%)`,
          boxShadow: "0 6px 24px rgba(15,45,26,0.3)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5"
          style={{ background: GOLD, transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5"
          style={{ background: GOLD, transform: "translate(-30%, 30%)" }}
        />
        <div className="relative">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "rgba(212,175,55,0.6)" }}
          >
            ড্যাশবোর্ড
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: GOLD, fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            আপন ফাউন্ডেশন
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            সংগঠনের সামগ্রিক চিত্র ও দ্রুত কার্যক্রম
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="border-l-4 overflow-hidden"
          style={{ borderLeftColor: DARK_GREEN }}
          data-ocid="dashboard.income.card"
        >
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
              <ArrowUpCircle size={14} style={{ color: DARK_GREEN }} /> মোট আয়
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold" style={{ color: DARK_GREEN }}>
              ৳{totalIncome.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">সর্বমোট আয়</p>
          </CardContent>
        </Card>

        <Card
          className="border-l-4 border-l-red-600 overflow-hidden"
          data-ocid="dashboard.expense.card"
        >
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
              <ArrowDownCircle size={14} className="text-red-600" /> মোট ব্যয়
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold text-red-600">
              ৳{totalExpense.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">সর্বমোট ব্যয়</p>
          </CardContent>
        </Card>

        <Card
          className="border-l-4 overflow-hidden"
          style={{ borderLeftColor: surplus >= 0 ? "#2563eb" : "#dc2626" }}
          data-ocid="dashboard.surplus.card"
        >
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
              <TrendingUp
                size={14}
                style={{ color: surplus >= 0 ? "#2563eb" : "#dc2626" }}
              />{" "}
              উদ্বৃত্ত
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p
              className="text-2xl font-bold"
              style={{ color: surplus >= 0 ? "#2563eb" : "#dc2626" }}
            >
              ৳{surplus.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">নিট উদ্বৃত্ত</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-1 h-5 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${GOLD} 0%, ${DARK_GREEN} 100%)`,
            }}
          />
          <h2
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: DARK_GREEN }}
          >
            দ্রুত কার্যক্রম
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.ocid}
              type="button"
              onClick={() => onNavigate(action.page, action.tab)}
              className="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{
                background: action.bg,
                border: `1.5px solid ${action.color}20`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  `${action.color}60`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  `${action.color}20`;
              }}
              data-ocid={action.ocid}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: action.color }}
              >
                {action.icon}
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: action.color }}
              >
                {action.emoji} {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
