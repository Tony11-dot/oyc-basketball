import { createCheckout, PaymentNotConfiguredError, PAYMENTS_ENABLED } from "@/lib/payments";

// POST — start a hosted card checkout for a registration. Returns { url } to
// redirect the customer to the gateway. While no provider is configured this
// responds 501 so the front-end can fall back to "pay offline within 7 days".
export async function POST(request: Request) {
  if (!PAYMENTS_ENABLED) {
    return Response.json({ error: "payments_not_configured" }, { status: 501 });
  }

  let body: { registrationId?: string; amount?: number; customerName?: string; customerEmail?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.registrationId) {
    return Response.json({ error: "registrationId is required" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  try {
    const result = await createCheckout({
      registrationId: body.registrationId,
      amount: body.amount,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      returnUrl: `${origin}/?section=register`,
    });
    return Response.json(result);
  } catch (e) {
    if (e instanceof PaymentNotConfiguredError) {
      return Response.json({ error: "payments_not_configured" }, { status: 501 });
    }
    console.error("[payments] checkout failed:", e);
    return Response.json({ error: "checkout_failed" }, { status: 502 });
  }
}
