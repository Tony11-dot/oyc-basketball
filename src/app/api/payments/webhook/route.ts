import { updateRegistrations } from "@/lib/db";
import { PAYMENT_PROVIDER } from "@/lib/payments";

// Stripe webhook — marks a registration paid once its checkout completes.
// Configure the endpoint URL ( /api/payments/webhook ) in the Stripe dashboard
// and put its signing secret in STRIPE_WEBHOOK_SECRET.
export async function POST(request: Request) {
  if (PAYMENT_PROVIDER !== "stripe") {
    return Response.json({ error: "not_stripe" }, { status: 501 });
  }
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) {
    return Response.json({ error: "not_configured" }, { status: 501 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) return Response.json({ error: "missing signature" }, { status: 400 });

  const raw = await request.text();
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(key);

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (e) {
    console.error("[payments] webhook signature verification failed:", e);
    return Response.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as import("stripe").Stripe.Checkout.Session;
    const regId = session.metadata?.registrationId;
    if (regId) {
      await updateRegistrations((list) =>
        list.map((r) => (r.id === regId ? { ...r, paymentStatus: "paid", paymentRef: session.id } : r)),
      );
    }
  }

  return Response.json({ received: true });
}
