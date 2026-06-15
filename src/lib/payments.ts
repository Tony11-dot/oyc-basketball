// Server-only payment abstraction. Provider-agnostic on purpose: the club hasn't
// picked a gateway yet, so this exposes one `createCheckout()` call that the rest
// of the app uses, and the provider is selected at runtime via env vars.
//
// To go live: choose a provider, add its keys to the environment, and fill in the
// matching branch below. Nothing else in the app needs to change.
//
//   PAYMENT_PROVIDER = "stripe" | "tranzila" | "cardcom" | "payplus" | ""(off)
//
// We never collect or store raw card numbers ourselves (PCI scope) — each branch
// returns a hosted/redirect URL where the customer enters their card securely.
import "server-only";
import { FEE_AGOROT, CURRENCY } from "./registrationFields";
import { getContent } from "./db";

export const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER ?? "";
export const PAYMENTS_ENABLED = PAYMENT_PROVIDER !== "";
export { FEE_AGOROT, CURRENCY };

export interface CheckoutRequest {
  registrationId: string;
  /** Amount in agorot. Defaults to the full annual fee. */
  amount?: number;
  customerName?: string;
  customerEmail?: string;
  /** Where the gateway should send the customer back to. */
  returnUrl: string;
}

export interface CheckoutResult {
  /** Hosted payment page to redirect the customer to. */
  url: string;
  /** Provider's reference for this payment attempt. */
  ref: string;
}

class PaymentNotConfiguredError extends Error {
  constructor() {
    super("Payment provider is not configured (set PAYMENT_PROVIDER and its keys).");
    this.name = "PaymentNotConfiguredError";
  }
}
export { PaymentNotConfiguredError };

/**
 * Create a Stripe PaymentIntent for the embedded Payment Element flow and return
 * its client secret. The Element collects the card directly on our site (in a
 * Stripe-hosted iframe), so the member enters their card only once.
 */
export async function createPaymentIntent(
  amount: number = FEE_AGOROT,
  customerEmail?: string,
): Promise<{ clientSecret: string; id: string }> {
  if (PAYMENT_PROVIDER !== "stripe") throw new PaymentNotConfiguredError();
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new PaymentNotConfiguredError();
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(key);
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: CURRENCY.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    description: "OYC Nazareth registration fee",
    receipt_email: customerEmail,
  });
  if (!intent.client_secret) throw new Error("Stripe returned no client secret");
  return { clientSecret: intent.client_secret, id: intent.id };
}

/** Verify a PaymentIntent actually succeeded for the expected fee — used when a
 * card registration is saved, so we only mark it paid on a real payment. */
export async function verifyPaymentIntent(id: string): Promise<{ paid: boolean }> {
  if (PAYMENT_PROVIDER !== "stripe") return { paid: false };
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { paid: false };
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(key);
    const intent = await stripe.paymentIntents.retrieve(id);
    // Expected fee comes from the admin-set amount (falls back to the default).
    const content = await getContent();
    const fee = content.register?.feeAmount;
    const expected = fee && fee > 0 ? Math.round(fee * 100) : FEE_AGOROT;
    const paid =
      intent.status === "succeeded" &&
      intent.amount >= expected &&
      intent.currency === CURRENCY.toLowerCase();
    return { paid };
  } catch (e) {
    console.error("[payments] verifyPaymentIntent failed:", e);
    return { paid: false };
  }
}

/**
 * Create a hosted-checkout session and return its URL. Throws
 * PaymentNotConfiguredError until a provider + keys are wired up.
 */
export async function createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
  // Amount the chosen provider should charge (full annual fee unless overridden).
  const amount = req.amount ?? FEE_AGOROT;
  void amount; // used by each provider branch once wired up

  switch (PAYMENT_PROVIDER) {
    case "stripe": {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new PaymentNotConfiguredError();
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(key);
      const sep = req.returnUrl.includes("?") ? "&" : "?";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: CURRENCY.toLowerCase(),
              product_data: { name: "OYC Nazareth registration fee" },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        customer_email: req.customerEmail,
        success_url: `${req.returnUrl}${sep}paid=1&reg=${req.registrationId}`,
        cancel_url: `${req.returnUrl}${sep}paid=0`,
        metadata: { registrationId: req.registrationId },
      });
      if (!session.url) throw new Error("Stripe returned no checkout URL");
      return { url: session.url, ref: session.id };
    }
    // Israeli gateways (Tranzila / Cardcom / PayPlus) follow the same shape:
    // build a hosted-page request with the amount + return URL, then return the
    // redirect URL + a transaction reference. Fill in when chosen.
    case "tranzila":
    case "cardcom":
    case "payplus":
      throw new PaymentNotConfiguredError();
    default:
      throw new PaymentNotConfiguredError();
  }
}
