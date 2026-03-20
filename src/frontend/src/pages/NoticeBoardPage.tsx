import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Download, Eye, Printer, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { loadSettings } from "../store/settingsStore";

const BENGALI_MONTHS = [
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
];

const LS_KEY = "aponNotices";

interface NoticeRecord {
  id: number;
  date: string;
  noticeNo: string;
  title: string;
  body: string;
  authority: string;
  createdAt: string;
}

interface Props {
  actor: any;
  isAdmin: boolean;
}

export default function NoticeBoardPage({ actor, isAdmin }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState("");
  const [noticeNo, setNoticeNo] = useState("");
  const [date, setDate] = useState(today);
  const [body, setBody] = useState("");
  const [authority, setAuthority] = useState("");
  const [preview, setPreview] = useState(false);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const qc = useQueryClient();
  const org = loadSettings();
  const logoSrc =
    org.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

  function formatDate(d: string) {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  function loadFromLS(): NoticeRecord[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  function saveToLS(list: NoticeRecord[]) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch {}
  }

  const { data: notices = [] } = useQuery<NoticeRecord[]>({
    queryKey: ["notices"],
    queryFn: async () => {
      if (!actor) return loadFromLS();
      try {
        const list = await actor.getAllNotices();
        return list.map((n: any) => ({
          id: Number(n.id),
          date: n.date,
          noticeNo: n.noticeNo,
          title: n.title,
          body: n.body,
          authority: n.authority,
          createdAt: n.createdAt,
        }));
      } catch {
        return loadFromLS();
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("no actor");
      await actor.addNotice(
        date,
        noticeNo,
        title,
        body,
        authority,
        new Date().toISOString(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notices"] });
      toast.success("নোটিশ সংরক্ষিত হয়েছে");
    },
    onError: () => {
      // fallback to localStorage
      const current = loadFromLS();
      const newRecord: NoticeRecord = {
        id: Date.now(),
        date,
        noticeNo,
        title,
        body,
        authority,
        createdAt: new Date().toISOString(),
      };
      const updated = [newRecord, ...current];
      saveToLS(updated);
      qc.setQueryData(["notices"], updated);
      toast.success("নোটিশ স্থানীয়ভাবে সংরক্ষিত হয়েছে");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error("no actor");
      await actor.deleteNotice(BigInt(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notices"] });
      toast.success("নোটিশ মুছে ফেলা হয়েছে");
    },
    onError: (_, id) => {
      const updated = loadFromLS().filter((n) => n.id !== id);
      saveToLS(updated);
      qc.setQueryData(["notices"], updated);
      toast.success("নোটিশ মুছে ফেলা হয়েছে");
    },
  });

  function buildPrintHTML(n?: Partial<NoticeRecord>) {
    const t = n?.title ?? title;
    const nn = n?.noticeNo ?? noticeNo;
    const d = n?.date ?? date;
    const b = n?.body ?? body;
    const a = n?.authority ?? authority;
    return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8"/>
<title>নোটিশ</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Noto Sans Bengali',sans-serif; background:#fff; color:#111; }
.page { width:210mm; min-height:297mm; margin:0 auto; padding:18mm 20mm; background:#fff; position:relative; }
.org-header { display:flex; align-items:center; gap:16px; border-bottom:3px double #166534; padding-bottom:12px; margin-bottom:14px; }
.org-logo { width:60px; height:60px; object-fit:contain; }
.org-name { font-size:22px; font-weight:700; }
.org-name-1 { color:${org.color1}; }
.org-name-2 { color:${org.color2}; }
.org-meta { font-size:11px; color:#444; margin-top:3px; line-height:1.7; }
.notice-title { width:100%; text-align:center; margin:18px 0 10px; }
.notice-title h2 { font-size:20px; font-weight:700; text-decoration:underline; display:inline-block; }
.notice-meta { display:flex; justify-content:space-between; font-size:12px; color:#555; margin-bottom:12px; }
.notice-heading { font-size:15px; font-weight:700; margin:12px 0 8px; }
.notice-body { font-size:13px; line-height:2; white-space:pre-wrap; }
.signature { position:absolute; bottom:28mm; left:20mm; right:20mm; text-align:right; font-size:13px; }
.signature-line { border-top:1px solid #333; display:inline-block; min-width:160px; text-align:center; padding-top:4px; }
.footer-line { position:absolute; bottom:12mm; left:20mm; right:20mm; border-top:1px solid #ccc; padding-top:6px; text-align:center; font-size:11px; color:#888; }
@media print { @page { size:A4; margin:0; } body { margin:0; } }
</style>
</head>
<body>
<div class="page" style="min-height:297mm;">
  <div class="org-header">
    <img src="${logoSrc}" class="org-logo" alt="" onerror="this.style.display='none'"/>
    <div class="org-title">
      <div class="org-name"><span class="org-name-1">${org.orgName1}</span> <span class="org-name-2">${org.orgName2}</span></div>
      <div class="org-meta">${org.address} | ইমেইল: ${org.email} | হোয়াটসঅ্যাপ: ${org.whatsapp} | ওয়েব: ${org.website}</div>
    </div>
  </div>
  <div class="notice-title"><h2>নোটিশ</h2></div>
  <div class="notice-meta"><span>নোটিশ নং: ${nn || "—"}</span><span>তারিখ: ${formatDate(d)}</span></div>
  <div class="notice-heading">${t}</div>
  <div class="notice-body">${b}</div>
  <div class="signature"><div class="signature-line"><div style="min-height:36px;"></div>${a || "কর্তৃপক্ষ"}<br/><span style="font-size:11px;color:#555;">স্বাক্ষর ও সিল</span></div></div>
  <div class="footer-line">পৃষ্ঠা ১ | ${org.orgName1} ${org.orgName2}</div>
</div>
<script>window.onload=function(){window.print();}</script>
</body>
</html>`;
  }

  function handlePrint(n?: Partial<NoticeRecord>) {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.open();
    win.document.write(buildPrintHTML(n));
    win.document.close();
  }

  const filteredNotices = notices.filter((n) => {
    if (!filterMonth && !filterYear) return true;
    const [y, m] = n.date.split("-");
    if (filterMonth && filterYear)
      return m === filterMonth.padStart(2, "0") && y === filterYear;
    if (filterMonth) return m === filterMonth.padStart(2, "0");
    if (filterYear) return y === filterYear;
    return true;
  });

  const availableYears = [...new Set(notices.map((n) => n.date.split("-")[0]))]
    .sort()
    .reverse();

  return (
    <div className="space-y-6" data-ocid="noticeboard.page">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
          style={{ background: "#166534" }}
        >
          <Bell size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#166534" }}>
            নোটিশ বোর্ড
          </h1>
          <p className="text-xs text-muted-foreground">
            নোটিশ তৈরি করুন এবং সিস্টেমে লিপিবদ্ধ করুন
          </p>
        </div>
      </div>

      {isAdmin ? (
        <>
          <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-foreground border-b pb-2">
              নতুন নোটিশ
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="noticeNo">নোটিশ নম্বর</Label>
                <Input
                  id="noticeNo"
                  placeholder="যেমন: ০১/২০২৫"
                  value={noticeNo}
                  onChange={(e) => setNoticeNo(e.target.value)}
                  data-ocid="noticeboard.input"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="noticeTitle">নোটিশের শিরোনাম</Label>
                <Input
                  id="noticeTitle"
                  placeholder="নোটিশের শিরোনাম লিখুন"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-ocid="noticeboard.input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="noticeDate">তারিখ</Label>
                <Input
                  id="noticeDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-ocid="noticeboard.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="authority">জারিকারী কর্তৃপক্ষ / স্বাক্ষরকারীর নাম</Label>
                <Input
                  id="authority"
                  placeholder="নাম ও পদবি"
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  data-ocid="noticeboard.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="noticeBody">নোটিশের বিষয়বস্তু</Label>
              <Textarea
                id="noticeBody"
                placeholder="এখানে নোটিশের পূর্ণ বিষয়বস্তু লিখুন..."
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="font-medium leading-relaxed"
                data-ocid="noticeboard.textarea"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={() => setPreview(true)}
                style={{ background: "#166534" }}
                className="text-white hover:opacity-90"
                data-ocid="noticeboard.primary_button"
              >
                <Eye size={16} className="mr-2" /> Generate করুন
              </Button>
              {preview && (
                <Button
                  onClick={() => handlePrint()}
                  variant="outline"
                  data-ocid="noticeboard.secondary_button"
                >
                  <Download size={16} className="mr-2" /> PDF ডাউনলোড / প্রিন্ট করুন
                </Button>
              )}
              {preview && (
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50"
                  data-ocid="noticeboard.save_button"
                >
                  <Save size={16} className="mr-2" /> সংরক্ষণ করুন
                </Button>
              )}
            </div>
          </div>

          {preview && (
            <div className="overflow-x-auto">
              <div
                style={{
                  width: "794px",
                  height: "1123px",
                  background: "#fff",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                  borderRadius: "4px",
                  padding: "68px 75px",
                  fontFamily: "'Noto Sans Bengali', sans-serif",
                  color: "#111",
                  fontSize: "13px",
                  position: "relative",
                  overflow: "hidden",
                }}
                data-ocid="noticeboard.panel"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    borderBottom: `3px double ${org.color1}`,
                    paddingBottom: 12,
                    marginBottom: 14,
                  }}
                >
                  <img
                    src={logoSrc}
                    alt="লোগো"
                    style={{ width: 56, height: 56, objectFit: "contain" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 20 }}>
                      <span style={{ color: org.color1 }}>{org.orgName1}</span>{" "}
                      <span style={{ color: org.color2 }}>{org.orgName2}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#444",
                        marginTop: 3,
                        lineHeight: 1.7,
                      }}
                    >
                      {org.address} | ইমেইল: {org.email} | হোয়াটসঅ্যাপ:{" "}
                      {org.whatsapp} | ওয়েব: {org.website}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    margin: "18px 0 10px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      textDecoration: "underline",
                      display: "inline-block",
                    }}
                  >
                    নোটিশ
                  </h2>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#555",
                    marginBottom: 12,
                  }}
                >
                  <span>নোটিশ নং: {noticeNo || "—"}</span>
                  <span>তারিখ: {formatDate(date)}</span>
                </div>
                {title && (
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      margin: "12px 0 8px",
                    }}
                  >
                    {title}
                  </div>
                )}
                <div style={{ lineHeight: 2, whiteSpace: "pre-wrap" }}>
                  {body}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 105,
                    left: 75,
                    right: 75,
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      borderTop: "1px solid #333",
                      display: "inline-block",
                      minWidth: 160,
                      textAlign: "center",
                      paddingTop: 4,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ minHeight: 36 }} />
                    {authority || "কর্তৃপক্ষ"}
                    <br />
                    <span style={{ fontSize: 11, color: "#555" }}>
                      স্বাক্ষর ও সিল
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #ccc",
                    position: "absolute",
                    bottom: 40,
                    left: 75,
                    right: 75,
                    paddingTop: 6,
                    textAlign: "center",
                    fontSize: 11,
                    color: "#888",
                  }}
                >
                  পৃষ্ঠা ১ | {org.orgName1} {org.orgName2}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          🔐 নোটিশ তৈরি করতে এডমিন লগইন করুন।
        </div>
      )}

      {/* Saved notices section */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b pb-2">
          সংরক্ষিত নোটিশ
        </h2>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">মাস অনুযায়ী</Label>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger
                className="w-40"
                data-ocid="noticeboard.filter.select"
              >
                <SelectValue placeholder="সব মাস" />
              </SelectTrigger>
              <SelectContent>
                {BENGALI_MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">বছর অনুযায়ী</Label>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger
                className="w-32"
                data-ocid="noticeboard.filter.select"
              >
                <SelectValue placeholder="সব বছর" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilterMonth("");
              setFilterYear("");
            }}
            data-ocid="noticeboard.secondary_button"
          >
            সব দেখুন
          </Button>
        </div>

        {filteredNotices.length === 0 ? (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="noticeboard.empty_state"
          >
            <Bell size={36} className="mx-auto mb-3 opacity-20" />
            <p>কোনো নোটিশ পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotices.map((n, idx) => (
              <div
                key={n.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                data-ocid={`noticeboard.item.${idx + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                      {n.noticeNo || "নং নেই"}
                    </span>
                    <span className="font-medium text-sm text-foreground truncate">
                      {n.title || "(শিরোনাম নেই)"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(n.date)} — {n.authority || "—"}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handlePrint(n)}
                    title="প্রিন্ট"
                    data-ocid={`noticeboard.print_button.${idx + 1}`}
                  >
                    <Printer size={14} />
                  </Button>
                  {isAdmin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(n.id)}
                      title="মুছুন"
                      data-ocid={`noticeboard.delete_button.${idx + 1}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
