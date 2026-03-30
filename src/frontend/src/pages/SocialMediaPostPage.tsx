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
  {
    group: "ধর্মীয় বিশেষ দিবস",
    items: [
      {
        value: "religious-miladunnabi",
        label: "মিলাদুন্নবী (সা.)",
        cat: "religious-special",
      },
      {
        value: "religious-shabe-barat",
        label: "শবে বরাত",
        cat: "religious-special",
      },
      {
        value: "religious-shabe-qadr",
        label: "শবে কদর",
        cat: "religious-special",
      },
      {
        value: "religious-quran",
        label: "কুরআনের বাণী প্রচার",
        cat: "religious-special",
      },
      {
        value: "religious-hadith",
        label: "হাদিস প্রচার",
        cat: "religious-special",
      },
    ],
  },
  {
    group: "আন্তর্জাতিক/বিশ্ব দিবস",
    items: [
      {
        value: "world-environment",
        label: "বিশ্ব পরিবেশ দিবস",
        cat: "world-day",
      },
      { value: "world-health", label: "বিশ্ব স্বাস্থ্য দিবস", cat: "world-day" },
      { value: "world-women", label: "আন্তর্জাতিক নারী দিবস", cat: "world-day" },
      { value: "world-youth", label: "আন্তর্জাতিক যুব দিবস", cat: "world-day" },
      {
        value: "world-humanrights",
        label: "বিশ্ব মানবাধিকার দিবস",
        cat: "world-day",
      },
      { value: "pohela-boishakh", label: "পহেলা বৈশাখ শুভেচ্ছা", cat: "cultural" },
    ],
  },
  {
    group: "সচেতনতা ও কর্মসূচি",
    items: [
      { value: "program-tree", label: "বৃক্ষরোপণ কর্মসূচি", cat: "program" },
      { value: "program-blood", label: "রক্তদান কর্মসূচি", cat: "program" },
      { value: "awareness-drug", label: "মাদকবিরোধী সচেতনতা", cat: "awareness" },
      { value: "awareness-road", label: "সড়ক নিরাপত্তা সচেতনতা", cat: "awareness" },
      {
        value: "program-health-camp",
        label: "স্বাস্থ্য ক্যাম্প/ফ্রি মেডিকেল চেকআপ",
        cat: "program",
      },
      {
        value: "award-student",
        label: "মেধাবী শিক্ষার্থী পুরস্কার প্রদান",
        cat: "award",
      },
      {
        value: "event-cultural",
        label: "সাংস্কৃতিক অনুষ্ঠান আয়োজন",
        cat: "cultural",
      },
      {
        value: "event-workshop",
        label: "প্রশিক্ষণ কর্মশালা ঘোষণা",
        cat: "announcement",
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
  | "humanitarian"
  | "religious-special"
  | "world-day"
  | "cultural"
  | "program"
  | "awareness"
  | "award";

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
  "religious-special": {
    count: 1,
    label1: "প্রাসঙ্গিক ছবি (ঐচ্ছিক)",
    instruction: "১টি ছবি আপলোড করতে পারেন (ঐচ্ছিক) — জলছাপ স্টাইলে প্রদর্শিত হবে।",
    style: "watermark",
  },
  "world-day": {
    count: 1,
    label1: "প্রাসঙ্গিক ছবি (ঐচ্ছিক)",
    instruction: "১টি ছবি আপলোড করতে পারেন (ঐচ্ছিক) — জলছাপ স্টাইলে প্রদর্শিত হবে।",
    style: "watermark",
  },
  cultural: {
    count: 1,
    label1: "প্রাসঙ্গিক ছবি (ঐচ্ছিক)",
    instruction: "১টি ছবি আপলোড করতে পারেন (ঐচ্ছিক) — স্পষ্টভাবে প্রদর্শিত হবে।",
    style: "optional-clear",
  },
  program: {
    count: 1,
    label1: "প্রাসঙ্গিক ছবি (ঐচ্ছিক)",
    instruction: "১টি ছবি আপলোড করতে পারেন (ঐচ্ছিক) — স্পষ্টভাবে প্রদর্শিত হবে।",
    style: "optional-clear",
  },
  awareness: {
    count: 1,
    label1: "প্রাসঙ্গিক ছবি (ঐচ্ছিক)",
    instruction: "১টি ছবি আপলোড করতে পারেন (ঐচ্ছিক) — স্পষ্টভাবে প্রদর্শিত হবে।",
    style: "optional-clear",
  },
  award: {
    count: 1,
    label1: "পুরস্কারপ্রাপ্ত শিক্ষার্থীর ছবি (ঐচ্ছিক)",
    instruction: "১টি ছবি আপলোড করতে পারেন (ঐচ্ছিক) — স্পষ্টভাবে প্রদর্শিত হবে।",
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
  "religious-special": {
    from: "#1a3a1a",
    via: "#2d5c2d",
    to: "#0d1f0d",
    accent: "#D4AF37",
  },
  "world-day": {
    from: "#0d2a4a",
    via: "#1a4a6b",
    to: "#071a30",
    accent: "#4ade80",
  },
  cultural: {
    from: "#4a1a0d",
    via: "#6b2d1a",
    to: "#2a0d06",
    accent: "#F97316",
  },
  program: {
    from: "#0d4a1f",
    via: "#1a6b3a",
    to: "#062a10",
    accent: "#22c55e",
  },
  awareness: {
    from: "#4a0d0d",
    via: "#6b1a1a",
    to: "#2a0606",
    accent: "#ef4444",
  },
  award: { from: "#2a1f0d", via: "#4a3a1a", to: "#1a0f06", accent: "#D4AF37" },
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

// ─── Template-specific background drawing ─────────────────────────────────
function drawTemplateBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  cat: TemplateCat,
  templateValue = "",
): void {
  const bg = BG[cat];

  // ── Template-specific backgrounds (before cat-based logic) ──
  if (templateValue === "religious-quran") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#e8f5e9");
    grad.addColorStop(0.5, "#c8e6c9");
    grad.addColorStop(1, "#a5d6a7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(0,100,0,0.08)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const cx = W / 2 + Math.cos(angle) * 380;
      const cy = H / 2 + Math.sin(angle) * 380;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 340, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 300, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x1 = W / 2 + Math.cos(a) * 300;
      const y1 = H / 2 + Math.sin(a) * 300;
      const x2 = W / 2 + Math.cos(a + Math.PI / 6) * 300;
      const y2 = H / 2 + Math.sin(a + Math.PI / 6) * 300;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(0,100,0,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "religious-hadith") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.5, "#e8f5e9");
    grad.addColorStop(1, "#c8e6c9");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(0,80,0,0.07)";
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      const y = H * 0.15 + i * (H * 0.14);
      ctx.beginPath();
      ctx.moveTo(100, y);
      ctx.bezierCurveTo(
        W * 0.3,
        y - 80 + i * 20,
        W * 0.7,
        y + 80 - i * 20,
        W - 100,
        y,
      );
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, 300, 220, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, 260, 180, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(0,100,0,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "world-environment") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#1b5e20");
    grad.addColorStop(0.5, "#2e7d32");
    grad.addColorStop(1, "#0d47a1");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (const [lx, ly] of [
      [200, 300],
      [600, 150],
      [1000, 250],
      [150, 700],
      [700, 800],
      [1050, 600],
      [400, 500],
      [850, 400],
      [300, 950],
      [900, 950],
    ] as [number, number][]) {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(lx * 0.01);
      ctx.beginPath();
      ctx.moveTo(0, -50);
      ctx.bezierCurveTo(40, -30, 40, 30, 0, 50);
      ctx.bezierCurveTo(-40, 30, -40, -30, 0, -50);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "world-health") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#e3f2fd");
    grad.addColorStop(0.5, "#bbdefb");
    grad.addColorStop(1, "#1565c0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(W / 2 - 25, H / 2 - 130, 50, 260);
    ctx.fillRect(W / 2 - 130, H / 2 - 25, 260, 50);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(W / 2, H / 2 + 280);
    ctx.bezierCurveTo(
      W / 2 - 180,
      H / 2 + 100,
      W / 2 - 240,
      H / 2 - 80,
      W / 2,
      H / 2 + 20,
    );
    ctx.bezierCurveTo(
      W / 2 + 240,
      H / 2 - 80,
      W / 2 + 180,
      H / 2 + 100,
      W / 2,
      H / 2 + 280,
    );
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "world-women") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#880e4f");
    grad.addColorStop(0.5, "#6a1b9a");
    grad.addColorStop(1, "#4a148c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 - 80, 220, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2, H / 2 + 140);
    ctx.lineTo(W / 2, H / 2 + 340);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2 - 80, H / 2 + 240);
    ctx.lineTo(W / 2 + 80, H / 2 + 240);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "world-youth") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0d47a1");
    grad.addColorStop(0.5, "#1565c0");
    grad.addColorStop(1, "#e65100");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (const sx of [W / 2 - 220, W / 2, W / 2 + 220]) {
      ctx.beginPath();
      ctx.ellipse(sx, H / 2 - 120, 35, 42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(sx - 40, H / 2 - 60, 80, 160);
    }
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "world-humanrights") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.6, "#e3f2fd");
    grad.addColorStop(1, "#1565c0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,150,0.07)";
    ctx.lineWidth = 6;
    for (const [px, py] of [
      [W / 2, H / 2],
      [W / 2 - 280, H / 2],
      [W / 2 + 280, H / 2],
    ] as [number, number][]) {
      ctx.save();
      ctx.translate(px, py);
      ctx.beginPath();
      ctx.moveTo(-30, 100);
      ctx.bezierCurveTo(-60, 50, -80, -20, -50, -80);
      ctx.bezierCurveTo(-20, -130, 20, -130, 50, -80);
      ctx.bezierCurveTo(80, -20, 60, 50, 30, 100);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(0,0,150,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "religious-miladunnabi") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#1b5e20");
    grad.addColorStop(0.5, "#2e7d32");
    grad.addColorStop(1, "#f9a825");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (const mx of [W / 2 - 300, W / 2, W / 2 + 300]) {
      ctx.fillRect(mx - 18, H / 2 - 200, 36, 250);
      ctx.beginPath();
      ctx.arc(mx, H / 2 - 200, 30, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, H / 2 - 250, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
    cg.addColorStop(0, "rgba(249,168,37,0.10)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "pohela-boishakh") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#b71c1c");
    grad.addColorStop(0.5, "#f48fb1");
    grad.addColorStop(1, "#ffffff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(180,0,0,0.07)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 250, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 200, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2 - 80, H / 2 - 40, 40, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2 + 80, H / 2 - 40, 40, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 40, 80, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(180,0,0,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "religious-shabe-barat") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0d1b3e");
    grad.addColorStop(0.5, "#1a237e");
    grad.addColorStop(1, "#0a0e2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a237e";
    ctx.beginPath();
    ctx.arc(W / 2 + 80, H / 2 - 40, 170, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    for (let i = 0; i < 20; i++) {
      const sx = (Math.sin(i * 137.508 * (Math.PI / 180)) * 0.5 + 0.5) * W;
      const sy = (Math.cos(i * 97.3 * (Math.PI / 180)) * 0.5 + 0.5) * H;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "religious-shabe-qadr") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#000000");
    grad.addColorStop(0.5, "#1a1200");
    grad.addColorStop(1, "#2a1f00");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(212,175,55,0.08)";
    ctx.lineWidth = 6;
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.15);
    ctx.strokeRect(-220, -160, 200, 300);
    ctx.restore();
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(0.15);
    ctx.strokeRect(20, -160, 200, 300);
    ctx.restore();
    ctx.strokeStyle = "rgba(212,175,55,0.05)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 + Math.cos(angle) * 100, H / 2 + Math.sin(angle) * 100);
      ctx.lineTo(W / 2 + Math.cos(angle) * 500, H / 2 + Math.sin(angle) * 500);
      ctx.stroke();
    }
    ctx.restore();
    const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.4);
    cg.addColorStop(0, "rgba(212,175,55,0.12)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(212,175,55,0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "program-tree") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#1b5e20");
    grad.addColorStop(0.5, "#2e7d32");
    grad.addColorStop(1, "#388e3c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (const tx of [W / 2 - 300, W / 2, W / 2 + 300]) {
      ctx.beginPath();
      ctx.moveTo(tx, H / 2 - 250);
      ctx.lineTo(tx - 100, H / 2 - 60);
      ctx.lineTo(tx + 100, H / 2 - 60);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tx, H / 2 - 180);
      ctx.lineTo(tx - 120, H / 2 + 20);
      ctx.lineTo(tx + 120, H / 2 + 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(tx - 20, H / 2 + 20, 40, 120);
    }
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "program-blood") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#b71c1c");
    grad.addColorStop(0.5, "#ef5350");
    grad.addColorStop(1, "#ffffff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.fillStyle = "rgba(180,0,0,0.08)";
    ctx.beginPath();
    ctx.moveTo(W / 2, H / 2 - 280);
    ctx.bezierCurveTo(
      W / 2 + 160,
      H / 2 - 100,
      W / 2 + 200,
      H / 2 + 80,
      W / 2,
      H / 2 + 180,
    );
    ctx.bezierCurveTo(
      W / 2 - 200,
      H / 2 + 80,
      W / 2 - 160,
      H / 2 - 100,
      W / 2,
      H / 2 - 280,
    );
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(180,0,0,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "awareness-drug") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#000000");
    grad.addColorStop(0.5, "#1a0000");
    grad.addColorStop(1, "#8b0000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(255,0,0,0.08)";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 280, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 50;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 250, H / 2);
    ctx.lineTo(W / 2 + 250, H / 2);
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 340, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,0,0,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "awareness-road") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#f9a825");
    grad.addColorStop(0.5, "#f57f17");
    grad.addColorStop(1, "#212121");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 8;
      const ox = W / 2 + 200 * Math.cos(angle);
      const oy = H / 2 + 200 * Math.sin(angle);
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 16;
    ctx.setLineDash([60, 40]);
    ctx.strokeStyle = "rgba(0,0,0,0.07)";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.8);
    ctx.lineTo(W, H * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, H * 0.9);
    ctx.lineTo(W, H * 0.9);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "program-health-camp") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#e3f2fd");
    grad.addColorStop(0.5, "#90caf9");
    grad.addColorStop(1, "#1565c0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(W / 2 - 20, H / 2 - 120, 40, 240);
    ctx.fillRect(W / 2 - 120, H / 2 - 20, 240, 40);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 200, H / 2 + 200);
    ctx.bezierCurveTo(
      W / 2 - 200,
      H / 2 + 50,
      W / 2 - 50,
      H / 2 - 150,
      W / 2 + 50,
      H / 2 - 150,
    );
    ctx.bezierCurveTo(
      W / 2 + 200,
      H / 2 - 150,
      W / 2 + 200,
      H / 2 + 100,
      W / 2,
      H / 2 + 200,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 220, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "award-student") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#1565c0");
    grad.addColorStop(0.5, "#0d47a1");
    grad.addColorStop(1, "#f9a825");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 8;
    ctx.save();
    ctx.translate(W / 2, H / 2 - 60);
    ctx.rotate(-0.12);
    ctx.strokeRect(-190, -120, 175, 220);
    ctx.restore();
    ctx.save();
    ctx.translate(W / 2, H / 2 - 60);
    ctx.rotate(0.12);
    ctx.strokeRect(15, -120, 175, 220);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 220, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 220, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
    cg.addColorStop(0, "rgba(249,168,37,0.10)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "event-cultural") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#880e4f");
    grad.addColorStop(0.5, "#b71c1c");
    grad.addColorStop(1, "#f9a825");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2 + 100, 70, 55, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(W / 2 + 50, H / 2 - 200, 14, 310);
    ctx.beginPath();
    ctx.moveTo(W / 2 + 64, H / 2 - 200);
    ctx.bezierCurveTo(
      W / 2 + 200,
      H / 2 - 150,
      W / 2 + 200,
      H / 2 - 80,
      W / 2 + 64,
      H / 2 - 50,
    );
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (templateValue === "event-workshop") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#1b5e20");
    grad.addColorStop(0.5, "#0d47a1");
    grad.addColorStop(1, "#0a2a6a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 8;
    ctx.save();
    ctx.translate(W / 2 - 50, H / 2);
    ctx.rotate(-0.1);
    ctx.strokeRect(-170, -130, 160, 240);
    ctx.restore();
    ctx.save();
    ctx.translate(W / 2 + 50, H / 2);
    ctx.rotate(0.1);
    ctx.strokeRect(10, -130, 160, 240);
    ctx.restore();
    ctx.save();
    ctx.translate(W / 2 + 250, H / 2 - 250);
    ctx.rotate(0.6);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(-12, -120, 24, 220);
    ctx.beginPath();
    ctx.moveTo(-12, 100);
    ctx.lineTo(0, 140);
    ctx.lineTo(12, 100);
    ctx.fill();
    ctx.restore();
    ctx.restore();
    ctx.strokeStyle = bg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    return;
  }

  if (cat === "victory") {
    // ── বিজয় দিবস: সবুজ+লাল গ্রেডিয়েন্ট, পতাকার ঢেউ ──
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#006633");
    grad.addColorStop(0.45, "#004d00");
    grad.addColorStop(1, "#cc0000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Red flag-sun circle at center-right
    ctx.save();
    const sunGrad = ctx.createRadialGradient(
      W * 0.75,
      H * 0.35,
      0,
      W * 0.75,
      H * 0.35,
      220,
    );
    sunGrad.addColorStop(0, "rgba(204,0,0,0.38)");
    sunGrad.addColorStop(0.6, "rgba(204,0,0,0.20)");
    sunGrad.addColorStop(1, "rgba(204,0,0,0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(W * 0.75, H * 0.35, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Flag-wave sinusoidal stripes
    for (let i = 0; i < 7; i++) {
      const amp = 40 + i * 18;
      const freq = 0.004 + i * 0.001;
      const yBase = H * 0.2 + i * (H * 0.085);
      ctx.save();
      ctx.strokeStyle = `rgba(0,${100 + i * 15},50,${0.1 + i * 0.015})`;
      ctx.lineWidth = 18 + i * 4;
      ctx.beginPath();
      ctx.moveTo(0, yBase);
      for (let x = 0; x <= W; x += 6) {
        ctx.lineTo(x, yBase + Math.sin(x * freq + i) * amp);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Diagonal texture lines
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let d = -H; d < W + H; d += 40) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + H, H);
      ctx.stroke();
    }
    ctx.restore();

    // Center radial glow
    const cg = ctx.createRadialGradient(
      W / 2,
      H / 2,
      0,
      W / 2,
      H / 2,
      W * 0.55,
    );
    cg.addColorStop(0, "rgba(255,255,255,0.06)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
  } else if (cat === "mourning") {
    // ── শোক দিবস: কালো+ধূসর, স্মোক+মোমবাতির আলো ──
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0a0a0a");
    grad.addColorStop(0.5, "#111111");
    grad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Smoke columns (wispy vertical beziers)
    const smokeCols = [
      W * 0.18,
      W * 0.32,
      W * 0.5,
      W * 0.68,
      W * 0.82,
      W * 0.25,
      W * 0.75,
    ];
    for (let i = 0; i < smokeCols.length; i++) {
      const sx = smokeCols[i];
      ctx.save();
      const alpha = 0.04 + (i % 3) * 0.015;
      ctx.strokeStyle = `rgba(200,200,200,${alpha})`;
      ctx.lineWidth = 18 + (i % 3) * 8;
      ctx.beginPath();
      ctx.moveTo(sx, H);
      ctx.bezierCurveTo(
        sx - 30 + i * 8,
        H * 0.7,
        sx + 40 - i * 6,
        H * 0.4,
        sx - 20 + i * 5,
        0,
      );
      ctx.stroke();
      ctx.restore();
    }

    // Candle glow at bottom (warm amber)
    const candlePositions = [W * 0.3, W * 0.5, W * 0.7];
    for (const cx of candlePositions) {
      const cg = ctx.createRadialGradient(cx, H * 0.88, 0, cx, H * 0.88, 160);
      cg.addColorStop(0, "rgba(255,140,0,0.16)");
      cg.addColorStop(0.4, "rgba(255,100,0,0.08)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);
    }

    // Dark vignette edges
    const vig = ctx.createRadialGradient(
      W / 2,
      H / 2,
      H * 0.35,
      W / 2,
      H / 2,
      H * 0.72,
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Faint dot grid
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let dx = 50; dx < W; dx += 70)
      for (let dy = 50; dy < H; dy += 70) {
        ctx.beginPath();
        ctx.arc(dx, dy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
  } else if (cat === "eid") {
    // ── ঈদ শুভেচ্ছা: গাঢ় নীল/সবুজ, তারা+ইসলামিক প্যাটার্ন ──
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0a1628");
    grad.addColorStop(0.5, "#1a1040");
    grad.addColorStop(1, "#0d2b1a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars (deterministic positions using sin/cos)
    for (let i = 0; i < 55; i++) {
      const sx = (Math.sin(i * 137.508 * (Math.PI / 180)) * 0.5 + 0.5) * W;
      const sy = (Math.cos(i * 97.3 * (Math.PI / 180)) * 0.5 + 0.5) * H;
      const sr = 1 + (Math.sin(i * 53) * 0.5 + 0.5) * 2.2;
      const alpha = 0.4 + (Math.cos(i * 31) * 0.5 + 0.5) * 0.5;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = i % 7 === 0 ? "#D4AF37" : "#ffffff";
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Islamic 8-pointed star lattice (low opacity)
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 1.5;
    const step = 120;
    for (let gx = 0; gx <= W + step; gx += step) {
      for (let gy = 0; gy <= H + step; gy += step) {
        const cx = gx + (gy % (step * 2) === 0 ? 0 : step / 2);
        const cy = gy;
        const rs = 36;
        ctx.beginPath();
        for (let p = 0; p < 8; p++) {
          const angle = (p * Math.PI) / 4 - Math.PI / 8;
          const outerX = cx + rs * Math.cos(angle);
          const outerY = cy + rs * Math.sin(angle);
          const innerAngle = angle + Math.PI / 8;
          const innerX = cx + rs * 0.42 * Math.cos(innerAngle);
          const innerY = cy + rs * 0.42 * Math.sin(innerAngle);
          if (p === 0) ctx.moveTo(outerX, outerY);
          else ctx.lineTo(outerX, outerY);
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();

    // Crescent moon suggestion (top-right)
    ctx.save();
    ctx.fillStyle = "rgba(212,175,55,0.12)";
    ctx.beginPath();
    ctx.arc(W * 0.82, H * 0.12, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(10,22,40,0.85)";
    ctx.beginPath();
    ctx.arc(W * 0.82 + 38, H * 0.12 - 12, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Gold center glow
    const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
    cg.addColorStop(0, "rgba(212,175,55,0.08)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
  } else if (cat === "donation-two" || cat === "donation-one") {
    // ── অনুদান প্রচারণা: প্রিমিয়াম ডার্ক টিল-গ্রিন, হার্ট+লাইট রে ──
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0a2a1a");
    grad.addColorStop(0.5, "#0f2a38");
    grad.addColorStop(1, "#1a3a4a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Heart watermark at center
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#ffffff";
    ctx.translate(W / 2, H / 2 + 40);
    ctx.scale(3.2, 3.2);
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.bezierCurveTo(-50, -70, -100, -10, 0, 50);
    ctx.bezierCurveTo(100, -10, 50, -70, 0, -20);
    ctx.fill();
    ctx.restore();

    // Helping-hand silhouette suggestion
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.translate(W * 0.65, H * 0.55);
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.bezierCurveTo(-10, 40, -30, 10, -10, -20);
    ctx.bezierCurveTo(0, -50, 30, -40, 35, -10);
    ctx.bezierCurveTo(40, -40, 60, -35, 62, -5);
    ctx.bezierCurveTo(68, -30, 88, -25, 88, 5);
    ctx.bezierCurveTo(95, -15, 110, -10, 108, 20);
    ctx.bezierCurveTo(110, 60, 90, 80, 60, 80);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Light rays from top-center
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let r = 0; r < 10; r++) {
      const angle = -Math.PI / 2 + (r - 4.5) * 0.22;
      ctx.strokeStyle = "rgba(255,255,255,1)";
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.moveTo(W / 2, -10);
      ctx.lineTo(W / 2 + Math.cos(angle) * W, Math.sin(angle) * H + H / 2);
      ctx.stroke();
    }
    ctx.restore();

    // Teal radial glow
    const cg = ctx.createRadialGradient(
      W / 2,
      H / 2,
      0,
      W / 2,
      H / 2,
      W * 0.55,
    );
    cg.addColorStop(0, "rgba(0,200,180,0.07)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
  } else if (cat === "national") {
    // ── জাতীয় দিবস: গাঢ় লাল, শহীদ মিনারের আর্ক ইঙ্গিত ──
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#8B0000");
    grad.addColorStop(0.5, "#6a0000");
    grad.addColorStop(1, "#4a0000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Faint white arc shapes (Shaheed Minar suggestion)
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.85, 320, Math.PI, 0);
    ctx.stroke();
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(W / 2 - 140, H * 0.85, 200, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2 + 140, H * 0.85, 200, Math.PI, 0);
    ctx.stroke();
    ctx.restore();

    // Gold/green accent dots
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#00cc44";
    for (let i = 0; i < 30; i++) {
      const sx = (Math.sin(i * 99.3 * (Math.PI / 180)) * 0.5 + 0.5) * W;
      const sy = (Math.cos(i * 67.1 * (Math.PI / 180)) * 0.5 + 0.5) * H;
      ctx.beginPath();
      ctx.arc(sx, sy, 4 + (i % 3) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const cg = ctx.createRadialGradient(
      W / 2,
      H / 2,
      0,
      W / 2,
      H / 2,
      W * 0.55,
    );
    cg.addColorStop(0, "rgba(255,255,255,0.06)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
  } else if (cat === "announcement") {
    // ── বিশেষ ঘোষণা: প্রিমিয়াম ডিপ ব্লু, ডায়াগোনাল গ্রিড ──
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#071a3e");
    grad.addColorStop(0.5, "#0d2a5e");
    grad.addColorStop(1, "#071a3e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle diagonal grid
    ctx.save();
    ctx.strokeStyle = "rgba(212,175,55,0.06)";
    ctx.lineWidth = 1;
    for (let d = -H; d < W + H; d += 60) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + H, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(d + H, 0);
      ctx.lineTo(d, H);
      ctx.stroke();
    }
    ctx.restore();

    // Gold glow center
    const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
    cg.addColorStop(0, "rgba(212,175,55,0.10)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);

    // Subtle corner circles
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#D4AF37";
    for (const [ax, ay, ar] of [
      [0, 0, 280],
      [W, H, 280],
      [W, 0, 180],
      [0, H, 180],
    ] as [number, number, number][]) {
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else {
    // ── মানবসেবা/প্রেরণাদায়ক: হালকা সবুজ+কমলা, সূর্যের রশ্মি+প্রকৃতি ──
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0a2a1a");
    grad.addColorStop(0.5, "#1a3a0a");
    grad.addColorStop(1, "#2a1500");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Sunlight rays from top-center
    ctx.save();
    for (let r = 0; r < 14; r++) {
      const angle = -Math.PI / 2 + (r - 6.5) * 0.19;
      const alpha = r % 2 === 0 ? 0.06 : 0.04;
      const color =
        r % 2 === 0 ? `rgba(255,160,0,${alpha})` : `rgba(255,200,50,${alpha})`;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(W / 2, -50);
      const spread = 55;
      ctx.lineTo(
        W / 2 + Math.cos(angle - spread * 0.008) * W * 1.4,
        -50 + Math.sin(angle - spread * 0.008) * H * 1.4,
      );
      ctx.lineTo(
        W / 2 + Math.cos(angle + spread * 0.008) * W * 1.4,
        -50 + Math.sin(angle + spread * 0.008) * H * 1.4,
      );
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Nature dots (leaves suggestion)
    ctx.save();
    ctx.fillStyle = "rgba(100,220,100,0.08)";
    for (let i = 0; i < 35; i++) {
      const nx = (Math.sin(i * 113.5 * (Math.PI / 180)) * 0.5 + 0.5) * W;
      const ny = (Math.cos(i * 79.2 * (Math.PI / 180)) * 0.5 + 0.5) * H;
      const nr = 4 + (i % 4) * 3;
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Warm radial glow at center
    const cg = ctx.createRadialGradient(
      W / 2,
      H / 2,
      0,
      W / 2,
      H / 2,
      W * 0.55,
    );
    cg.addColorStop(0, "rgba(255,120,0,0.08)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Common finish: reset state, draw borders ──────────────────────────
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  // Accent outer border
  ctx.strokeStyle = bg.accent;
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, W - 10, H - 10);
  // Inner white border
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, W - 44, H - 44);
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

      // ─── Background ───────────────────────────────────────────────
      drawTemplateBackground(ctx, W, H, cat, template);

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
      } else if (
        cat === "religious-special" ||
        cat === "world-day" ||
        cat === "cultural" ||
        cat === "program" ||
        cat === "awareness" ||
        cat === "award"
      ) {
        // Watermark style for new template categories
        if (img1) {
          drawCircularImage(
            ctx,
            img1,
            W / 2,
            500,
            170,
            "rgba(255,255,255,0.4)",
            4,
            0.25,
            false,
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
      // Light-background templates: use dark text
      if (
        template === "religious-quran" ||
        template === "religious-hadith" ||
        template === "world-health" ||
        template === "world-humanrights" ||
        template === "pohela-boishakh" ||
        template === "program-health-camp"
      ) {
        msgColor = "#0d2a5e";
        msgShadow = "rgba(0,0,100,0.2)";
      }
      if (template === "pohela-boishakh") {
        msgColor = "#5c0000";
        msgShadow = "rgba(100,0,0,0.2)";
      }
      if (template === "awareness-road") {
        msgColor = "#1a1a00";
        msgShadow = "rgba(0,0,0,0.3)";
      }
      // Dark-background overrides stay white (default), but add gold for gold-themed
      if (
        template === "religious-miladunnabi" ||
        template === "religious-shabe-qadr" ||
        template === "award-student"
      ) {
        msgColor = "#D4AF37";
        msgShadow = "rgba(212,175,55,0.5)";
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
            background: "#1a3a26",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <h2 className="text-base font-semibold" style={{ color: "#D4AF37" }}>
            ফর্ম পূরণ করুন
          </h2>

          {/* Template radio buttons */}
          <div className="space-y-3">
            <Label style={{ color: "rgba(255,255,255,0.8)" }}>
              টেমপ্লেট নির্বাচন করুন
            </Label>
            <div className="space-y-3" data-ocid="socialmedia.select">
              {TEMPLATES.map((g) => (
                <div key={g.group}>
                  <p
                    className="text-xs font-semibold mb-2 px-1"
                    style={{ color: "#D4AF37", letterSpacing: "0.03em" }}
                  >
                    ▸ {g.group}
                  </p>
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(180px, 1fr))",
                    }}
                  >
                    {g.items.map((item) => {
                      const isSelected = template === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setTemplate(item.value);
                            setImage1(null);
                            setImage2(null);
                            setCardDataUrl(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all"
                          style={{
                            background: isSelected
                              ? "rgba(212,175,55,0.18)"
                              : "rgba(255,255,255,0.06)",
                            border: isSelected
                              ? "1.5px solid #D4AF37"
                              : "1px solid rgba(255,255,255,0.12)",
                            color: isSelected
                              ? "#fff"
                              : "rgba(255,255,255,0.75)",
                            fontFamily: "'Hind Siliguri', sans-serif",
                            cursor: "pointer",
                          }}
                          data-ocid={`socialmedia.radio.${item.value}`}
                        >
                          <span
                            className="flex-shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                            style={{
                              borderColor: isSelected
                                ? "#D4AF37"
                                : "rgba(255,255,255,0.3)",
                              background: isSelected
                                ? "#D4AF37"
                                : "transparent",
                            }}
                          >
                            {isSelected && (
                              <span
                                className="block w-1.5 h-1.5 rounded-full"
                                style={{ background: "#1a3a26" }}
                              />
                            )}
                          </span>
                          <span className="leading-tight">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
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
                  background: "rgba(255,255,255,0.1)",
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
                    background: "rgba(255,255,255,0.1)",
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
                background: "rgba(255,255,255,0.12)",
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
                background: "rgba(255,255,255,0.12)",
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
