/**
 * Shared PDF header utility for Apon Foundation documents.
 * Layout:
 *   Line 1: Arabic text — centered, full width, deep blue
 *   Line 2: [Logo LEFT] + [Org name CENTER] + [spacer RIGHT]
 *   Line 3: Slogan — centered, deep red
 *   Line 4: Address — centered, deep purple
 *   Line 5: Email + WhatsApp — centered, deep gray
 */

export interface PdfHeaderOptions {
  logoDataUrl?: string;
  orgName1?: string; // e.g. "আপন"
  orgName2?: string; // e.g. "ফাউন্ডেশন"
  tagline?: string; // e.g. "মানবসেবায় আমরা"
  address?: string;
  email?: string;
  whatsapp?: string;
  color1?: string; // orgName1 color (default: dark green)
  color2?: string; // orgName2 color (default: dark orange)
}

export function buildDocumentHeader(opts: PdfHeaderOptions): string {
  const {
    logoDataUrl = "",
    orgName1 = "আপন",
    orgName2 = "ফাউন্ডেশন",
    tagline = "মানবসেবায় আমরা",
    address = "বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ",
    email = "aponfoundation.baligaw@gmail.com",
    whatsapp = "+8801608427115",
    color1 = "#166534",
    color2 = "#c2410c",
  } = opts;

  const logoSize = 70;

  const logoImg = logoDataUrl
    ? `<img src="${logoDataUrl}" style="width:${logoSize}px;height:${logoSize}px;object-fit:contain;display:block;" alt="logo" />`
    : `<div style="width:${logoSize}px;height:${logoSize}px;background:#166534;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:26px;font-weight:bold;">আ</div>`;

  return `
<div style="padding-bottom:12px;margin-bottom:14px;border-bottom:3px double #166534;">

  <!-- Arabic text: full-width centered, small font, deep blue -->
  <div style="text-align:center;font-family:'Scheherazade New','Amiri','Noto Naskh Arabic',serif;font-size:13px;color:#1e3a8a;margin-bottom:6px;direction:rtl;unicode-bidi:embed;">بسم الله الرحمن الرحيم</div>

  <!-- Row: Logo LEFT | Org name CENTER | spacer RIGHT (equal width to logo) -->
  <div style="display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:4px;">
    <!-- Left: logo -->
    <div style="width:${logoSize}px;flex-shrink:0;display:flex;align-items:center;justify-content:flex-start;">
      ${logoImg}
    </div>
    <!-- Center: org name -->
    <div style="flex:1;text-align:center;">
      <div style="font-size:26px;font-weight:900;letter-spacing:-0.5px;">
        <span style="color:${color1};">${orgName1}</span>&nbsp;<span style="color:${color2};">${orgName2}</span>
      </div>
    </div>
    <!-- Right spacer (mirrors logo width for true centering of name) -->
    <div style="width:${logoSize}px;flex-shrink:0;"></div>
  </div>

  <!-- Slogan: centered, deep red -->
  <div style="text-align:center;font-size:12px;color:#b91c1c;font-weight:700;margin-bottom:3px;">${tagline}</div>

  <!-- Address: centered, deep purple -->
  <div style="text-align:center;font-size:11px;color:#6b21a8;margin-bottom:4px;">📍&nbsp;&nbsp;${address}</div>

  <!-- Contact: centered, deep gray -->
  <div style="text-align:center;font-size:11px;color:#374151;">
    <span style="margin-right:20px;">✉️&nbsp;&nbsp;${email}</span>
    <span>📱&nbsp;&nbsp;${whatsapp}</span>
  </div>

</div>`;
}

export function buildDocumentWatermark(logoDataUrl?: string): string {
  if (!logoDataUrl) return "";
  return `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.35;z-index:0;pointer-events:none;">
    <img src="${logoDataUrl}" style="width:300px;height:300px;object-fit:contain;" alt="" />
  </div>`;
}

export function getDocumentFontLink(): string {
  return `<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700;800&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet">`;
}

export function getDocumentBaseStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif; font-size: 13px; color: #222; background: white; }
    .page { width: 210mm; min-height: 297mm; padding: 25.4mm 25.4mm 25.4mm; margin: 0 auto; position: relative; }
    @media print {
      @page { size: A4; margin: 0; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;
}
