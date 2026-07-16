// Server-only: renders a team finances report PDF — club header + logo, the
// team's name, summary tiles (due / collected / outstanding) and a per-player
// table of paid vs. owed amounts, paginated for large rosters. Shares the
// Arabic shaping helpers (and visual language) with the receipt PDF.
import "server-only";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Player, Team } from "./types";
import { DEFAULT_FEE } from "./fees";
import { drawLine, hasHebrew, measure } from "./pdfArabic";

const NAVY = rgb(0.05, 0.13, 0.31);
const INK = rgb(0.09, 0.11, 0.16);
const MUTED = rgb(0.42, 0.47, 0.55);
const LINE = rgb(0.84, 0.87, 0.91);
const SOFT = rgb(0.96, 0.97, 0.99);
const BRAND = rgb(0.86, 0.28, 0.31);
const AMBER = rgb(0.72, 0.45, 0.05);
const GREEN = rgb(0.02, 0.47, 0.34);
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
  // Amiri has no Hebrew glyphs — team/player names typed in Hebrew fall back to
  // Noto Sans Hebrew (missing file just means Hebrew shows as boxes, not a 500).
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

const W = 595.28;
const H = 841.89;
const M = 52;

const fmt = (n: number) => n.toLocaleString("en-US");

function formatDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Table columns, laid out right-to-left: name | number | fee | paid | left.
// Widths sum to the content width (491.28).
const COLS = [
  { key: "name", label: "اسم اللاعب", w: 195 },
  { key: "number", label: "الرقم", w: 56 },
  { key: "fee", label: "المطلوب", w: 80 },
  { key: "paid", label: "المدفوع", w: 80 },
  { key: "left", label: "المتبقّي", w: 80.28 },
] as const;

/** X of a column's LEFT edge given RTL layout (first column at the right). */
function colX(index: number): number {
  let fromRight = 0;
  for (let i = 0; i <= index; i++) fromRight += COLS[i].w;
  return W - M - fromRight;
}

function drawFooter(page: PDFPage, font: PDFFont, latin: PDFFont, pageNo: number, pageCount: number) {
  page.drawLine({ start: { x: M, y: 64 }, end: { x: W - M, y: 64 }, thickness: 0.75, color: LINE });
  drawLine(page, font, `${CLUB_AR} — ${CITY_AR}`, { x: M, y: 48, size: 9.5, color: MUTED, boxWidth: W - 2 * M, align: "center" });
  page.drawText("Orthodox Basketball Association", { x: M, y: 34, size: 8, font: latin, color: MUTED });
  const pn = `${pageNo} / ${pageCount}`;
  page.drawText(pn, { x: W - M - latin.widthOfTextAtSize(pn, 8), y: 34, size: 8, font: latin, color: MUTED });
}

