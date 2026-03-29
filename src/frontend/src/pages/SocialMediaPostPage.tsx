import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Facebook, ImagePlus, Loader2, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { loadSettings } from "../store/settingsStore";

const TEMPLATES = [
  {
    group: "অনুদান প্রচারণা",
    items: [
      { value: "donation-winter", label: "শীতবস্ত্র বিতরণ", cat: "donation" },
      { value: "donation-sports", label: "ক্রীড়া উপকরণ বিতরণ", cat: "donation" },
      {
        value: "donation-education",
        label: "শিক্ষা উপকরণ বিতরণ",
        cat: "donation",
      },
      { value: "donation-food", label: "খাদ্য/ওষুধ বিতরণ", cat: "donation" },
    ],
  },
  {
    group: "ধর্মীয় শুভেচ্ছা",
    items: [
      {
        value: "religious-eid-fitr",
        label: "ঈদুল ফিতর শুভেচ্ছা",
        cat: "religious",
      },
      { value: "religious-eid-adha", label: "ঈদুল আযহা শুভেচ্ছা", cat: "religious" },
      { value: "religious-ramadan", label: "রমজান মোবারক", cat: "religious" },
    ],
  },
  {
    group: "জাতীয় দিবস",
    items: [
      { value: "national-language", label: "মাতৃভাষা দিবস", cat: "national" },
      { value: "national-independence", label: "স্বাধীনতা দিবস", cat: "national" },
      { value: "national-victory", label: "বিজয় দিবস", cat: "national" },
      { value: "national-mourning", label: "শোক দিবস", cat: "mourning" },
    ],
  },
  {
    group: "বিশেষ ঘোষণা",
    items: [
      { value: "announce-donation", label: "অনুদান প্রদান", cat: "announcement" },
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
  | "donation"
  | "religious"
  | "national"
  | "mourning"
  | "announcement"
  | "humanitarian";

const GRADIENTS: Record<TemplateCat, [string, string, string]> = {
  donation: ["#0d4a1f", "#1a6b3a", "#2d9e5a"],
  religious: ["#2d1f5e", "#5a3d8c", "#8B6914"],
  national: ["#8B0000", "#cc2200", "#e63b1f"],
  mourning: ["#1a1a1a", "#2d2d2d", "#444444"],
  announcement: ["#0d2a5e", "#1a4a8c", "#2a6bb5"],
  humanitarian: ["#0d4a40", "#1a6b5e", "#2d9e8a"],
};

function getCat(value: string): TemplateCat {
  for (const g of TEMPLATES) {
    for (const t of g.items) {
      if (t.value === value) return t.cat as TemplateCat;
    }
  }
  return "humanitarian";
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

export default function SocialMediaPostPage() {
  const [template, setTemplate] = useState("donation-winter");
  const [message, setMessage] = useState("");
  const [caption, setCaption] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function generateCard() {
    if (!message.trim()) {
      toast.error("মূল বার্তা লিখুন");
      return;
    }
    setGenerating(true);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = 1200;
    const H = 1200;
    const cat = getCat(template);
    const colors = GRADIENTS[cat];

    // 1. Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(0.5, colors[1]);
    grad.addColorStop(1, colors[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 2. Decorative corner circles
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 320, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W, H, 320, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W, 0, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, H, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 3. Dot mesh pattern
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#ffffff";
    for (let dx = 30; dx < W; dx += 60) {
      for (let dy = 30; dy < H; dy += 60) {
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;

    // 4. Center glow
    const radGrad = ctx.createRadialGradient(
      W / 2,
      H / 2,
      0,
      W / 2,
      H / 2,
      W * 0.55,
    );
    radGrad.addColorStop(0, "rgba(255,255,255,0.1)");
    radGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, W, H);

    // 5. Gold border
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // 6. Header bar
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "rgba(255,255,255,0.93)";
    roundRect(ctx, 40, 30, W - 80, 165, 16);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    const orgSettings = loadSettings();

    // 7. Draw logo in header
    const logoSrc =
      orgSettings.logoDataUrl ||
      "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const cx = 115;
        const cy = 113;
        const r = 55;
        ctx.save();
        // Circle clip
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
        // Circle border
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        resolve();
      };
      img.onerror = () => resolve();
      img.src = logoSrc;
    });

    // 8. Org name in header
    ctx.textAlign = "left";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    const orgName1 = orgSettings.orgName1 || "আপন";
    const orgName2 = orgSettings.orgName2 || "ফাউন্ডেশন";
    ctx.font = "bold 58px 'Hind Siliguri', sans-serif";
    ctx.fillStyle = "#1a6b2a";
    ctx.fillText(orgName1, 185, 105);
    const n1w = ctx.measureText(orgName1).width;
    ctx.fillStyle = "#cc4400";
    ctx.fillText(`${" "}${orgName2}`, 185 + n1w, 105);

    // Address
    ctx.font = "26px 'Hind Siliguri', sans-serif";
    ctx.fillStyle = "#7b2d00";
    ctx.fillText(orgSettings.address || "বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ", 185, 150);

    // 9. Template badge (top right)
    const templateLabel =
      TEMPLATES.flatMap((g) => g.items).find((t) => t.value === template)
        ?.label || "";
    const badgeX = W - 50;
    const badgeY = 80;

    ctx.font = "22px 'Hind Siliguri', sans-serif";
    const bw2 = ctx.measureText(templateLabel).width + 40;
    ctx.fillStyle = "rgba(212,175,55,0.95)";
    roundRect(ctx, badgeX - bw2, badgeY - 28, bw2, 40, 20);
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.textAlign = "center";
    ctx.fillText(templateLabel, badgeX - bw2 / 2, badgeY);
    // suppress linter unused var

    // 10. Uploaded image in body
    let bodyStartY = 240;
    if (uploadedImage) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const imgW = 500;
          const imgH = 300;
          const imgX = (W - imgW) / 2;
          const imgY = bodyStartY;
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = 25;
          ctx.shadowOffsetY = 8;
          ctx.drawImage(img, imgX, imgY, imgW, imgH);
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          bodyStartY = imgY + imgH + 50;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = uploadedImage;
      });
    }

    // 11. Main message
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255,255,255,0.3)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 58px 'Hind Siliguri', sans-serif";
    const msgY = bodyStartY + 60;
    const nextY = wrapText(ctx, message, W / 2, msgY, W - 160, 74);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // 12. Caption
    if (caption.trim()) {
      ctx.font = "38px 'Hind Siliguri', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 8;
      wrapText(ctx, caption, W / 2, nextY + 30, W - 200, 54);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    // 13. Divider line before footer
    ctx.strokeStyle = "rgba(212,175,55,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, H - 110);
    ctx.lineTo(W - 60, H - 110);
    ctx.stroke();

    // 14. Footer
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, H - 108, W, 108);
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 28px 'Hind Siliguri', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🌐  facebook.com/aponfoundation.bd", W / 2, H - 62);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "22px 'Hind Siliguri', sans-serif";
    ctx.fillText("আপন ফাউন্ডেশন — বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ", W / 2, H - 28);

    setCardDataUrl(canvas.toDataURL("image/png"));
    setGenerating(false);
    toast.success("ফটো কার্ড তৈরি হয়েছে!");
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
      {/* Page Banner */}
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

          {/* Template */}
          <div className="space-y-2">
            <Label style={{ color: "rgba(255,255,255,0.8)" }}>
              টেমপ্লেট নির্বাচন করুন
            </Label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
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

          {/* Image upload */}
          <div className="space-y-2">
            <Label style={{ color: "rgba(255,255,255,0.8)" }}>
              ছবি আপলোড (ঐচ্ছিক)
            </Label>
            <button
              type="button"
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all w-full text-left"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px dashed rgba(212,175,55,0.4)",
              }}
              onClick={() => fileInputRef.current?.click()}
              data-ocid="socialmedia.upload_button"
            >
              <ImagePlus size={20} style={{ color: "#D4AF37" }} />
              <span
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {uploadedImage ? "ছবি নির্বাচিত হয়েছে ✓" : "ছবি নির্বাচন করুন"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                data-ocid="socialmedia.dropzone"
              />
            </button>
            {uploadedImage && (
              <div className="flex items-center gap-2">
                <img
                  src={uploadedImage}
                  alt="preview"
                  className="h-16 w-16 object-cover rounded-lg"
                  style={{ border: "1px solid rgba(212,175,55,0.4)" }}
                />
                <button
                  type="button"
                  onClick={() => setUploadedImage(null)}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    color: "#e55",
                    border: "1px solid rgba(220,80,80,0.4)",
                  }}
                >
                  সরান
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
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

          {/* Hidden canvas */}
          <canvas
            ref={canvasRef}
            width={1200}
            height={1200}
            style={{ display: "none" }}
          />

          {/* Preview area */}
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

          {/* Action buttons */}
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

          {/* Facebook link note */}
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
