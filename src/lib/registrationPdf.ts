// Server-only: fills the official OYC registration PDF from a Registration and a
// drawn signature, then stores/loads the filled file.
//
// We DRAW each value onto the page (rather than setting interactive field values)
// so the result is fully flat and renders identically in every viewer — no
// reliance on NeedAppearances. Arabic is reshaped to presentation forms and
// reordered for RTL; Latin/number text is drawn as-is. The /Sig field becomes a
// drawn image. All AcroForm fields are then removed.
import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { PDFDocument, PDFRef, rgb, type PDFForm, type PDFField, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import reshaper from "arabic-reshaper";
import type { Registration } from "./types";
import { JERSEY_SIZES, PAYMENT_VALUES, PDF_FIELD_MAP, SIGNATURE_FIELD, type RegistrationInput } from "./registrationFields";

// Choice fields are rendered as a row of option boxes (like the paper form) with
// an X in the selected one — instead of writing the chosen value as plain text.
const CHOICE_OPTIONS: Record<string, readonly string[]> = {
  jersey_size: JERSEY_SIZES,
  payment_method: PAYMENT_VALUES,
};

// Mirror db.ts: ephemeral /tmp on Vercel, project ./data locally.
const DATA_DIR = process.env.VERCEL ? "/tmp/oyc-data" : path.join(process.cwd(), "data");
const formsDir = () => path.join(DATA_DIR, "forms");
const localPath = (id: string) => path.join(formsDir(), `${id}.pdf`);

function resolveBlobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  for (const value of Object.values(process.env)) {
    if (typeof value === "string" && value.startsWith("vercel_blob_rw_")) {
      process.env.BLOB_READ_WRITE_TOKEN = value;
      return value;
    }
  }
  return undefined;
}

