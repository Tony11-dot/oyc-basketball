"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { DateField } from "@/components/ui/Calendar";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { JERSEY_SIZES, FEE_AGOROT } from "@/lib/registrationFields";
import type { RegisterContent } from "@/lib/types";
import { SectionBg } from "./SectionBg";
import { cn } from "@/lib/cn";

// The credit-card option value (matches the PDF/dropdown string).
const CARD_VALUE = "بطاقة اعتماد";

// Stripe publishable key (public). When unset, the embedded card fields are
// hidden and card payment falls back to the redirect checkout / offline flow.
const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

interface FormValues {
  playerName: string;
  idNumber: string;
  birthDate: string;
  phonePlayer: string;
  fatherName: string;
  motherName: string;
  phoneFather: string;
  phoneMother: string;
  email: string;
  address: string;
  school: string;
  classGrade: string;
  jerseySize: string;
  paymentMethod: string;
  guardianName: string;
  dateSigned: string;
}

type PayFn = (opts: { email?: string }) => Promise<{ error?: string; paymentIntentId?: string }>;
type PayRef = React.MutableRefObject<PayFn | null>;

const todayISO = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const toDisplayDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

// Wrapper: provide the Stripe Elements context when a publishable key exists, so
// the embedded Payment Element can render inside the form.
export function Register({ bg, content }: { bg?: string; content?: RegisterContent }) {
  // Card total from the admin-set fee (whole shekels → agorot), else the default.
  const amount = content?.feeAmount && content.feeAmount > 0 ? Math.round(content.feeAmount * 100) : FEE_AGOROT;
  if (stripePromise) {
    return (
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount,
          currency: "ils",
          appearance: { theme: "stripe", variables: { colorPrimary: "#12306e", borderRadius: "12px" } },
        }}
      >
        <RegisterForm bg={bg} content={content} stripeReady />
      </Elements>
    );
  }
  return <RegisterForm bg={bg} content={content} stripeReady={false} />;
}

