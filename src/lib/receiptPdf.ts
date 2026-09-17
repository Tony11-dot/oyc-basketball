// Server-only: renders a formal Arabic payment receipt (وصل) as a PDF from a
// {@link Receipt}. Fetches the club logo + Amiri Arabic font from /public once
// and caches them in module scope. All Arabic is shaped + glyph-drawn via
// ./pdfArabic so it renders correctly in every viewer.
import "server-only";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Receipt } from "./types";
import { drawLine, hasHebrew, measure, toVisual, drawGlyphs } from "./pdfArabic";

// Brand palette — navy + a warm brand red, matching the site.
const NAVY = rgb(0.05, 0.13, 0.31);
const INK = rgb(0.09, 0.11, 0.16);
const MUTED = rgb(0.42, 0.47, 0.55);
const LINE = rgb(0.84, 0.87, 0.91);
const SOFT = rgb(0.96, 0.97, 0.99);
const BRAND = rgb(0.86, 0.28, 0.31);
const WHITE = rgb(1, 1, 1);

const CLUB_AR = "النادي الأرثوذكسي لكرة السلة";
const CITY_AR = "الناصرة";

let _font: Uint8Array | null = null;
let _hebFont: Uint8Array | null = null;
let _logo: Uint8Array | null = null;

async function fetchBin(baseUrl: string, p: string): Promise<Uint8Array> {
  const res = await fetch(new URL(p, baseUrl));
  if (!res.ok) throw new Error(`fetch ${p} failed: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function assets(baseUrl: string) {
  if (!_font) _font = await fetchBin(baseUrl, "/forms/Amiri-Regular.ttf");
  // Amiri has no Hebrew glyphs — a payer name typed in Hebrew falls back to
  // Noto Sans Hebrew (missing file just means boxes, never a failure).
  if (!_hebFont) {
    try {
      _hebFont = await fetchBin(baseUrl, "/forms/NotoSansHebrew-Regular.ttf");
    } catch {
      _hebFont = new Uint8Array();
    }
  }
  if (!_logo) {
    try {
      _logo = await fetchBin(baseUrl, "/logo.png");
    } catch {
      _logo = new Uint8Array();
    }
  }
  return { font: _font, hebFont: _hebFont, logo: _logo };
}

const METHOD_LABEL: Record<string, string> = {
  "نقدا": "نقدًا",
  "شيكات": "شيكات",
  "بطاقة اعتماد": "بطاقة اعتماد",
  "تحويل بنكي": "تحويل بنكي",
  "أمر دائم": "أمر دائم",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Render a single receipt to flat PDF bytes. */
export async function buildReceiptPdf(baseUrl: string, receipt: Receipt): Promise<Uint8Array> {
  const { font: fontBytes, hebFont: hebBytes, logo } = await assets(baseUrl);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fontBytes, { subset: false });
  const heb = hebBytes && hebBytes.length > 0 ? await doc.embedFont(hebBytes, { subset: false }) : font;
  const latin = await doc.embedFont(StandardFonts.Helvetica);
  const fontFor = (s: string) => (hasHebrew(s) ? heb : font);

  const W = 595.28;
  const H = 841.89;
  const page = doc.addPage([W, H]);
  const M = 52; // page margin
  const right = W - M; // right content edge (RTL start)
  const left = M;
  const contentW = right - left;

  // ---- Header band ----------------------------------------------------------
  const headerH = 150;
  page.drawRectangle({ x: 0, y: H - headerH, width: W, height: headerH, color: NAVY });
  page.drawRectangle({ x: 0, y: H - headerH - 4, width: W, height: 4, color: BRAND });

  // Logo centered near the top of the band.
  let logoBottom = H - 40;
  if (logo && logo.length > 0) {
    try {
      const png = await doc.embedPng(logo);
      const dim = png.scaleToFit(66, 66);
      logoBottom = H - 26 - dim.height;
      page.drawImage(png, { x: (W - dim.width) / 2, y: logoBottom, width: dim.width, height: dim.height });
    } catch {
      /* skip logo on decode error */
    }
  }

  // Club name (Arabic) centered, then city.
  const nameSize = 22;
  drawLine(page, font, CLUB_AR, { x: left, y: logoBottom - 30, size: nameSize, color: WHITE, boxWidth: contentW, align: "center" });
  drawLine(page, font, CITY_AR, { x: left, y: logoBottom - 50, size: 12, color: rgb(0.72, 0.8, 0.95), boxWidth: contentW, align: "center" });

  // ---- Title pill: وصل ------------------------------------------------------
  const titleAr = "وصل";
  const titleSize = 15;
  const titleW = measure(font, titleAr, titleSize);
  const pillW = titleW + 44;
  const pillH = 30;
  const pillY = H - headerH - 4 - 18 - pillH;
  const pillX = (W - pillW) / 2;
  page.drawRectangle({ x: pillX, y: pillY, width: pillW, height: pillH, color: BRAND, borderColor: BRAND });
  drawLine(page, font, titleAr, { x: pillX, y: pillY + 9, size: titleSize, color: WHITE, boxWidth: pillW, align: "center" });

  // ---- Receipt no + date row ------------------------------------------------
  let y = pillY - 34;
  const numAr = `رقم الوصل: ${receipt.number}`;
  const dateAr = `التاريخ: ${formatDate(receipt.createdAt)}`;
  drawLine(page, font, numAr, { x: left, y, size: 11, color: MUTED, boxWidth: contentW, align: "end" });
  drawLine(page, font, dateAr, { x: left, y, size: 11, color: MUTED, boxWidth: contentW, align: "start" });

  // ---- Body card ------------------------------------------------------------
  y -= 18;
  const rows: { label: string; value: string; strong?: boolean }[] = [
    { label: "استلمنا من السيّد/ة", value: receipt.name || "—", strong: true },
    { label: "طريقة الدفع", value: METHOD_LABEL[receipt.method] ?? receipt.method },
  ];
  if (receipt.note && receipt.note.trim()) rows.push({ label: "وذلك بخصوص", value: receipt.note.trim() });

  const rowH = 46;
  const cardH = rows.length * rowH + 78; // rows + amount block
  const cardTop = y;
  const cardBottom = cardTop - cardH;
  page.drawRectangle({ x: left, y: cardBottom, width: contentW, height: cardH, borderColor: LINE, borderWidth: 1, color: WHITE });

  // Field rows (RTL): label on the right, value beneath, divider between rows.
  let ry = cardTop - 12;
  for (const r of rows) {
    // label
    drawLine(page, font, r.label, { x: left + 18, y: ry - 12, size: 10, color: MUTED, boxWidth: contentW - 36, align: "end" });
    // value (Hebrew names fall back to the Hebrew font)
    drawLine(page, fontFor(r.value), r.value, { x: left + 18, y: ry - 30, size: r.strong ? 15 : 13, color: INK, boxWidth: contentW - 36, align: "end" });
    ry -= rowH;
    page.drawLine({ start: { x: left + 14, y: ry + 6 }, end: { x: right - 14, y: ry + 6 }, thickness: 0.75, color: LINE });
  }

  // ---- Amount block (highlighted) ------------------------------------------
  const amtBlockTop = ry + 6;
  const amtH = amtBlockTop - cardBottom;
  page.drawRectangle({ x: left + 1, y: cardBottom + 1, width: contentW - 2, height: amtH - 2, color: SOFT });
  const amountText = `${receipt.amount.toLocaleString("en-US")} ش.ج`;
  drawLine(page, font, "المبلغ المدفوع", { x: left + 18, y: cardBottom + amtH / 2 + 2, size: 11, color: MUTED, boxWidth: (contentW - 36) / 2, align: "end" });
  // Amount value large, on the left side of the block.
  const amtSize = 22;
  const amtVisual = toVisual(amountText);
  const amtW = font.widthOfTextAtSize(amtVisual, amtSize);
  drawGlyphs(page, font, amtVisual, left + 24, cardBottom + amtH / 2 - amtSize / 2 + 4, amtSize, NAVY);

  // ---- Signature line -------------------------------------------------------
  const sigY = cardBottom - 56;
  const sigLineW = 150;
  page.drawLine({ start: { x: right - sigLineW, y: sigY }, end: { x: right, y: sigY }, thickness: 0.9, color: LINE });
  drawLine(page, font, "توقيع المستلم", { x: right - sigLineW, y: sigY - 16, size: 10, color: MUTED, boxWidth: sigLineW, align: "center" });
  page.drawLine({ start: { x: left, y: sigY }, end: { x: left + sigLineW, y: sigY }, thickness: 0.9, color: LINE });
  drawLine(page, font, "الختم", { x: left, y: sigY - 16, size: 10, color: MUTED, boxWidth: sigLineW, align: "center" });

  // ---- Footer ---------------------------------------------------------------
  page.drawLine({ start: { x: left, y: 70 }, end: { x: right, y: 70 }, thickness: 0.75, color: LINE });
  drawLine(page, font, `${CLUB_AR} — ${CITY_AR}`, { x: left, y: 54, size: 9.5, color: MUTED, boxWidth: contentW, align: "center" });
  page.drawText("Orthodox Basketball Association", { x: left, y: 40, size: 8, font: latin, color: MUTED });
  const oba = "OBA";
  page.drawText(oba, { x: right - latin.widthOfTextAtSize(oba, 8), y: 40, size: 8, font: latin, color: MUTED });

  return doc.save();
}
