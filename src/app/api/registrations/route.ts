import { randomUUID } from "crypto";
import { getRegistrations, updateRegistrations } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { validateRegistration } from "@/lib/validation";
import { sendRegistrationEmails } from "@/lib/mail";
import { getAssets, fillRegistrationPdf, storeFilledPdf } from "@/lib/registrationPdf";
import { verifyPaymentIntent } from "@/lib/payments";
import type { Registration } from "@/lib/types";

// GET — list registrations (admin only), newest first.
export async function GET() {
  if (!(await isAuthed())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const registrations = (await getRegistrations())
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return Response.json({ registrations });
}

// POST — submit a registration (public). Fills + stores the official PDF.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = validateRegistration(body);
  if (!result.ok) return Response.json({ error: result.error }, { status: 422 });

  const signature =
    typeof (body as Record<string, unknown>).signature === "string"
      ? ((body as Record<string, unknown>).signature as string)
      : undefined;
  const id = randomUUID();

  // If a card was paid via the embedded Payment Element, the client passes the
  // PaymentIntent id; we verify it actually succeeded before marking it paid.
  const paymentIntentId =
    typeof (body as Record<string, unknown>).paymentIntentId === "string"
      ? ((body as Record<string, unknown>).paymentIntentId as string)
      : undefined;
  let paymentStatus: Registration["paymentStatus"];
  let paymentRef: string | undefined;
  if (paymentIntentId) {
    const { paid } = await verifyPaymentIntent(paymentIntentId);
    if (paid) {
      paymentStatus = "paid";
      paymentRef = paymentIntentId;
    }
  }

  // Generate + store the filled official PDF. Best-effort: a PDF/storage hiccup
  // must never lose the registration, so we record it either way.
  let pdf: Uint8Array | undefined;
  let pdfUrl: string | undefined;
  try {
    const { template, font } = await getAssets(request.url);
    pdf = await fillRegistrationPdf(template, font, result.value, signature);
    ({ pdfUrl } = await storeFilledPdf(id, pdf));
  } catch (e) {
    console.error("[registrations] PDF generation/storage failed:", e);
  }

  const registration: Registration = {
    id,
    createdAt: new Date().toISOString(),
    status: "new",
    ...result.value,
    hasSignature: !!signature,
    pdfUrl,
    paymentStatus,
    paymentRef,
  };

  await updateRegistrations((list) => [registration, ...list]);

  // Confirmation + club notification with the filled PDF attached. Never throws;
  // awaited so the serverless function stays alive through the SMTP exchange.
  await sendRegistrationEmails(registration, pdf);

  return Response.json({ registration }, { status: 201 });
}
