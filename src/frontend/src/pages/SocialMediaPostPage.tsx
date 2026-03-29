import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  Facebook,
  ImagePlus,
  Loader2,
  Share2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { loadSettings } from "../store/settingsStore";

const TEMPLATES = [
  {
    group: "অনুদান প্রচারণা",
    items: [
      { value: "donation-winter", label: "শীতবস্ত্র বিতরণ", cat: "donation-two" },
      {
        value: "donation-sports",
        label: "ক্রীড়া উপকরণ বিতরণ",
        cat: "donation-two",
      },
      {
        value: "donation-education",
        label: "শিক্ষা উপকরণ বিতরণ",
        cat: "donation-two",
      },
      { value: "donation-food", label: "খাদ্য/ওষুধ বিতরণ", cat: "donation-two" },
    ],
  },
  {
    group: "ধর্মীয় শুভেচ্ছা",
    items: [
      { value: "religious-eid-fitr", label: "ঈদুল ফিতর শুভেচ্ছা", cat: "eid" },
      { value: "religious-eid-adha", label: "ঈদুল আযহা শুভেচ্ছা", cat: "eid" },
      { value: "religious-ramadan", label: "রমজান মোবারক", cat: "eid" },
    ],
  },
  {
    group: "জাতীয় দিবস",
    items: [
      { value: "national-language", label: "মাতৃভাষা দিবস", cat: "national" },
      { value: "national-independence", label: "স্বাধীনতা দিবস", cat: "national" },
      { value: "national-victory", label: "বিজয় দিবস", cat: "victory" },
      { value: "national-mourning", label: "শোক দিবস", cat: "mourning" },
    ],
  },
  {
    group: "বিশেষ ঘোষণা",
    items: [
      { value: "announce-donation", label: "অনুদান প্রদান", cat: "donation-one" },
      {
        value: "announce-project",
        label: "নতুন প্রকল্প উদ্বোধন",
        cat: "announcement",
      },
      { value: "announce-event", label: "সভা/অনুষ্ঠান ঘোষণা", cat: "announcement" },
    ],
  },
  {
    group: "মানবসেবা/প্রেরণাদায়ক বার্তা",
    items: [
      {
        value: "humanitarian",
        label: "মানবসেবা/প্রেরণাদায়ক বার্তা",
        cat: "humanitarian",
      },
    ],
  },
];

type TemplateCat =
  | "donation-two"
  | "donation-one"
  | "eid"
  | "national"
  | "victory"
  | "mourning"
  | "announcement"
  | "humanitarian";

interface ImageConfig {
  count: number;
  label1?: string;
  label2?: string;
  instruction: string;
  style: "watermark" | "clear" | "optional-clear";
}