function RegisterForm({ bg, content, stripeReady }: { bg?: string; content?: RegisterContent; stripeReady: boolean }) {
  const { t, pick } = useI18n();
  const toast = useToast();
  const f = t.register.form;
  const [done, setDone] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [sigError, setSigError] = useState(false);
  const [payError, setPayError] = useState("");

  // Editable section copy (admin Content → Register), falling back to defaults.
  const eyebrow = content?.eyebrow ? pick(content.eyebrow) : t.register.eyebrow;
  const heading = content?.heading ? pick(content.heading) : t.register.heading;
  const subheading = content?.subheading ? pick(content.subheading) : t.register.subheading;
  const feeNote = content?.feeNote && pick(content.feeNote) ? pick(content.feeNote) : f.feeNote;
  const consentText = content?.consent && pick(content.consent) ? pick(content.consent) : f.consent;
  const perks = content?.perks?.length ? content.perks.map((p) => pick(p)).filter(Boolean) : t.register.perks;

  // Set by the embedded Stripe field so the form's submit can trigger the charge.
  const payRef = useRef<PayFn | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      playerName: "", idNumber: "", birthDate: "", phonePlayer: "",
      fatherName: "", motherName: "", phoneFather: "", phoneMother: "",
      email: "", address: "", school: "", classGrade: "",
      jerseySize: "", paymentMethod: "", guardianName: "", dateSigned: "",
    },
  });

  // Prefill the date on the client to avoid an SSR/CSR mismatch.
  useEffect(() => setValue("dateSigned", todayISO()), [setValue]);

  const paymentMethod = watch("paymentMethod");
  const isCard = paymentMethod === CARD_VALUE;

  // ---- Signature pad --------------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [signed, setSigned] = useState(false);

  const ctx = () => canvasRef.current?.getContext("2d") ?? null;
  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const g = ctx();
    if (!g || !last.current) return;
    const p = pos(e);
    g.strokeStyle = "#0c2150";
    g.lineWidth = 2.5;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(last.current.x, last.current.y);
    g.lineTo(p.x, p.y);
    g.stroke();
    last.current = p;
    if (!signed) setSigned(true);
    if (sigError) setSigError(false);
  };
  const up = () => {
    drawing.current = false;
    last.current = null;
  };
  const clearSig = () => {
    const c = canvasRef.current;
    const g = ctx();
    if (c && g) g.clearRect(0, 0, c.width, c.height);
    setSigned(false);
  };

  function registerAnother() {
    setDone(false);
    setConsent(false);
    setPayError("");
    clearSig();
    reset();
    setValue("dateSigned", todayISO());
  }

  const onSubmit = handleSubmit(async (values) => {
    let bad = false;
    if (!consent) { setConsentError(true); bad = true; }
    if (!signed) { setSigError(true); bad = true; }
    if (bad) return;
    setPayError("");

    const card = values.paymentMethod === CARD_VALUE;

    // Card + embedded Stripe → charge the card on our site first, then save the
    // registration with the (verified) PaymentIntent id.
    let paymentIntentId: string | undefined;
    if (card && stripeReady) {
      if (!payRef.current) { setPayError(t.register.errors.generic); return; }
      const r = await payRef.current({ email: values.email });
      if (r.error || !r.paymentIntentId) {
        setPayError(r.error || t.register.errors.generic);
        return;
      }
      paymentIntentId = r.paymentIntentId;
    }

    const signature = canvasRef.current?.toDataURL("image/png");
    const payload = { ...values, dateSigned: toDisplayDate(values.dateSigned), signature, paymentIntentId };

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();

      // Card but no embedded Stripe (no publishable key) → try the redirect
      // checkout; if that's not configured either, the registration still
      // completes and the fee is settled offline.
      if (card && !stripeReady && data?.registration?.id) {
        try {
          const pay = await fetch("/api/payments/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationId: data.registration.id, customerName: values.playerName, customerEmail: values.email }),
          });
          if (pay.ok) {
            const { url } = await pay.json();
            if (url) { window.location.href = url; return; }
          }
        } catch {
          /* provider not ready — fall through to success */
        }
      }

      setDone(true);
    } catch {
      toast.error(t.register.errors.generic);
    }
  });

  const reqErr = (name: keyof FormValues) => (errors[name] ? t.register.errors.required : undefined);
  const phoneErr = (name: keyof FormValues) =>
    errors[name] ? (errors[name]?.type === "required" ? t.register.errors.required : t.register.errors.phone) : undefined;

  return (
    <section id="register" className={`relative scroll-mt-20 overflow-hidden bg-surface py-20 md:py-28 ${bg ? "flex min-h-screen flex-col justify-center" : ""}`}>
      <SectionBg url={bg} />
      <div className="container-x grid items-start gap-10 lg:grid-cols-[1fr_1.25fr]">
        {/* Left: invitation panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl brand-gradient-animated p-8 text-white md:p-10 lg:sticky lg:top-24"
        >
          <span className="inline-block rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            {eyebrow}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight md:text-4xl">{heading}</h2>
          <p className="mt-4 max-w-md text-white/85">{subheading}</p>
          <ul className="mt-8 space-y-3 text-sm">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-white/20 text-xs">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-2xl bg-white/10 p-4 text-xs leading-relaxed text-white/80">{feeNote}</p>
          <div className="pointer-events-none absolute -bottom-16 -end-16 size-56 rounded-full bg-white/10 blur-2xl" />
        </motion.div>

        {/* Right: form / success */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-line bg-white p-6 shadow-card md:p-8"
        >
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center py-12 text-center"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="grid size-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600"
                >
                  ✓
                </motion.span>
                <h3 className="mt-5 text-3xl font-extrabold text-ink">{t.register.successTitle}</h3>
                <p className="mt-3 max-w-sm text-lg text-ink/80">{t.register.successBody}</p>
                <button
                  type="button"
                  onClick={registerAnother}
                  className="mt-8 text-base font-semibold text-brand-dark underline-offset-2 hover:underline"
                >
                  {t.register.registerAnother}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Player */}
                <FieldSet legend={f.sectionPlayer}>
                  <Field label={f.player} error={reqErr("playerName")} className="sm:col-span-2">
                    <input {...register("playerName", { required: true })} className={inputCls(!!errors.playerName)} />
                  </Field>
                  <Field label={f.idNumber} error={reqErr("idNumber")}>
                    <input dir="ltr" {...register("idNumber", { required: true })} className={inputCls(!!errors.idNumber)} />
                  </Field>
                  <Field label={f.birthDate} error={reqErr("birthDate")}>
                    <Controller
                      name="birthDate"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <DateField value={field.value} onChange={field.onChange} max={todayISO()} placeholder={f.birthDate} />
                      )}
                    />
                  </Field>
                  <Field label={f.phonePlayer} error={phoneErr("phonePlayer")}>
                    <input type="tel" dir="ltr" {...register("phonePlayer", { required: true, validate: isValidPhone })} className={inputCls(!!errors.phonePlayer)} />
                  </Field>
                  <Field label={f.jerseySize} error={reqErr("jerseySize")}>
                    <select {...register("jerseySize", { required: true })} className={selectCls}>
                      <option value="">{f.jerseyPlaceholder}</option>
                      {JERSEY_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </FieldSet>

                {/* Parents */}
                <FieldSet legend={f.sectionParents}>
                  <Field label={f.father} error={reqErr("fatherName")}>
                    <input {...register("fatherName", { required: true })} className={inputCls(!!errors.fatherName)} />
                  </Field>
                  <Field label={f.mother} error={reqErr("motherName")}>
                    <input {...register("motherName", { required: true })} className={inputCls(!!errors.motherName)} />
                  </Field>
                  <Field label={f.phoneFather} error={phoneErr("phoneFather")}>
                    <input type="tel" dir="ltr" {...register("phoneFather", { required: true, validate: isValidPhone })} className={inputCls(!!errors.phoneFather)} />
                  </Field>
                  <Field label={f.phoneMother} error={phoneErr("phoneMother")}>
                    <input type="tel" dir="ltr" {...register("phoneMother", { required: true, validate: isValidPhone })} className={inputCls(!!errors.phoneMother)} />
                  </Field>
                </FieldSet>

                {/* Contact & school */}
                <FieldSet legend={f.sectionContact}>
                  <Field
                    label={t.register.email}
                    error={errors.email && (errors.email.type === "required" ? t.register.errors.required : t.register.errors.email)}
                    className="sm:col-span-2"
                  >
                    <input type="email" dir="ltr" {...register("email", { required: true, validate: (v) => isValidEmail(v) })} className={inputCls(!!errors.email)} />
                  </Field>
                  <Field label={f.address} error={reqErr("address")} className="sm:col-span-2">
                    <input {...register("address", { required: true })} className={inputCls(!!errors.address)} />
                  </Field>
                  <Field label={f.school} error={reqErr("school")}>
                    <input {...register("school", { required: true })} className={inputCls(!!errors.school)} />
                  </Field>
                  <Field label={f.grade} error={reqErr("classGrade")}>
                    <input {...register("classGrade", { required: true })} className={inputCls(!!errors.classGrade)} />
                  </Field>
                </FieldSet>

                {/* Club */}
                <FieldSet legend={f.sectionClub}>
                  <Field label={f.payment} error={reqErr("paymentMethod")} className="sm:col-span-2">
                    <select {...register("paymentMethod", { required: true })} className={selectCls}>
                      <option value="">{f.paymentPlaceholder}</option>
                      <option value="نقدا">{f.paymentCash}</option>
                      <option value="شيكات">{f.paymentCheck}</option>
                      <option value="تحويل بنكي">{f.paymentBankTransfer}</option>
                      <option value="أمر دائم">{f.paymentStandingOrder}</option>
                      <option value={CARD_VALUE}>{f.paymentCard}</option>
                    </select>
                  </Field>

                  {/* Cash / cheque → settle within 7 days. */}
                  {paymentMethod && !isCard && (
                    <div className="sm:col-span-2 flex items-start gap-2.5 rounded-xl bg-amber-50 p-3.5 text-sm text-amber-800">
                      <span aria-hidden className="text-base leading-none">⏳</span>
                      <span>{f.paymentWithin7Days}</span>
                    </div>
                  )}

                  {/* Card → secure payment. Embedded Stripe fields when available. */}
                  {isCard && (
                    <div className={cn("sm:col-span-2 space-y-3 rounded-2xl border p-4", payError ? "border-rose-400 bg-rose-50/40" : "border-brand/25 bg-brand-50/40")}>
                      <span className="text-sm font-bold text-brand-dark">💳 {f.cardTitle}</span>
                      {stripeReady ? (
                        <StripePaymentField payRef={payRef} onChange={() => setPayError("")} />
                      ) : (
                        <p className="text-sm text-ink/80">{f.payPending}</p>
                      )}
                      {payError && <p className="text-xs font-medium text-rose-600">{payError}</p>}
                      <p className="flex items-start gap-1.5 text-xs text-muted">
                        <span aria-hidden>🔒</span>
                        <span>{f.paySecureNote}</span>
                      </p>
                    </div>
                  )}
                </FieldSet>

                {/* Declaration & signature */}
                <FieldSet legend={f.sectionSign}>
                  <Field label={f.guardian} error={reqErr("guardianName")}>
                    <input {...register("guardianName", { required: true })} className={inputCls(!!errors.guardianName)} />
                  </Field>
                  <Field label={f.date} error={reqErr("dateSigned")}>
                    <Controller
                      name="dateSigned"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <DateField value={field.value} onChange={field.onChange} placeholder={f.date} />
                      )}
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">{f.signature}</span>
                      <button type="button" onClick={clearSig} className="text-xs font-semibold text-brand-dark hover:underline">
                        ✕ {f.clear}
                      </button>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={190}
                      onPointerDown={down}
                      onPointerMove={move}
                      onPointerUp={up}
                      onPointerLeave={up}
                      className={cn(
                        "h-44 w-full touch-none rounded-xl border bg-surface",
                        sigError ? "border-rose-400" : "border-line",
                      )}
                    />
                    <p className="mt-1 text-xs text-muted">{f.signatureHint}</p>
                    {sigError && <p className="mt-1 text-xs font-medium text-rose-600">{t.register.errors.required}</p>}
                  </div>

                  <label className="flex cursor-pointer items-start gap-2.5 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setConsentError(false); }}
                      className="mt-0.5 size-4 shrink-0 accent-brand"
                    />
                    <span className={cn("text-xs leading-relaxed", consentError ? "text-rose-600" : "text-muted")}>{consentText}</span>
                  </label>
                </FieldSet>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-lg font-bold text-white shadow-[0_10px_28px_rgba(18,48,110,0.28)] transition hover:bg-brand-dark disabled:opacity-60"
                >
                  <span aria-hidden className="text-xl">✍️</span>
                  {isSubmitting ? t.register.submitting : t.register.submit}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// Embedded Stripe Payment Element. Lives inside <Elements>, so it can use the
