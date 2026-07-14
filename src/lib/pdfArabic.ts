// Shared Arabic shaping + glyph-drawing helpers for server-side PDF generation.
// Used by the registration form filler and the receipt generator so both render
// Arabic identically in every viewer (Apple Preview / Quick Look / pdfium).
import "server-only";
import reshaper from "arabic-reshaper";
import type { PDFFont, PDFPage, rgb } from "pdf-lib";

type Rgb = ReturnType<typeof rgb>;

export const hasArabic = (s: string) => /[؀-ۿ]/.test(s);

const LTR_RUN = /^[A-Za-z0-9@._+\-/:#&()₪%,]+$/;
const TOKEN = /[A-Za-z0-9@._+\-/:#&()₪%,]+|\s+|[^A-Za-z0-9@._+\-/:#&()₪%,\s]/g;

/** Reshape Arabic to presentation forms and reorder to visual RTL, keeping
 * embedded Latin/number runs left-to-right. */
export function toVisual(text: string): string {
  const reshaped = reshaper.convertArabic(text);
  const tokens = reshaped.match(TOKEN) ?? [];
  const placed = tokens.map((tk) => (LTR_RUN.test(tk) || /^\s+$/.test(tk) ? tk : [...tk].reverse().join("")));
  return placed.reverse().join("");
}

/** Draw an already-visual-ordered string one glyph at a time at explicit x
 * positions. Essential for Arabic: drawing it as a single run lets the viewer
 * re-apply its own bidi and mangle our pre-shaped text. */
export function drawGlyphs(page: PDFPage, font: PDFFont, visual: string, x: number, y: number, size: number, color: Rgb) {
  let cx = x;
  for (const ch of visual) {
    page.drawText(ch, { x: cx, y, size, font, color });
    cx += font.widthOfTextAtSize(ch, size);
  }
}

/** Measured width of a string once shaped (for layout / centering). */
export function measure(font: PDFFont, text: string, size: number): number {
  const visual = hasArabic(text) ? toVisual(text) : text;
  return font.widthOfTextAtSize(visual, size);
}

export type Align = "start" | "center" | "end";

/**
 * Draw a line of text at (x,y) where x is the LEFT edge of a box of `boxWidth`,
 * aligning within it. Arabic is shaped + glyph-drawn; Latin drawn directly.
 * `align` is logical: for the receipt we treat "start" as right in RTL context
 * via the `rtl` flag. Returns nothing; purely visual.
 */
export function drawLine(
  page: PDFPage,
  font: PDFFont,
  text: string,
  opts: { x: number; y: number; size: number; color: Rgb; boxWidth?: number; align?: Align },
) {
  const { x, y, size, color, boxWidth, align = "start" } = opts;
  const rtl = hasArabic(text);
  const visual = rtl ? toVisual(text) : text;
  const w = font.widthOfTextAtSize(visual, size);
  let drawX = x;
  if (boxWidth != null) {
    if (align === "center") drawX = x + (boxWidth - w) / 2;
    else if (align === "end") drawX = x + boxWidth - w;
  }
  if (rtl) drawGlyphs(page, font, visual, drawX, y, size, color);
  else page.drawText(visual, { x: drawX, y, size, font, color });
  return w;
}
