import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
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
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { backendInterface } from "../backend";

const mockDonationData = [
  { month: "জান", amount: 45000 },
  { month: "ফেব", amount: 52000 },
  { month: "মার্চ", amount: 38000 },
  { month: "এপ্রিল", amount: 68000 },
  { month: "মে", amount: 55000 },
  { month: "জুন", amount: 72000 },
];

const mockEventAttendance = [
  { event: "বার্ষিক সভা", attendees: 45 },
  { event: "ফান্ড রেইজ", attendees: 80 },
  { event: "স্বাস্থ্য ক্যাম্প", attendees: 120 },
  { event: "শিক্ষা মেলা", attendees: 65 },
  { event: "সেবা দিবস", attendees: 95 },
];

const mockActivity = [
  { id: "a1", text: "নতুন সদস্য রাহেলা বেগম যোগ দিয়েছেন", time: "২ ঘন্টা আগে" },
  { id: "a2", text: "৳৫,০০০ অনুদান পাওয়া গেছে - করিম সাহেব", time: "৫ ঘন্টা আগে" },
  { id: "a3", text: "'শিক্ষা মেলা' ইভেন্ট তৈরি করা হয়েছে", time: "১ দিন আগে" },
  { id: "a4", text: "'বৃক্ষরোপণ প্রকল্প' সক্রিয় করা হয়েছে", time: "২ দিন আগে" },
  { id: "a5", text: "মাসিক রিপোর্ট তৈরি হয়েছে", time: "৩ দিন আগে" },
];

interface Props {
  actor: backendInterface | null;
  isAdmin: boolean;
}

export default function Dashboard({ actor }: Props) {
  const statsQuery = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getDashboardStats();
    },
    enabled: !!actor,
  });

  const stats = statsQuery.data;

  const kpiCards = [
    {
      title: "সক্রিয় সদস্য",
      value: stats ? Number(stats.totalActiveMembers) : 124,
      icon: Users,
      change: "+১২%",
      color: "#2D7DD2",
    },
    {
      title: "মোট অনুদান",
      value: stats
        ? `৳${stats.totalDonationsSum.toLocaleString()}`
        : "৳৩,৩০,০০০",
      icon: Heart,
      change: "+৮%",
      color: "#2EAD63",
    },
    {
      title: "আসন্ন ইভেন্ট",
      value: stats ? Number(stats.upcomingEventsCount) : 8,
      icon: CalendarDays,
      change: "+৩",
      color: "#F59E0B",
    },
    {
      title: "সক্রিয় প্রকল্প",
      value: stats ? Number(stats.activeProjectsCount) : 5,
      icon: FolderOpen,
      change: "+১",
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          অর্গানাইজেশন ড্যাশবোর্ড
        </h1>
        <span className="text-sm text-muted-foreground">মার্চ ২০২৬</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.title} className="shadow-xs">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </span>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}18` }}
                >
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {card.value}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={12} style={{ color: "#2EAD63" }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#2EAD63" }}
                >
                  {card.change} এই মাসে
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              মাসিক অনুদান পর্যালোচনা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockDonationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v: number) => [`৳${v.toLocaleString()}`, "অনুদান"]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2D7DD2"
                  strokeWidth={2.5}
                  dot={{ fill: "#2D7DD2", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              ইভেন্ট অংশগ্রহণকারী
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockEventAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="event" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="attendees"
                  fill="#2EAD63"
                  radius={[4, 4, 0, 0]}
                  name="অংশগ্রহণকারী"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            সাম্প্রতিক কার্যক্রম
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ background: "#2D7DD2" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{item.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.time}
                  </p>
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-muted-foreground flex-shrink-0 mt-0.5"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