// Stripe hooks; it exposes a `pay()` function (via payRef) that the form's submit
// calls to validate + charge the card — keeping card entry on our own page once.
function StripePaymentField({ payRef, onChange }: { payRef: PayRef; onChange: () => void }) {
  const stripe = useStripe();
  const elements = useElements();

  payRef.current = async ({ email }) => {
    if (!stripe || !elements) return { error: "not_ready" };
    const { error: submitErr } = await elements.submit();
    if (submitErr) return { error: submitErr.message };
    const res = await fetch("/api/payments/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: FEE_AGOROT, email }),
    });
    if (!res.ok) return { error: "payment_unavailable" };
    const { clientSecret } = await res.json();
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) return { error: error.message };
    return { paymentIntentId: paymentIntent?.id };
  };

  return <PaymentElement onChange={onChange} options={{ layout: "tabs" }} />;
}

const selectCls =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

function inputCls(invalid: boolean) {
  return cn(
    "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink outline-none transition",
    "focus:border-brand focus:ring-4 focus:ring-brand/10",
    invalid ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100" : "border-line",
  );
}

function FieldSet({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-line/70 p-4">
      <legend className="px-2 text-xs font-bold uppercase tracking-wider text-brand-dark">{legend}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  error,
  optional,
  className,
  children,
}: {
  label: string;
  error?: string | false;
  optional?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ms-1 text-xs font-normal text-muted">({optional})</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}
