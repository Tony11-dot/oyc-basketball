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

export const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER ?? "";
export const PAYMENTS_ENABLED = PAYMENT_PROVIDER !== "";

// Annual club fee in agorot (₪3,500) + the ₪30 basketball-association fee.
// Stored in the smallest currency unit so providers get integer amounts.
export const FEE_AGOROT = 3_530_00;
export const CURRENCY = "ILS";

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
