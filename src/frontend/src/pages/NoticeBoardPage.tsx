import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Download, Eye } from "lucide-react";
import { useState } from "react";
import { loadSettings } from "../store/settingsStore";

interface Props {
  isAdmin: boolean;
}

export default function NoticeBoardPage({ isAdmin: _isAdmin }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState("");
  const [noticeNo, setNoticeNo] = useState("");
  const [date, setDate] = useState(today);
  const [body, setBody] = useState("");
  const [authority, setAuthority] = useState("");
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
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>নোটিশ</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans Bengali',sans-serif; background:#fff; color:#111; }
  .page { width:210mm; height:297mm; margin:0 auto; padding:18mm 20mm; background:#fff; position:relative; overflow:hidden; }
  .org-header { display:flex; align-items:center; gap:16px; border-bottom:3px double #166534; padding-bottom:12px; margin-bottom:14px; }
  .org-logo { width:60px; height:60px; object-fit:contain; }
  .org-title { flex:1; }
  .org-name { font-size:22px; font-weight:700; }
  .org-name-1 { color:${org.color1}; }
  .org-name-2 { color:${org.color2}; }
  .org-meta { font-size:11px; color:#444; margin-top:3px; line-height:1.7; }
  .notice-title { width:100%; text-align:center; margin:18px 0 10px; display:block; }
  .notice-title h2 { font-size:20px; font-weight:700; text-decoration:underline; display:inline-block; }
  .notice-meta { display:flex; justify-content:space-between; font-size:12px; color:#555; margin-bottom:12px; }
  .notice-heading { font-size:15px; font-weight:700; margin:12px 0 8px; }
  .notice-body { font-size:13px; line-height:2; white-space:pre-wrap; }
  .signature {
    position:absolute;
    bottom:28mm;
    left:20mm;
    right:20mm;
    text-align:right;
    font-size:13px;
  }
  .signature-line { border-top:1px solid #333; display:inline-block; min-width:160px; text-align:center; padding-top:4px; }
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
  @media print { @page { size:A4; margin:0; } body { margin:0; } .page { page-break-after:always; } }
</style>
</head>
<body>
<div class="page">
  <div class="org-header">
    <img src="${logoSrc}" class="org-logo" alt="লোগো" onerror="this.style.display='none'"/>
    <div class="org-title">
      <div class="org-name"><span class="org-name-1">${org.orgName1}</span> <span class="org-name-2">${org.orgName2}</span></div>
      <div class="org-meta">
        ${org.address} | ইমেইল: ${org.email} | হোয়াটসঅ্যাপ: ${org.whatsapp} | ওয়েব: ${org.website}
      </div>
    </div>
  </div>
  <div class="notice-title"><h2>নোটিশ</h2></div>
  <div class="notice-meta">
    <span>নোটিশ নং: ${noticeNo || "—"}</span>
    <span>তারিখ: ${formatDate(date)}</span>
  </div>
  <div class="notice-heading">${title}</div>
  <div class="notice-body">${body}</div>
  <div class="signature">
    <div class="signature-line">
      <div style="min-height:36px;"></div>
      ${authority || "কর্তৃপক্ষ"}<br/><span style="font-size:11px;color:#555;">স্বাক্ষর ও সিল</span>
    </div>
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
            নোটিশ তৈরি করুন এবং প্রিন্টযোগ্য PDF ডাউনলোড করুন
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-foreground border-b pb-2">
          নোটিশ সম্পাদনা
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
            <Eye size={16} className="mr-2" />
            Generate করুন
          </Button>
          {preview && (
            <Button
              onClick={handlePrint}
              variant="outline"
              data-ocid="noticeboard.secondary_button"
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
            data-ocid="noticeboard.panel"
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

            {/* Title — centered across full width */}
            <div
              style={{
                width: "100%",
                textAlign: "center",
                margin: "18px 0 10px",
                display: "block",
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

            {/* Meta */}
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

            {/* Heading */}
            {title && (
              <div
                style={{ fontWeight: 700, fontSize: 14, margin: "12px 0 8px" }}
              >
                {title}
              </div>
            )}

            {/* Body */}
            <div style={{ lineHeight: 2, whiteSpace: "pre-wrap" }}>{body}</div>

            {/* Signature — fixed at bottom, always 105px above footer */}
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
                <span style={{ fontSize: 11, color: "#555" }}>স্বাক্ষর ও সিল</span>
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
