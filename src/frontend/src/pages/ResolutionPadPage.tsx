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
import { ClipboardList, Download, Eye } from "lucide-react";
import { useState } from "react";
import { loadSettings } from "../store/settingsStore";

interface Props {
  isAdmin: boolean;
}

const MEETING_TYPES = ["সাধারণ সভা", "কার্যনির্বাহী সভা", "জরুরি সভা", "উপদেষ্টা পরিষদ সভা"];

export default function ResolutionPadPage({ isAdmin: _isAdmin }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [resNo, setResNo] = useState("");
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0]);
  const [meetingDate, setMeetingDate] = useState(today);
  const [venue, setVenue] = useState("");
  const [presiding, setPresiding] = useState("");
  const [attendees, setAttendees] = useState("");
  const [resolutions, setResolutions] = useState("");
  const [secretary, setSecretary] = useState("");
  const [preview, setPreview] = useState(false);

  const org = loadSettings();
  const logoSrc =
    org.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

  function formatDate(d: string) {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  function buildPrintHTML() {
    return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8"/>
<title>রেজুলেশন</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans Bengali',sans-serif; background:#fff; color:#111; }
  .page { width:210mm; height:297mm; margin:0 auto; padding:18mm 20mm; background:#fff; position:relative; overflow:hidden; }
  .org-header { display:flex; align-items:center; gap:16px; border-bottom:3px double #166534; padding-bottom:12px; margin-bottom:14px; }
  .org-logo { width:60px; height:60px; object-fit:contain; }
  .org-name { font-size:22px; font-weight:700; }
  .org-name-1 { color:${org.color1}; }
  .org-name-2 { color:${org.color2}; }
  .org-meta { font-size:11px; color:#444; margin-top:3px; line-height:1.7; }
  h2 { width:100%; text-align:center; font-size:18px; font-weight:700; text-decoration:underline; margin:16px 0 12px; display:block; }
  table { width:100%; border-collapse:collapse; font-size:12px; margin-bottom:16px; }
  td { padding:5px 8px; border:1px solid #bbb; }
  td:first-child { font-weight:600; width:40%; background:#f7fdf7; }
  .resolutions { font-size:13px; line-height:2; white-space:pre-wrap; }
  .sig-row {
    position:absolute;
    bottom:28mm;
    left:20mm;
    right:20mm;
    display:flex;
    justify-content:space-between;
  }
  .sig-box { text-align:center; min-width:140px; }
  .sig-space { height:36px; }
  .sig-line { border-top:1px solid #333; padding-top:4px; font-size:12px; }
  .footer-line {
    position:absolute;
    bottom:12mm;
    left:20mm;
    right:20mm;
    border-top:1px solid #ccc;
    padding-top:6px;
    text-align:center;
    font-size:11px;
    color:#888;
  }
  @media print { @page { size:A4; margin:0; } body { margin:0; } }
</style>
</head>
<body>
<div class="page">
  <div class="org-header">
    <img src="${logoSrc}" class="org-logo" alt="" onerror="this.style.display='none'"/>
    <div>
      <div class="org-name"><span class="org-name-1">${org.orgName1}</span> <span class="org-name-2">${org.orgName2}</span></div>
      <div class="org-meta">${org.address} | ইমেইল: ${org.email} | হোয়াটসঅ্যাপ: ${org.whatsapp} | ওয়েব: ${org.website}</div>
    </div>
  </div>
  <h2>সভার কার্যবিবরণী / রেজুলেশন</h2>
  <table>
    <tr><td>রেজুলেশন নং</td><td>${resNo || "—"}</td></tr>
    <tr><td>সভার ধরন</td><td>${meetingType}</td></tr>
    <tr><td>সভার তারিখ</td><td>${formatDate(meetingDate)}</td></tr>
    <tr><td>স্থান / ভেন্যু</td><td>${venue || "—"}</td></tr>
    <tr><td>সভাপতি</td><td>${presiding || "—"}</td></tr>
    <tr><td>উপস্থিত সদস্য সংখ্যা</td><td>${attendees || "—"}</td></tr>
  </table>
  <div class="resolutions">${resolutions}</div>
  <div class="sig-row">
    <div class="sig-box"><div class="sig-space"></div><div class="sig-line">${presiding || "সভাপতি"}<br/><span style="font-size:11px;color:#555;">সভাপতি — স্বাক্ষর ও সিল</span></div></div>
    <div class="sig-box"><div class="sig-space"></div><div class="sig-line">${secretary || "সম্পাদক"}<br/><span style="font-size:11px;color:#555;">সম্পাদক — স্বাক্ষর ও সিল</span></div></div>
  </div>
  <div class="footer-line">পৃষ্ঠা ১ | ${org.orgName1} ${org.orgName2}</div>
</div>
<script>window.onload=function(){window.print();}</script>
</body>
</html>`;
  }

  function handlePrint() {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.open();
    win.document.write(buildPrintHTML());
    win.document.close();
  }

  return (
    <div className="space-y-6" data-ocid="resolution.page">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
          style={{ background: "#7c3aed" }}
        >
          <ClipboardList size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#7c3aed" }}>
            রেজুলেশন প্যাড
          </h1>
          <p className="text-xs text-muted-foreground">
            সভার কার্যবিবরণী ও রেজুলেশন তৈরি করুন
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-foreground border-b pb-2">
          রেজুলেশন সম্পাদনা
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="resNo">রেজুলেশন নম্বর</Label>
            <Input
              id="resNo"
              placeholder="যেমন: ০১/২০২৫"
              value={resNo}
              onChange={(e) => setResNo(e.target.value)}
              data-ocid="resolution.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meetingType">সভার ধরন</Label>
            <Select value={meetingType} onValueChange={setMeetingType}>
              <SelectTrigger data-ocid="resolution.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="meetingDate">সভার তারিখ</Label>
            <Input
              id="meetingDate"
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              data-ocid="resolution.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="venue">স্থান / ভেন্যু</Label>
            <Input
              id="venue"
              placeholder="সভার স্থান"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              data-ocid="resolution.input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="presiding">সভাপতির নাম</Label>
            <Input
              id="presiding"
              placeholder="সভাপতির নাম"
              value={presiding}
              onChange={(e) => setPresiding(e.target.value)}
              data-ocid="resolution.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="attendees">উপস্থিত সদস্য সংখ্যা</Label>
            <Input
              id="attendees"
              type="number"
              placeholder="সংখ্যা"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              data-ocid="resolution.input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="secretary">সম্পাদকের নাম</Label>
          <Input
            id="secretary"
            placeholder="সম্পাদকের নাম ও পদবি"
            value={secretary}
            onChange={(e) => setSecretary(e.target.value)}
            data-ocid="resolution.input"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="resolutions">গৃহীত সিদ্ধান্তসমূহ (রেজুলেশন)</Label>
          <Textarea
            id="resolutions"
            placeholder={"১. প্রথম সিদ্ধান্ত লিখুন\n২. দ্বিতীয় সিদ্ধান্ত লিখুন\n..."}
            rows={10}
            value={resolutions}
            onChange={(e) => setResolutions(e.target.value)}
            className="font-medium leading-relaxed"
            data-ocid="resolution.textarea"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={() => setPreview(true)}
            style={{ background: "#7c3aed" }}
            className="text-white hover:opacity-90"
            data-ocid="resolution.primary_button"
          >
            <Eye size={16} className="mr-2" />
            Generate করুন
          </Button>
          {preview && (
            <Button
              onClick={handlePrint}
              variant="outline"
              data-ocid="resolution.secondary_button"
            >
              <Download size={16} className="mr-2" />
              PDF ডাউনলোড / প্রিন্ট করুন
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
            data-ocid="resolution.panel"
          >
            {/* Org Header */}
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
                  {org.address} | ইমেইল: {org.email} | হোয়াটসঅ্যাপ: {org.whatsapp}{" "}
                  | ওয়েব: {org.website}
                </div>
              </div>
            </div>

            {/* Title — centered */}
            <div
              style={{
                width: "100%",
                textAlign: "center",
                margin: "16px 0 12px",
                display: "block",
              }}
            >
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  textDecoration: "underline",
                  display: "inline-block",
                }}
              >
                সভার কার্যবিবরণী / রেজুলেশন
              </h2>
            </div>

            {/* Meeting details table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              <tbody>
                {[
                  ["রেজুলেশন নং", resNo || "—"],
                  ["সভার ধরন", meetingType],
                  ["সভার তারিখ", formatDate(meetingDate)],
                  ["স্থান / ভেন্যু", venue || "—"],
                  ["সভাপতি", presiding || "—"],
                  ["উপস্থিত সদস্য সংখ্যা", attendees || "—"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td
                      style={{
                        padding: "5px 8px",
                        border: "1px solid #bbb",
                        fontWeight: 600,
                        width: "40%",
                        background: "#f7fdf7",
                      }}
                    >
                      {k}
                    </td>
                    <td
                      style={{ padding: "5px 8px", border: "1px solid #bbb" }}
                    >
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Resolutions */}
            <div
              style={{
                lineHeight: 2,
                whiteSpace: "pre-wrap",
              }}
            >
              {resolutions}
            </div>

            {/* Signature row — fixed at bottom, always above footer */}
            <div
              style={{
                position: "absolute",
                bottom: 105,
                left: 75,
                right: 75,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div style={{ textAlign: "center", minWidth: 140 }}>
                <div style={{ minHeight: 36 }} />
                <div
                  style={{
                    borderTop: "1px solid #333",
                    paddingTop: 4,
                    fontSize: 12,
                  }}
                >
                  {presiding || "সভাপতি"}
                  <br />
                  <span style={{ fontSize: 11, color: "#555" }}>
                    সভাপতি — স্বাক্ষর ও সিল
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "center", minWidth: 140 }}>
                <div style={{ minHeight: 36 }} />
                <div
                  style={{
                    borderTop: "1px solid #333",
                    paddingTop: 4,
                    fontSize: 12,
                  }}
                >
                  {secretary || "সম্পাদক"}
                  <br />
                  <span style={{ fontSize: 11, color: "#555" }}>
                    সম্পাদক — স্বাক্ষর ও সিল
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
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
    </div>
  );
}