const IMAGE_CONFIG: Record<TemplateCat, ImageConfig> = {
  "donation-two": {
    count: 2,
    label1: "দাতার ছবি (বাম পাশে)",
    label2: "গ্রহীতার ছবি (ডান পাশে)",
    instruction:
      "২টি ছবি আপলোড করুন: (১) দাতার ছবি এবং (২) গ্রহীতার ছবি — দুটোই স্পষ্টভাবে প্রদর্শিত হবে।",
    style: "clear",
  },
  "donation-one": {
    count: 1,
    label1: "দাতার ছবি (কেন্দ্রে)",
    instruction:
      "১টি ছবি আপলোড করুন: দাতার ছবি — বড় বৃত্তাকার ফ্রেমে স্পষ্টভাবে প্রদর্শিত হবে।",
    style: "clear",
  },
  eid: {
    count: 1,
    label1: "মসজিদ বা ঈদ সংশ্লিষ্ট ছবি (জলছাপ হিসেবে)",
    instruction:
      "১টি ছবি আপলোড করুন (ঐচ্ছিক): মসজিদের মিনার বা ঈদ সংশ্লিষ্ট ছবি — জলছাপ স্টাইলে উপরে দেখাবে।",
    style: "watermark",
  },
  national: {
    count: 1,
    label1: "জাতীয় স্মৃতিসৌধ বা প্রতীকী ছবি (জলছাপ হিসেবে)",
    instruction:
      "১টি ছবি আপলোড করুন (ঐচ্ছিক): স্মৃতিসৌধ বা জাতীয় প্রতীক — জলছাপ স্টাইলে কেন্দ্রে দেখাবে।",
    style: "watermark",
  },
  victory: {
    count: 1,
    label1: "স্মৃতিসৌধের ছবি (জলছাপ হিসেবে)",
    instruction:
      "১টি ছবি আপলোড করুন (ঐচ্ছিক): স্মৃতিসৌধের ছবি — কালো শেডে জলছাপ স্টাইলে কেন্দ্রে দেখাবে। বার্তা সাদা/সোনালি রঙে থাকবে।",
    style: "watermark",
  },
  mourning: {
    count: 1,
    label1: "শহীদ মিনারের ছবি (জলছাপ হিসেবে)",
    instruction:
      "১টি ছবি আপলোড করুন (ঐচ্ছিক): শহীদ মিনারের ছবি — সাদা বর্ডারে জলছাপ স্টাইলে কেন্দ্রে দেখাবে। বার্তা লাল/সাদা রঙে থাকবে।",
    style: "watermark",
  },
  announcement: {
    count: 1,
    label1: "প্রাসঙ্গিক ছবি (ঐচ্ছিক)",
    instruction: "১টি ছবি আপলোড করতে পারেন (ঐচ্ছিক) — স্পষ্টভাবে প্রদর্শিত হবে।",
    style: "optional-clear",
  },
  humanitarian: {
    count: 1,
    label1: "প্রেরণাদায়ক ছবি (ঐচ্ছিক)",
    instruction:
      "১টি ছবি আপলোড করতে পারেন (ঐচ্ছিক): মানবসেবা বা প্রেরণাদায়ক ছবি — স্পষ্ট ও মর্যাদাপূর্ণভাবে প্রদর্শিত হবে।",
    style: "optional-clear",
  },
};

type BgConfig = { from: string; via: string; to: string; accent: string };

const BG: Record<TemplateCat, BgConfig> = {
  "donation-two": {
    from: "#0d4a1f",
    via: "#1a6b3a",
    to: "#2d5a1a",
    accent: "#D4AF37",
  },
  "donation-one": {
    from: "#0d3a4a",
    via: "#1a5a6b",
    to: "#1a3a4a",
    accent: "#D4AF37",
  },
  eid: { from: "#2d1f5e", via: "#4a2d8a", to: "#1a0d40", accent: "#D4AF37" },
  national: {
    from: "#8B0000",
    via: "#cc2200",
    to: "#4a0000",
    accent: "#00cc44",
  },
  victory: {
    from: "#004d00",
    via: "#006600",
    to: "#002200",
    accent: "#D4AF37",
  },
  mourning: {
    from: "#1a1a1a",
    via: "#2d2d2d",
    to: "#0d0d0d",
    accent: "#ffffff",
  },
  announcement: {
    from: "#0d2a5e",
    via: "#1a4a8c",
    to: "#071a3e",
    accent: "#D4AF37",
  },
  humanitarian: {
    from: "#0d4a40",
    via: "#1a6b5e",
    to: "#0d2a26",
    accent: "#4ade80",
  },
};

function getCat(value: string): TemplateCat {
  for (const g of TEMPLATES)
    for (const t of g.items) if (t.value === value) return t.cat as TemplateCat;
  return "humanitarian";
}

