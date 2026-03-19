import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  TrendingUp,
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

const SEED_INCOME_TOTAL = 153000;
const SEED_EXPENSE_TOTAL = 23000;

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
  onNavigate: (page: Page, tab?: string) => void;
}

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

  const totalIncome =
    incomeRecords.length > 0
      ? incomeRecords.reduce((s, r) => s + (Number(r.amount) || 0), 0)
      : SEED_INCOME_TOTAL;
  const totalExpense =
    expenseRecords.length > 0
      ? expenseRecords.reduce((s, r) => s + (Number(r.amount) || 0), 0)
      : SEED_EXPENSE_TOTAL;
  const surplus = totalIncome - totalExpense;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-extrabold" style={{ color: "#166534" }}>
          আপন ফাউন্ডেশন
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          ড্যাশবোর্ডে স্বাগতম — সংগঠনের সামগ্রিক চিত্র
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="border-l-4"
          style={{ borderLeftColor: "#166534" }}
          data-ocid="dashboard.income.card"
        >
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ArrowUpCircle size={16} style={{ color: "#166534" }} /> মোট আয়
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: "#166534" }}>
              ৳{totalIncome.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-l-4 border-l-red-600"
          data-ocid="dashboard.expense.card"
        >
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ArrowDownCircle size={16} className="text-red-600" /> মোট ব্যয়
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              ৳{totalExpense.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-l-4 border-l-blue-600"
          data-ocid="dashboard.surplus.card"
        >
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" /> উদ্বৃত্ত
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              ৳{surplus.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold mb-3 text-foreground">
          দ্রুত কার্যক্রম
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => onNavigate("financial", "income")}
            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed transition-all hover:bg-green-50 hover:border-green-500 group"
            style={{ borderColor: "#16a34a" }}
            data-ocid="dashboard.income.primary_button"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ background: "#166534" }}
            >
              <Wallet size={22} />
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "#166534" }}
            >
              💰 আয় যোগ করুন
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("financial", "expense")}
            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-red-400 transition-all hover:bg-red-50 hover:border-red-600 group"
            data-ocid="dashboard.expense.primary_button"
          >
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white">
              <ArrowDownCircle size={22} />
            </div>
            <span className="text-sm font-semibold text-red-600">
              💸 ব্যয় যোগ করুন
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("constitution")}
            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-amber-400 transition-all hover:bg-amber-50 hover:border-amber-600 group"
            data-ocid="dashboard.constitution.secondary_button"
          >
            <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white">
              <BookOpen size={22} />
            </div>
            <span className="text-sm font-semibold text-amber-700">
              📖 গঠনতন্ত্র দেখুন
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
