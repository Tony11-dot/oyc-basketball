import { createPaymentIntent, FEE_AGOROT, PaymentNotConfiguredError, PAYMENTS_ENABLED } from "@/lib/payments";
import { getContent } from "@/lib/db";

// POST — create a Stripe PaymentIntent for the embedded Payment Element.
// Returns { clientSecret } the front-end uses to confirm the card on our site.
// The amount is taken from the admin-set fee server-side (never trusting the
// client) so it always matches the Payment Element shown on the page.
export async function POST(request: Request) {
  if (!PAYMENTS_ENABLED) {
    return Response.json({ error: "payments_not_configured" }, { status: 501 });
  }
  let body: { email?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* email is optional */
  }
  try {
    const content = await getContent();
    const fee = content.register?.feeAmount;
    const amount = fee && fee > 0 ? Math.round(fee * 100) : FEE_AGOROT;
    const { clientSecret } = await createPaymentIntent(amount, body.email);
    return Response.json({ clientSecret });
  } catch (e) {
    if (e instanceof PaymentNotConfiguredError) {
      return Response.json({ error: "payments_not_configured" }, { status: 501 });
    }
    console.error("[payments] intent failed:", e);
    return Response.json({ error: "intent_failed" }, { status: 502 });
  }
}