function getLabel(value: string) {
  for (const g of TEMPLATES)
    for (const t of g.items) if (t.value === value) return t.label;
  return "";
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  if (!text) return y;
  const chars = text.split("");
  let line = "";
  let currentY = y;
  for (const char of chars) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line !== "") {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawCircularImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  r: number,
  borderColor: string,
  borderWidth: number,
  opacity = 1,
  grayScale = false,
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  if (grayScale) {
    ctx.filter = "grayscale(100%) brightness(0.6)";
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  // border
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.shadowColor = borderColor;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export default function SocialMediaPostPage() {
  const [template, setTemplate] = useState("donation-winter");
  const [message, setMessage] = useState("");
  const [caption, setCaption] = useState("");
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);

  const cat = getCat(template);
  const imgConf = IMAGE_CONFIG[cat];

  function handleImg1(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage1(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleImg2(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage2(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function generateCard() {
    if (!message.trim()) {
      toast.error("মূল বার্তা লিখুন");
      return;
    }
    setGenerating(true);
    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const W = 1200;
      const H = 1200;
      const bg = BG[cat];

      // ─── Background ───────────────────────────────────────────────
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, bg.from);
      grad.addColorStop(0.5, bg.via);
      grad.addColorStop(1, bg.to);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Decorative corner circles
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#ffffff";
      for (const [ax, ay, ar] of [
        [0, 0, 320],
        [W, H, 320],
        [W, 0, 200],
        [0, H, 200],
      ] as [number, number, number][]) {
        ctx.beginPath();
        ctx.arc(ax, ay, ar, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Dot mesh
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = "#ffffff";
      for (let dx = 40; dx < W; dx += 70)
        for (let dy = 40; dy < H; dy += 70) {
          ctx.beginPath();
          ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      ctx.globalAlpha = 1;

      // Center glow
      const rg = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        W * 0.55,
      );
      rg.addColorStop(0, "rgba(255,255,255,0.08)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);

      // Gold outer border
      ctx.strokeStyle = bg.accent;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, W - 10, H - 10);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 2;
      ctx.strokeRect(22, 22, W - 44, H - 44);

      // ─── Header Bar ───────────────────────────────────────────────
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = "rgba(255,255,255,0.94)";
      roundRect(ctx, 40, 30, W - 80, 160, 18);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      const orgSettings = loadSettings();
      const logoSrc =
        orgSettings.logoDataUrl ||
        "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";
      const logoImg = await loadImage(logoSrc);
      if (logoImg) {
        const cx = 112;
        const cy = 110;
        const r = 52;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      const orgName1 = orgSettings.orgName1 || "আপন";
      const orgName2 = orgSettings.orgName2 || "ফাউন্ডেশন";
      ctx.textAlign = "left";
      ctx.font = "bold 54px 'Hind Siliguri', sans-serif";
      ctx.fillStyle = "#1a6b2a";
      ctx.fillText(orgName1, 180, 102);
      const n1w = ctx.measureText(orgName1).width;
      ctx.fillStyle = "#cc4400";
      ctx.fillText(` ${orgName2}`, 180 + n1w, 102);
      ctx.font = "24px 'Hind Siliguri', sans-serif";
      ctx.fillStyle = "#7b2d00";
      ctx.fillText(orgSettings.address || "বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ", 180, 145);

      // Template badge
      const tLabel = getLabel(template);
      ctx.font = "20px 'Hind Siliguri', sans-serif";
      const bw = ctx.measureText(tLabel).width + 36;
      ctx.fillStyle = "rgba(212,175,55,0.92)";
      roundRect(ctx, W - 50 - bw, 75, bw, 36, 18);
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      ctx.textAlign = "center";
      ctx.fillText(tLabel, W - 50 - bw / 2, 99);

      // ─── Image area (template-specific) ──────────────────────────
      const img1 = image1 ? await loadImage(image1) : null;
      const img2 = image2 ? await loadImage(image2) : null;

      if (cat === "donation-two") {
        // Donor (left) + Recipient (right) — CLEAR style
        const r = 160;
        const y = 420;
        if (img1)
          drawCircularImage(ctx, img1, W / 2 - 220, y, r, "#D4AF37", 7, 1);
        if (img2)
          drawCircularImage(ctx, img2, W / 2 + 220, y, r, "#22c55e", 7, 1);
        // Labels under images
        ctx.font = "24px 'Hind Siliguri', sans-serif";
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#D4AF37";
        ctx.textAlign = "center";
        if (img1) ctx.fillText("দাতা", W / 2 - 220, y + r + 35);
        if (img2) {
          ctx.fillStyle = "#22c55e";
          ctx.fillText("গ্রহীতা", W / 2 + 220, y + r + 35);
        }
        ctx.globalAlpha = 1;
        // Plus sign between
        if (img1 && img2) {
          ctx.font = "bold 48px sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.fillText("+", W / 2, y + 16);
        }
      } else if (cat === "donation-one") {
        // Single donor — CLEAR, large center
        const r = 200;
        if (img1) drawCircularImage(ctx, img1, W / 2, 500, r, "#D4AF37", 9, 1);
        // Golden glow ring
        if (img1) {
          ctx.save();
          const glowRing = ctx.createRadialGradient(
            W / 2,
            500,
            r - 10,
            W / 2,
            500,
            r + 40,
          );
          glowRing.addColorStop(0, "rgba(212,175,55,0.5)");
          glowRing.addColorStop(1, "rgba(212,175,55,0)");
          ctx.fillStyle = glowRing;
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }
      } else if (cat === "eid") {
        // Mosque image WATERMARK style — top circular, gold border
        if (img1) {
          drawCircularImage(
            ctx,
            img1,
            W / 2,
            380,
            170,
            "#D4AF37",
            5,
            0.28,
            false,
          );
        }
        // "ঈদ মোবারক" center title
        ctx.font = "bold 96px 'Hind Siliguri', sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(212,175,55,0.8)";
        ctx.shadowBlur = 30;
        ctx.fillStyle = "#D4AF37";
        ctx.fillText("ঈদ মোবারক", W / 2, 600);
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      } else if (cat === "victory") {
        // Watermark style — center, black-shaded
        if (img1) {
          drawCircularImage(
            ctx,
            img1,
            W / 2,
            520,
            200,
            "rgba(255,255,255,0.3)",
            4,
            0.25,
            true,
          );
        }
      } else if (cat === "mourning") {
        // Watermark style — center, white border
        if (img1) {
          drawCircularImage(
            ctx,
            img1,
            W / 2,
            520,
            200,
            "#ffffff",
            5,
            0.25,
            true,
          );
        }
      } else if (cat === "national") {
        // Watermark style
        if (img1) {
          drawCircularImage(
            ctx,
            img1,
            W / 2,
            520,
            190,
            "rgba(255,255,255,0.4)",
            4,
            0.25,
            true,
          );
        }
      } else if (cat === "announcement" || cat === "humanitarian") {
        // Optional clear image
        if (img1) {
          const r = 170;
          drawCircularImage(
            ctx,
            img1,
            W / 2,
            440,
            r,
            "rgba(255,255,255,0.5)",
            4,
            1,
          );
        }
      }

      // ─── Main message text ─────────────────────────────────────────
      let msgColor = "#ffffff";
      let msgShadow = "rgba(0,0,0,0.6)";
      if (cat === "victory") {
        msgColor = "#D4AF37";
        msgShadow = "rgba(212,175,55,0.5)";
      }
      if (cat === "mourning") {
        msgColor = "#ff4444";
        msgShadow = "rgba(220,50,50,0.5)";
      }

      let msgY = 700;
      // For donation-two: push message below the portraits
      if (cat === "donation-two") msgY = 650;
      // For donation-one: push message below the big portrait
      if (cat === "donation-one") msgY = 760;
      // For eid: push below eid mubarak
      if (cat === "eid") msgY = 680;

      ctx.textAlign = "center";
      ctx.font = "bold 62px 'Hind Siliguri', sans-serif";
      ctx.shadowColor = msgShadow;
      ctx.shadowBlur = 20;
      ctx.fillStyle = msgColor;
      const nextMsgY = wrapText(ctx, message, W / 2, msgY, W - 160, 80);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Caption
      if (caption.trim()) {
        ctx.font = "36px 'Hind Siliguri', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.78)";
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 8;
        wrapText(ctx, caption, W / 2, nextMsgY + 24, W - 200, 52);
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      // ─── Footer ───────────────────────────────────────────────────
      ctx.strokeStyle = "rgba(212,175,55,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, H - 112);
      ctx.lineTo(W - 60, H - 112);
      ctx.stroke();

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, H - 110, W, 110);
      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 28px 'Hind Siliguri', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🌐  facebook.com/aponfoundation.bd", W / 2, H - 62);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "22px 'Hind Siliguri', sans-serif";
      ctx.fillText("আপন ফাউন্ডেশন — বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ", W / 2, H - 28);

      setCardDataUrl(canvas.toDataURL("image/png"));
      toast.success("ফটো কার্ড তৈরি হয়েছে!");
    } finally {
      setGenerating(false);
    }
  }

  function downloadCard() {
    if (!cardDataUrl) return;
    const a = document.createElement("a");
    a.href = cardDataUrl;
    a.download = `apon-foundation-post-${Date.now()}.png`;
    a.click();
    toast.success("ডাউনলোড শুরু হয়েছে");
  }

  function shareToFacebook() {
    window.open(
      "https://www.facebook.com/aponfoundation.bd",
      "_blank",
      "noopener,noreferrer",
    );
    toast.info("ফেসবুক পেজ খুলছে — কার্ডটি ডাউনলোড করে পোস্ট করুন");
  }

  return (
    <div style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
      {/* Banner */}
      <div
        className="rounded-xl mb-6 px-6 py-5 flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #1a4d2e 0%, #0f2d1a 100%)",
          boxShadow: "0 4px 20px rgba(15,45,26,0.3)",
        }}
      >
        <div
          className="p-3 rounded-lg"
          style={{ background: "rgba(212,175,55,0.15)" }}
        >
          <Share2 size={28} style={{ color: "#D4AF37" }} />
        </div>
        <div>
          <h1
            className="text-xl font-bold"
            style={{
              color: "#D4AF37",
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            সোশ্যাল মিডিয়া পোস্ট তৈরি করুন
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            প্রফেশনাল ফটো কার্ড জেনারেট করুন ও ফেসবুকে শেয়ার করুন
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div
          className="rounded-xl p-6 space-y-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <h2 className="text-base font-semibold" style={{ color: "#D4AF37" }}>
            ফর্ম পূরণ করুন
          </h2>

          {/* Template dropdown */}
          <div className="space-y-2">
            <Label style={{ color: "rgba(255,255,255,0.8)" }}>
              টেমপ্লেট নির্বাচন করুন
            </Label>
            <select
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                setImage1(null);
                setImage2(null);
                setCardDataUrl(null);
              }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#ffffff",
                fontFamily: "'Hind Siliguri', sans-serif",
              }}
              data-ocid="socialmedia.select"
            >
              {TEMPLATES.map((g) => (
                <optgroup
                  key={g.group}
                  label={g.group}
                  style={{ background: "#1a4d2e" }}
                >
                  {g.items.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                      style={{ background: "#1a3a26" }}
                    >
                      {item.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Image upload — dynamic based on template */}
          <div className="space-y-3">
            <Label style={{ color: "rgba(255,255,255,0.8)" }}>ছবি আপলোড</Label>
            {/* Instruction box */}
            <div
              className="p-3 rounded-lg text-xs"
              style={{
                background: "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.25)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              📷 {imgConf.instruction}
            </div>

            {/* Image 1 */}
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {imgConf.label1 ?? "ছবি"}
              </p>
              <button
                type="button"
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all w-full text-left"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px dashed rgba(212,175,55,0.4)",
                }}
                onClick={() => file1Ref.current?.click()}
              >
                <ImagePlus size={18} style={{ color: "#D4AF37" }} />
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {image1 ? "ছবি নির্বাচিত ✓" : "ছবি নির্বাচন করুন"}
                </span>
                <input
                  ref={file1Ref}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImg1}
                />
              </button>
              {image1 && (
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={image1}
                    alt="p1"
                    className="h-14 w-14 object-cover rounded-full"
                    style={{ border: "2px solid #D4AF37" }}
                  />
                  <button
                    type="button"
                    onClick={() => setImage1(null)}
                    className="p-1 rounded-full"
                    style={{
                      color: "#e55",
                      border: "1px solid rgba(220,80,80,0.4)",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Image 2 (only for donation-two) */}
            {imgConf.count === 2 && (
              <div>
                <p
                  className="text-xs mb-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {imgConf.label2 ?? "দ্বিতীয় ছবি"}
                </p>
                <button
                  type="button"
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all w-full text-left"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px dashed rgba(34,197,94,0.4)",
                  }}
                  onClick={() => file2Ref.current?.click()}
                >
                  <ImagePlus size={18} style={{ color: "#22c55e" }} />
                  <span
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {image2 ? "ছবি নির্বাচিত ✓" : "দ্বিতীয় ছবি নির্বাচন করুন"}
                  </span>
                  <input
                    ref={file2Ref}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImg2}
                  />
                </button>
                {image2 && (
                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={image2}
                      alt="p2"
                      className="h-14 w-14 object-cover rounded-full"
                      style={{ border: "2px solid #22c55e" }}
                    />
                    <button
                      type="button"
                      onClick={() => setImage2(null)}
                      className="p-1 rounded-full"
                      style={{
                        color: "#e55",
                        border: "1px solid rgba(220,80,80,0.4)",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main message */}
          <div className="space-y-2">
            <Label style={{ color: "rgba(255,255,255,0.8)" }}>
              মূল বার্তা <span style={{ color: "#e55" }}>*</span>
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="আপনার প্রধান বার্তা লিখুন..."
              rows={4}
              className="resize-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(212,175,55,0.25)",
                color: "#fff",
                fontFamily: "'Hind Siliguri', sans-serif",
              }}
              data-ocid="socialmedia.textarea"
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label style={{ color: "rgba(255,255,255,0.8)" }}>
              সংক্ষিপ্ত বিবরণ / ক্যাপশন
            </Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="ছোট ক্যাপশন বা বিবরণ (ঐচ্ছিক)..."
              rows={3}
              className="resize-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(212,175,55,0.25)",
                color: "#fff",
                fontFamily: "'Hind Siliguri', sans-serif",
              }}
              data-ocid="socialmedia.caption.textarea"
            />
          </div>

          {/* Generate button */}
          <Button
            onClick={() => {
              void generateCard();
            }}
            disabled={generating}
            className="w-full text-sm font-semibold py-3"
            style={{
              background: generating
                ? "rgba(212,175,55,0.4)"
                : "linear-gradient(135deg, #D4AF37 0%, #B8960C 100%)",
              color: "#0f2d1a",
              border: "none",
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
            data-ocid="socialmedia.submit_button"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                তৈরি হচ্ছে...
              </>
            ) : (
              "কার্ড তৈরি করুন"
            )}
          </Button>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold" style={{ color: "#D4AF37" }}>
            ফটো কার্ড প্রিভিউ
          </h2>

          <canvas
            ref={canvasRef}
            width={1200}
            height={1200}
            style={{ display: "none" }}
          />

          <div
            className="rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(212,175,55,0.2)",
              minHeight: "340px",
            }}
            data-ocid="socialmedia.canvas_target"
          >
            {cardDataUrl ? (
              <img
                src={cardDataUrl}
                alt="Generated Card"
                className="w-full rounded-lg"
                style={{ maxHeight: "560px", objectFit: "contain" }}
              />
            ) : (
              <div
                className="text-center py-16 space-y-3"
                data-ocid="socialmedia.empty_state"
              >
                <Share2
                  size={48}
                  style={{ color: "rgba(212,175,55,0.3)", margin: "0 auto" }}
                />
                <p style={{ color: "rgba(255,255,255,0.3)" }}>
                  ফর্ম পূরণ করে কার্ড তৈরি করুন
                </p>
              </div>
            )}
          </div>

          {cardDataUrl && (
            <div
              className="grid grid-cols-2 gap-3"
              data-ocid="socialmedia.success_state"
            >
              <Button
                onClick={downloadCard}
                className="flex items-center justify-center gap-2 text-sm font-semibold py-3"
                style={{
                  background:
                    "linear-gradient(135deg, #1a4d2e 0%, #0f2d1a 100%)",
                  color: "#D4AF37",
                  border: "1px solid rgba(212,175,55,0.4)",
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
                data-ocid="socialmedia.primary_button"
              >
                <Download size={16} />
                PNG ডাউনলোড
              </Button>
              <Button
                onClick={shareToFacebook}
                className="flex items-center justify-center gap-2 text-sm font-semibold py-3"
                style={{
                  background:
                    "linear-gradient(135deg, #1877f2 0%, #0d5bc7 100%)",
                  color: "#ffffff",
                  border: "none",
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
                data-ocid="socialmedia.secondary_button"
              >
                <Facebook size={16} />
                ফেসবুক পেজ
              </Button>
            </div>
          )}

          {cardDataUrl && (
            <div
              className="p-3 rounded-lg text-xs"
              style={{
                background: "rgba(24,119,242,0.1)",
                border: "1px solid rgba(24,119,242,0.3)",
                color: "rgba(255,255,255,0.65)",
                fontFamily: "'Hind Siliguri', sans-serif",
              }}
            >
              💡 PNG ডাউনলোড করুন → ফেসবুক পেজ খুলুন → ছবি আপলোড করে পোস্ট করুন।
              <br />
              <a
                href="https://www.facebook.com/aponfoundation.bd"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#60a5fa", textDecoration: "underline" }}
              >
                facebook.com/aponfoundation.bd
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