/** Render the finances report for one team. `players` is the resolved roster. */
export async function buildTeamReportPdf(baseUrl: string, team: Team, players: Player[]): Promise<Uint8Array> {
  const { font: fontBytes, hebFont: hebBytes, logo } = await assets(baseUrl);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fontBytes, { subset: false });
  const heb = hebBytes && hebBytes.length > 0 ? await doc.embedFont(hebBytes, { subset: false }) : font;
  const latin = await doc.embedFont(StandardFonts.Helvetica);
  /** Amiri for Arabic/Latin, Noto Sans Hebrew when the string is Hebrew. */
  const fontFor = (s: string): PDFFont => (hasHebrew(s) ? heb : font);

  const teamName = team.name.ar || team.name.he || team.name.en || "—";
  const rows = players.map((p) => {
    const fee = p.feeAmount ?? DEFAULT_FEE;
    const paid = Math.min(p.paidAmount ?? 0, fee);
    return { name: p.name.ar || p.name.he || p.name.en || "—", number: p.number ?? "", fee, paid, left: Math.max(fee - paid, 0) };
  });
  const totalFee = rows.reduce((s, r) => s + r.fee, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0);
  const totalLeft = Math.max(totalFee - totalPaid, 0);

  const pages: PDFPage[] = [];
  const newPage = () => {
    const page = doc.addPage([W, H]);
    pages.push(page);
    return page;
  };

  // ---- Page 1 header --------------------------------------------------------
  let page = newPage();
  const headerH = 128;
  page.drawRectangle({ x: 0, y: H - headerH, width: W, height: headerH, color: NAVY });
  page.drawRectangle({ x: 0, y: H - headerH - 4, width: W, height: 4, color: BRAND });
  let logoBottom = H - 34;
  if (logo && logo.length > 0) {
    try {
      const png = await doc.embedPng(logo);
      const dim = png.scaleToFit(54, 54);
      logoBottom = H - 20 - dim.height;
      page.drawImage(png, { x: (W - dim.width) / 2, y: logoBottom, width: dim.width, height: dim.height });
    } catch {
      /* skip logo on decode error */
    }
  }
  drawLine(page, font, CLUB_AR, { x: M, y: logoBottom - 26, size: 19, color: WHITE, boxWidth: W - 2 * M, align: "center" });
  drawLine(page, font, CITY_AR, { x: M, y: logoBottom - 44, size: 11, color: rgb(0.72, 0.8, 0.95), boxWidth: W - 2 * M, align: "center" });

  // Title pill + team name
  const title = "تقرير ماليّة الفريق";
  const titleSize = 13;
  const pillW = measure(font, title, titleSize) + 40;
  const pillH = 26;
  const pillY = H - headerH - 4 - 16 - pillH;
  page.drawRectangle({ x: (W - pillW) / 2, y: pillY, width: pillW, height: pillH, color: BRAND });
  drawLine(page, font, title, { x: (W - pillW) / 2, y: pillY + 8, size: titleSize, color: WHITE, boxWidth: pillW, align: "center" });
  drawLine(page, fontFor(teamName), teamName, { x: M, y: pillY - 26, size: 17, color: NAVY, boxWidth: W - 2 * M, align: "center" });

  // Info row: date + player count
  const infoY = pillY - 48;
  drawLine(page, font, `عدد اللاعبين: ${rows.length}`, { x: M, y: infoY, size: 10.5, color: MUTED, boxWidth: W - 2 * M, align: "end" });
  drawLine(page, font, `التاريخ: ${formatDate(new Date())}`, { x: M, y: infoY, size: 10.5, color: MUTED, boxWidth: W - 2 * M, align: "start" });

  // Summary tiles (RTL: due | collected | outstanding)
  const tileY = infoY - 66;
  const tileH = 48;
  const gap = 10;
  const tileW = (W - 2 * M - 2 * gap) / 3;
  const tiles = [
    { label: "المطلوب", value: `${fmt(totalFee)} ش.ج`, color: INK, bg: WHITE },
    { label: "المحصّل", value: `${fmt(totalPaid)} ش.ج`, color: GREEN, bg: rgb(0.93, 0.98, 0.96) },
    { label: "المتبقّي", value: `${fmt(totalLeft)} ش.ج`, color: totalLeft > 0 ? AMBER : INK, bg: totalLeft > 0 ? rgb(0.99, 0.96, 0.9) : WHITE },
  ];
  tiles.forEach((tile, i) => {
    const x = W - M - (i + 1) * tileW - i * gap; // right-to-left
    page.drawRectangle({ x, y: tileY, width: tileW, height: tileH, color: tile.bg, borderColor: LINE, borderWidth: 1 });
    drawLine(page, font, tile.label, { x: x + 8, y: tileY + tileH - 18, size: 9.5, color: MUTED, boxWidth: tileW - 16, align: "center" });
    drawLine(page, font, tile.value, { x: x + 8, y: tileY + 10, size: 13, color: tile.color, boxWidth: tileW - 16, align: "center" });
  });

  // ---- Table -----------------------------------------------------------------
  const rowH = 24;
  const headH = 26;
  const bottomLimit = 92; // keep clear of the footer

  const drawTableHeader = (pg: PDFPage, topY: number): number => {
    pg.drawRectangle({ x: M, y: topY - headH, width: W - 2 * M, height: headH, color: NAVY });
    COLS.forEach((c, i) => {
      drawLine(pg, font, c.label, { x: colX(i) + 4, y: topY - headH + 8, size: 10, color: WHITE, boxWidth: c.w - 8, align: "center" });
    });
    return topY - headH;
  };

  let y = drawTableHeader(page, tileY - 18);
  rows.forEach((r, idx) => {
    if (y - rowH < bottomLimit) {
      page = newPage();
      y = drawTableHeader(page, H - M);
    }
    if (idx % 2 === 0) page.drawRectangle({ x: M, y: y - rowH, width: W - 2 * M, height: rowH, color: SOFT });
    const cy = y - rowH + 8;
    drawLine(page, fontFor(r.name), r.name, { x: colX(0) + 6, y: cy, size: 10.5, color: INK, boxWidth: COLS[0].w - 12, align: "end" });
    if (r.number) drawLine(page, font, `#${r.number}`, { x: colX(1) + 4, y: cy, size: 10, color: MUTED, boxWidth: COLS[1].w - 8, align: "center" });
    drawLine(page, font, fmt(r.fee), { x: colX(2) + 4, y: cy, size: 10.5, color: INK, boxWidth: COLS[2].w - 8, align: "center" });
    drawLine(page, font, fmt(r.paid), { x: colX(3) + 4, y: cy, size: 10.5, color: GREEN, boxWidth: COLS[3].w - 8, align: "center" });
    drawLine(page, font, fmt(r.left), { x: colX(4) + 4, y: cy, size: 10.5, color: r.left > 0 ? AMBER : GREEN, boxWidth: COLS[4].w - 8, align: "center" });
    page.drawLine({ start: { x: M, y: y - rowH }, end: { x: W - M, y: y - rowH }, thickness: 0.5, color: LINE });
    y -= rowH;
  });

  // Totals row
  if (y - rowH - 4 < bottomLimit) {
    page = newPage();
    y = drawTableHeader(page, H - M);
  }
  page.drawRectangle({ x: M, y: y - rowH - 4, width: W - 2 * M, height: rowH + 4, color: rgb(0.9, 0.93, 0.97) });
  const ty = y - rowH + 6;
  drawLine(page, font, "المجموع", { x: colX(0) + 6, y: ty, size: 11, color: NAVY, boxWidth: COLS[0].w - 12, align: "end" });
  drawLine(page, font, fmt(totalFee), { x: colX(2) + 4, y: ty, size: 11, color: NAVY, boxWidth: COLS[2].w - 8, align: "center" });
  drawLine(page, font, fmt(totalPaid), { x: colX(3) + 4, y: ty, size: 11, color: GREEN, boxWidth: COLS[3].w - 8, align: "center" });
  drawLine(page, font, fmt(totalLeft), { x: colX(4) + 4, y: ty, size: 11, color: totalLeft > 0 ? AMBER : GREEN, boxWidth: COLS[4].w - 8, align: "center" });

  // Footers with page numbers
  pages.forEach((pg, i) => drawFooter(pg, font, latin, i + 1, pages.length));

  return doc.save();
}
