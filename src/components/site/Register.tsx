"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import { docusignUrl } from "@/lib/config";
import { SectionBg } from "./SectionBg";
import { cn } from "@/lib/cn";

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
}

export function Register({ bg }: { bg?: string }) {
  const { t } = useI18n();
  const toast = useToast();
  const [done, setDone] = useState(false);
  // The prefilled DocuSign link shown on the success screen (popup fallback).
  const [signUrl, setSignUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { firstName: "", lastName: "", phone: "", email: "", notes: "" },
  });

  function registerAnother() {
    setDone(false);
    setSignUrl(null);
    reset();
  }

  const onSubmit = handleSubmit(async (values) => {
    // Open the DocuSign PowerForm (prefilled) in the user gesture, then record
    // the registration.
    const url = docusignUrl(values);
    setSignUrl(url);
    const win = window.open(url, "_blank", "noopener,noreferrer");
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("request failed");
      void win;
      setDone(true);
    } catch {
      toast.error(t.register.errors.generic);
    }
  });

  const errId = (name: keyof FormValues) => (errors[name] ? `${name}-error` : undefined);

  return (
    <section id="register" className={`relative scroll-mt-20 overflow-hidden bg-surface py-20 md:py-28 ${bg ? "flex min-h-screen flex-col justify-center" : ""}`}>
      <SectionBg url={bg} />
      <div className="container-x grid items-stretch gap-10 lg:grid-cols-[1fr_1.1fr]">
        {/* Left: invitation panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl brand-gradient-animated p-8 text-white md:p-10"
        >
          <span className="inline-block rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            {t.register.eyebrow}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight md:text-4xl">{t.register.heading}</h2>
          <p className="mt-4 max-w-md text-white/85">{t.register.subheading}</p>
          <ul className="mt-8 space-y-3 text-sm">
            {t.register.perks.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-white/20 text-xs">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="pointer-events-none absolute -bottom-16 -end-16 size-56 rounded-full bg-white/10 blur-2xl" />
        </motion.div>

        {/* Right: form / success */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
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
                className="flex h-full flex-col items-center justify-center py-10 text-center"
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

                <a
                  href={signUrl ?? docusignUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex h-16 w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-brand px-8 text-xl font-extrabold text-white shadow-[0_12px_34px_rgba(18,48,110,0.32)] transition hover:-translate-y-0.5 hover:bg-brand-dark"
                >
                  <span aria-hidden className="text-2xl">✍️</span>
                  {t.register.signCta}
                </a>
                <p className="mt-3 max-w-xs text-sm text-muted">{t.register.signHelp}</p>

                <button
                  type="button"
                  onClick={registerAnother}
                  className="mt-6 text-base font-semibold text-brand-dark underline-offset-2 hover:underline"
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
                className="grid gap-4 sm:grid-cols-2"
              >
                <Field label={t.register.firstName} error={errors.firstName && t.register.errors.required} errId={errId("firstName")}>
                  <input
                    {...register("firstName", { required: true })}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errId("firstName")}
                    className={inputCls(!!errors.firstName)}
                  />
                </Field>

                <Field label={t.register.lastName} error={errors.lastName && t.register.errors.required} errId={errId("lastName")}>
                  <input
                    {...register("lastName", { required: true })}
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errId("lastName")}
                    className={inputCls(!!errors.lastName)}
                  />
                </Field>

                <Field
                  label={t.register.phone}
                  error={errors.phone && (errors.phone.type === "required" ? t.register.errors.required : t.register.errors.phone)}
                  errId={errId("phone")}
                >
                  <input
                    type="tel"
                    dir="ltr"
                    {...register("phone", { required: true, validate: (v) => isValidPhone(v) })}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errId("phone")}
                    className={inputCls(!!errors.phone)}
                  />
                </Field>

                <Field
                  label={t.register.email}
                  error={errors.email && (errors.email.type === "required" ? t.register.errors.required : t.register.errors.email)}
                  errId={errId("email")}
                >
                  <input
                    type="email"
                    dir="ltr"
                    {...register("email", { required: true, validate: (v) => isValidEmail(v) })}
                    aria-invalid={!!errors.email}
                    aria-describedby={errId("email")}
                    className={inputCls(!!errors.email)}
                  />
                </Field>

                <Field className="sm:col-span-2" label={t.register.notesOptional}>
                  <textarea
                    rows={3}
                    {...register("notes")}
                    className={cn(
                      "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition",
                      "resize-none focus:border-brand focus:ring-4 focus:ring-brand/10",
                    )}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-lg font-bold text-white shadow-[0_10px_28px_rgba(18,48,110,0.28)] transition hover:bg-brand-dark disabled:opacity-60 sm:col-span-2"
                >
                  <span aria-hidden className="text-xl">✍️</span>
                  {isSubmitting ? t.register.submitting : t.register.submit}
                </button>
                <p className="-mt-1 text-center text-sm text-muted sm:col-span-2">{t.register.signHelp}</p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function inputCls(invalid: boolean) {
  return cn(
    "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink outline-none transition",
    "focus:border-brand focus:ring-4 focus:ring-brand/10",
    invalid ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100" : "border-line",
  );
}

function Field({
  label,
  error,
  errId,
  className,
  children,
}: {
  label: string;
  error?: string | false;
  errId?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {error && (
        <span id={errId} className="mt-1 block text-xs font-medium text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}
