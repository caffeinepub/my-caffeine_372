/**
 * Shared PDF header utility for Apon Foundation documents.
 * Layout:
 *   Line 1: Arabic text — centered, full width, deep blue
 *   Line 2: [Logo LEFT] + [Org name CENTER] + [spacer RIGHT]
 *   Line 3: Slogan — centered, deep red
 *   Line 4: Address — centered, deep purple
 *   Line 5: Email + WhatsApp — centered, deep gray
 *
 * All documents: A4 size, 600 DPI print quality, auto-pagination,
 * consistent header and watermark on every page (brand identity).
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
    ? `<img src="${logoDataUrl}" style="width:${logoSize}px;height:${logoSize}px;object-fit:contain;display:block;image-rendering:high-quality;" alt="logo" />`
    : `<div style="width:${logoSize}px;height:${logoSize}px;background:#166534;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:26px;font-weight:bold;">আ</div>`;

  return `
<div class="doc-header" style="padding-bottom:12px;margin-bottom:14px;border-bottom:3px double #166534;">

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
  // position:fixed ensures watermark appears on EVERY printed page
  return `
<div class="doc-watermark" style="
  position:fixed;
  top:62%;
  left:50%;
  transform:translate(-50%,-50%);
  opacity:0.35;
  z-index:0;
  pointer-events:none;
  width:300px;
  height:300px;
">
  <img src="${logoDataUrl}" style="width:300px;height:300px;object-fit:contain;image-rendering:high-quality;" alt="" />
</div>`;
}

export function getDocumentFontLink(): string {
  return `<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700;800&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet">`;
}

/**
 * Base styles for ALL Apon Foundation documents.
 * - A4 size (210mm × 297mm)
 * - 1-inch (25.4mm) margins all around
 * - Auto-pagination: content overflows to next page automatically
 * - Watermark fixed on every page
 * - High-quality print output
 */
export function getDocumentBaseStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif;
      font-size: 13px;
      color: #222;
      background: white;
      /* High quality print */
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }

    /* A4 page container */
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 10mm 25.4mm 25.4mm 25.4mm;
      margin: 0 auto;
      position: relative;
      background: white;
      /* Prevent content from going outside A4 bounds */
      overflow-wrap: break-word;
      word-wrap: break-word;
    }

    /* Auto-pagination: blocks that should not be split across pages */
    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Tables: header repeats on every page, rows avoid mid-row breaks */
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
    }
    thead {
      display: table-header-group; /* Repeats on every printed page */
    }
    tfoot {
      display: table-footer-group;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    td, th {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Content sections */
    .section-block {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 12px;
    }

    /* Force page break */
    .page-break {
      page-break-after: always;
      break-after: page;
    }

    /* Watermark: fixed so it appears centered on every printed page */
    .doc-watermark {
      position: fixed;
      top: 62%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.35;
      z-index: 0;
      pointer-events: none;
    }

    /* Print-specific rules */
    @media print {
      /* A4 size with 1-inch margins */
      @page {
        size: A4;
        margin: 25.4mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }
      /* Remove page padding since @page margin handles it */
      .page {
        padding: 0;
        margin: 0;
        width: 100%;
        min-height: auto;
      }
      /* Watermark on every page */
      .doc-watermark {
        position: fixed;
        top: 62%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      /* Header: avoid breaking across pages */
      .doc-header {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  `;
}

export function loadOrgSettingsForPDF(): PdfHeaderOptions {
  let raw: any = {};
  try {
    raw = JSON.parse(localStorage.getItem("orgSettings") || "{}");
  } catch {}
  return {
    logoDataUrl: raw.logoDataUrl || raw.logoUrl || "",
    orgName1: raw.orgName1 || "আপন",
    orgName2: raw.orgName2 || "ফাউন্ডেশন",
    tagline: raw.tagline || "মানবসেবায় আমরা",
    address: raw.address || "বালীগাঁও, অষ্টগ্রাম, কিশোরগঞ্জ",
    email: raw.email || "aponfoundation.baligaw@gmail.com",
    whatsapp: raw.whatsapp || "+8801608427115",
    color1: raw.color1 || "#166534",
    color2: raw.color2 || "#c2410c",
  };
}

export function buildPrintWatermarkCSS(logoDataUrl?: string): string {
  if (!logoDataUrl) return "";
  return `
    .doc-watermark {
      position: fixed;
      top: 62%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.35;
      z-index: 0;
      pointer-events: none;
      width: 300px;
      height: 300px;
      background-image: url('${logoDataUrl}');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    @media print {
      .doc-watermark {
        position: fixed;
        top: 62%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  `;
}
