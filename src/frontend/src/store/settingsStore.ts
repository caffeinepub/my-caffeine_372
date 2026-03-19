export interface OrgSettings {
  logoDataUrl: string;
  orgName1: string;
  orgName2: string;
  tagline: string;
  address: string;
  email: string;
  whatsapp: string;
  website: string;
  color1: string;
  color2: string;
}

const DEFAULTS: OrgSettings = {
  logoDataUrl: "",
  orgName1: "আপন",
  orgName2: "ফাউন্ডেশন",
  tagline: "মানবসেবায় প্রতিশ্রুতিবদ্ধ",
  address: "বাংলাদেশ",
  email: "info@aponfoundation.org",
  whatsapp: "+880 1700-000000",
  website: "www.aponfoundation.org",
  color1: "#1a6b2a",
  color2: "#8b0000",
};

const KEY = "apon_org_settings";

export function loadSettings(): OrgSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS };
}

export function saveSettings(s: OrgSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
