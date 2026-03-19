import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  FolderOpen,
  Heart,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { backendInterface } from "../backend";

const mockMonthlyData = [
  { month: "জানুয়ারি", members: 10, donations: 45000 },
  { month: "ফেব্রুয়ারি", members: 8, donations: 52000 },
  { month: "মার্চ", members: 15, donations: 38000 },
  { month: "এপ্রিল", members: 12, donations: 68000 },
  { month: "মে", members: 9, donations: 55000 },
  { month: "জুন", members: 20, donations: 72000 },
];

const donationByCategory = [
  { name: "নগদ", value: 180000 },
  { name: "বস্তু-সামগ্রী", value: 80000 },
  { name: "অনুদান", value: 70000 },
];

const COLORS = ["#2D7DD2", "#2EAD63", "#F59E0B"];

const growthStats = [
  { label: "সদস্য বৃদ্ধির হার", value: "+১৮%", period: "গত ৬ মাসে" },
  { label: "অনুদান বৃদ্ধির হার", value: "+২৪%", period: "গত ৬ মাসে" },
  { label: "প্রকল্প সম্পাদনের হার", value: "৭৫%", period: "চলতি বছরে" },
];

interface Props {
  actor: backendInterface | null;
}

export default function Reports({ actor }: Props) {
  const statsQuery = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getDashboardStats();
    },
    enabled: !!actor,
  });

  const stats = statsQuery.data;

  const summaryCards = [
    {
      title: "মোট সক্রিয় সদস্য",
      value: stats ? Number(stats.totalActiveMembers) : 124,
      icon: Users,
      color: "#2D7DD2",
    },
    {
      title: "মোট অনুদান",
      value: stats
        ? `৳${stats.totalDonationsSum.toLocaleString()}`
        : "৳৩,৩০,০০০",
      icon: Heart,
      color: "#2EAD63",
    },
    {
      title: "মোট ইভেন্ট",
      value: stats ? Number(stats.upcomingEventsCount) : 12,
      icon: CalendarDays,
      color: "#F59E0B",
    },
    {
      title: "মোট প্রকল্প",
      value: stats ? Number(stats.activeProjectsCount) : 8,
      icon: FolderOpen,
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">রিপোর্ট ও পরিসংখ্যান</h1>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <Card key={c.title} className="shadow-xs">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${c.color}18` }}
                >
                  <c.icon size={18} style={{ color: c.color }} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {c.title}
                </span>
              </div>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              মাসিক নতুন সদস্য ও অনুদান
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="members"
                  fill="#2D7DD2"
                  name="নতুন সদস্য"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="donations"
                  fill="#2EAD63"
                  name="অনুদান (৳)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              অনুদানের ধরন অনুযায়ী বিতরণ
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donationByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donationByCategory.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        COLORS[
                          donationByCategory.indexOf(entry) % COLORS.length
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `৳${v.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: "#2EAD63" }} />
            <CardTitle className="text-sm font-semibold">
              সংগঠনের সার্বিক অগ্রগতি
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {growthStats.map((item) => (
              <div
                key={item.label}
                className="text-center p-4 rounded-xl"
                style={{ background: "#f8fafc" }}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#2D7DD2" }}
                >
                  {item.value}
                </div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.period}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