// ---- assets (fetched once from /public, cached in module scope) -------------
let _template: Uint8Array | null = null;
let _font: Uint8Array | null = null;
async function fetchBin(baseUrl: string, p: string): Promise<Uint8Array> {
  const res = await fetch(new URL(p, baseUrl));
  if (!res.ok) throw new Error(`fetch ${p} failed: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}
export async function getAssets(baseUrl: string): Promise<{ template: Uint8Array; font: Uint8Array }> {
  if (!_template) _template = await fetchBin(baseUrl, "/forms/registration-template.pdf");
  if (!_font) _font = await fetchBin(baseUrl, "/forms/Amiri-Regular.ttf");
  return { template: _template, font: _font };
}

// ---- Arabic shaping ---------------------------------------------------------
const hasArabic = (s: string) => /[؀-ۿ]/.test(s);
const LTR_RUN = /^[A-Za-z0-9@._+\-/:#&()]+$/;

/** Reshape Arabic to presentation forms and reorder to visual RTL, keeping
 * embedded Latin/number runs left-to-right. */
function toVisual(text: string): string {
  const reshaped = reshaper.convertArabic(text);
  const tokens = reshaped.match(/[A-Za-z0-9@._+\-/:#&()]+|\s+|[^A-Za-z0-9@._+\-/:#&()\s]/g) ?? [];
  const placed = tokens.map((tk) => (LTR_RUN.test(tk) || /^\s+$/.test(tk) ? tk : [...tk].reverse().join("")));
  return placed.reverse().join("");
}

interface Rect { x: number; y: number; width: number; height: number }

function drawValue(page: PDFPage, font: PDFFont, rect: Rect, value: string) {
  const rtl = hasArabic(value);
  const text = rtl ? toVisual(value) : value;
  let size = 10;
  const maxW = rect.width - 6;
  while (size > 6 && font.widthOfTextAtSize(text, size) > maxW) size -= 0.5;
  const w = Math.min(font.widthOfTextAtSize(text, size), maxW);
  const x = rtl ? rect.x + rect.width - 3 - w : rect.x + 3;
  const y = rect.y + (rect.height - size) / 2 + size * 0.2;
  page.drawText(text, { x, y, size, font, color: rgb(0.05, 0.07, 0.12) });
}

/**
 * Render a set of option boxes within (and flowing from) the field rectangle,
 * marking the selected option with an X — mirroring the printed paper form. The
 * grid wraps onto extra rows when the options don't fit on one line, and lays
 * out right-to-left for Arabic option labels.
 */
function drawChoiceBoxes(
  page: PDFPage,
  font: PDFFont,
  rect: Rect,
  options: readonly string[],
  selected: string,
  opts?: { clearLeft?: number; fontSize?: number },
) {
  const fontSize = opts?.fontSize ?? 8;
  const clearLeft = opts?.clearLeft ?? 0;
  const boxSize = fontSize + 1;
  const gap = 3; // box → label
  const itemGap = 14; // between options
  const pad = 4;
  const rtl = options.some(hasArabic);
  const ink = rgb(0.05, 0.07, 0.12);
  const line = rgb(0.25, 0.27, 0.32);
  const white = rgb(1, 1, 1);

  // The layout/clear area: the field rectangle, optionally extended to the left
  // so we can erase leftover template text (e.g. a stray "بطاقة اعتماد").
  const area = { x: rect.x - clearLeft, y: rect.y, width: rect.width + clearLeft, height: rect.height };

  // White-out the whole area first — removes the old dropdown box and any static
  // text underneath, so our option row is the only thing showing.
  page.drawRectangle({ x: area.x, y: area.y - 4, width: area.width + 4, height: area.height + 8, color: white });

  const items = options.map((opt) => {
    const label = hasArabic(opt) ? toVisual(opt) : opt;
    const labelW = font.widthOfTextAtSize(label, fontSize);
    return { opt, label, width: boxSize + gap + labelW };
  });

  const rowH = boxSize + 7;
  // Logical left-to-right placement with wrapping; mirrored horizontally for RTL.
  let cx = pad;
  let row = 0;
  const placed = items.map((it) => {
    if (cx > pad && cx + it.width > area.width - pad) {
      row += 1;
      cx = pad;
    }
    const lx = cx;
    cx += it.width + itemGap;
    return { ...it, lx, row };
  });

  const topY = area.y + area.height - pad;
  for (const p of placed) {
    const x = rtl ? area.x + area.width - p.lx - p.width : area.x + p.lx;
    const boxX = rtl ? x + p.width - boxSize : x;
    const labelX = rtl ? x : x + boxSize + gap;
    const yTop = topY - p.row * rowH;
    const boxY = yTop - boxSize;
    page.drawRectangle({ x: boxX, y: boxY, width: boxSize, height: boxSize, borderWidth: 0.9, borderColor: line });
    if (p.opt === selected) {
      page.drawText("X", { x: boxX + 1.6, y: boxY + 1.4, size: boxSize - 1, font, color: ink });
    }
    page.drawText(p.label, { x: labelX, y: boxY + 1.4, size: fontSize, font, color: ink });
  }
}

// ---- field removal (low level; pdf-lib can't removeField a /Sig) ------------
const sameRef = (a: unknown, b: PDFRef) =>
  a instanceof PDFRef && a.objectNumber === b.objectNumber && a.generationNumber === b.generationNumber;

function dropField(doc: PDFDocument, form: PDFForm, field: PDFField) {
  const ref = field.ref;
  const fields = form.acroForm.normalizedEntries().Fields;
  for (let i = fields.size() - 1; i >= 0; i--) if (sameRef(fields.get(i), ref)) fields.remove(i);
  for (const page of doc.getPages()) {
    const annots = page.node.Annots();
    if (!annots) continue;
    for (let i = annots.size() - 1; i >= 0; i--) if (sameRef(annots.get(i), ref)) annots.remove(i);
  }
}

/** Fill the template with the registration data + the drawn signature (a PNG
 * data URL). Returns flat PDF bytes. Never throws on a single bad field. */
export async function fillRegistrationPdf(
  template: Uint8Array,
  fontBytes: Uint8Array,
  data: RegistrationInput,
  signatureDataUrl?: string,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(template);
  pdfDoc.registerFontkit(fontkit);
  // Embed the full font (no subset): pdf-lib's subsetting renders incorrectly in
  // Apple CoreGraphics (Quick Look / Preview / Safari / iOS Mail), which the club
  // will use. Full embed is larger but renders everywhere.
  const font = await pdfDoc.embedFont(fontBytes, { subset: false });
  const form = pdfDoc.getForm();
  const page = pdfDoc.getPages()[0];

  for (const [key, fieldName] of Object.entries(PDF_FIELD_MAP)) {
    let field: PDFField;
    try {
      field = form.getField(fieldName);
    } catch {
      continue;
    }
    try {
      const value = (data as unknown as Record<string, unknown>)[key];
      const rect = field.acroField.getWidgets()[0].getRectangle();
      const options = CHOICE_OPTIONS[fieldName];
      if (options) {
        // Always draw the full set of boxes; X the chosen one (if any). For the
        // payment row we extend the clear area left to erase a stray template
        // label and give the three Arabic options room on one tidy RTL line.
        const choiceOpts =
          fieldName === "payment_method"
            ? { clearLeft: rect.x - 46, fontSize: 9 }
            : undefined;
        drawChoiceBoxes(page, font, rect, options, value != null ? String(value) : "", choiceOpts);
      } else if (value != null && value !== "") {
        drawValue(page, font, rect, String(value));
      }
    } catch {
      /* keep going — one bad field shouldn't fail the whole fill */
    }
    try {
      dropField(pdfDoc, form, field);
    } catch {
      /* ignore */
    }
  }

  // Signature: draw the captured PNG over the /Sig widget, then drop the field.
  try {
    const sig = form.getField(SIGNATURE_FIELD);
    if (signatureDataUrl?.startsWith("data:image/png")) {
      const { x, y, width, height } = sig.acroField.getWidgets()[0].getRectangle();
      const png = await pdfDoc.embedPng(Buffer.from(signatureDataUrl.split(",")[1] ?? "", "base64"));
      const fit = png.scaleToFit(width - 4, height - 4);
      page.drawImage(png, {
        x: x + (width - fit.width) / 2,
        y: y + (height - fit.height) / 2,
        width: fit.width,
        height: fit.height,
      });
    }
    dropField(pdfDoc, form, sig);
  } catch (e) {
    console.error("[registrationPdf] signature handling failed:", e);
  }

  return pdfDoc.save();
}

// ---- storage ----------------------------------------------------------------

/** Store the filled PDF: Vercel Blob in production, local disk in dev. Returns a
 * Blob URL when used (saved on the registration so the admin route can fetch). */
export async function storeFilledPdf(id: string, bytes: Uint8Array): Promise<{ pdfUrl?: string }> {
  const token = resolveBlobToken();
  if (token) {
    const { put } = await import("@vercel/blob");
    const { url } = await put(`registrations/${id}.pdf`, Buffer.from(bytes), {
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: true,
      token,
    });
    return { pdfUrl: url };
  }
  await fs.mkdir(formsDir(), { recursive: true });
  await fs.writeFile(localPath(id), Buffer.from(bytes));
  return {};
}

/** Load a stored filled PDF (Blob URL or local disk). Null if not found. */
export async function loadFilledPdf(reg: Registration): Promise<Uint8Array | null> {
  if (reg.pdfUrl) {
    try {
      const res = await fetch(reg.pdfUrl);
      if (res.ok) return new Uint8Array(await res.arrayBuffer());
    } catch {
      /* fall through to disk */
    }
  }
  try {
    return new Uint8Array(await fs.readFile(localPath(reg.id)));
  } catch {
    return null;
  }
}
