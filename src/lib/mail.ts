import nodemailer from "nodemailer";
import type { Registration } from "./types";

// Email sending via SMTP (Outlook/Hotmail by default). Configured entirely by
// env vars so no secrets live in the repo:
//
//   SMTP_HOST   default smtp-mail.outlook.com  (Hotmail/Outlook consumer)
//   SMTP_PORT   default 587 (STARTTLS)
//   SMTP_USER   the mailbox we authenticate + send as (said_abu_a@hotmail.com)
//   SMTP_PASS   an *app password* for that mailbox (required to actually send)
//   MAIL_FROM   display From, default `OYC Nazareth <SMTP_USER>`
//   MAIL_TO     where club notifications go, default SMTP_USER
//
// If SMTP_PASS is missing we no-op (log a warning) so local dev and the
// registration flow keep working without credentials.

const HOST = process.env.SMTP_HOST || "smtp-mail.outlook.com";
const PORT = Number(process.env.SMTP_PORT || 587);
const USER = process.env.SMTP_USER || "said_abu_a@hotmail.com";
const PASS = process.env.SMTP_PASS;
const FROM = process.env.MAIL_FROM || `OYC Nazareth <${USER}>`;
const ADMIN_TO = process.env.MAIL_TO || USER;

export const mailEnabled = () => Boolean(PASS);

let cached: nodemailer.Transporter | null = null;
function transporter() {
  if (!cached) {
    cached = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465, // 465 = implicit TLS; 587 = STARTTLS
      requireTLS: PORT === 587,
      auth: { user: USER, pass: PASS },
    });
  }
  return cached;
}

const esc = (s: string) =>
  s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));

const shell = (title: string, inner: string) => `
  <div style="margin:0;background:#f5f8fd;padding:24px;font-family:Segoe UI,Arial,sans-serif">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e4ebf3">
      <tr><td style="background:linear-gradient(135deg,#0c2150,#12306e);padding:22px 28px">
        <span style="color:#fff;font-size:18px;font-weight:800">OYC Nazareth</span>
        <span style="color:#ec6b73;font-size:13px;font-weight:700;display:block;margin-top:2px">Orthodox Basketball Club</span>
      </td></tr>
      <tr><td style="padding:28px">
        <h2 style="margin:0 0 14px;color:#101828;font-size:20px">${title}</h2>
        ${inner}
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid #e4ebf3;color:#5a6b82;font-size:12px">
        © ${new Date().getFullYear()} OYC Nazareth. All rights reserved.
      </td></tr>
    </table>
  </div>`;

const row = (label: string, value: string) =>
  `<tr><td style="padding:6px 0;color:#5a6b82;font-size:13px;width:120px">${label}</td>
       <td style="padding:6px 0;color:#101828;font-size:14px;font-weight:600">${esc(value)}</td></tr>`;

/**
 * Fire both emails for a new registration: a confirmation to the registrant and
 * a notification to the club inbox. Never throws — failures are logged so a mail
 * problem can't break the registration itself.
 */
export async function sendRegistrationEmails(reg: Registration): Promise<void> {
  if (!mailEnabled()) {
    console.warn("[mail] SMTP_PASS not set — skipping registration emails");
    return;
  }
  const name = `${reg.firstName} ${reg.lastName}`.trim();
  const t = transporter();

  const details = `<table role="presentation" style="width:100%;border-collapse:collapse">
      ${row("Name", name)}${row("Phone", reg.phone)}${row("Email", reg.email)}
      ${reg.notes ? row("Notes", reg.notes) : ""}
    </table>`;

  const confirmation = t.sendMail({
    from: FROM,
    to: reg.email,
    subject: "We received your registration — OYC Nazareth",
    text: `Hi ${name},\n\nThank you for registering with OYC Nazareth Orthodox Basketball Club. We received your details and a club member will be in touch soon.\n\n— OYC Nazareth`,
    html: shell(
      `Thank you, ${esc(reg.firstName)}! 🏀`,
      `<p style="color:#5a6b82;font-size:14px;line-height:1.6">
         Thank you for registering with <b>OYC Nazareth Orthodox Basketball Club</b>.
         We received your details and a club member will be in touch soon.
       </p>${details}`,
    ),
  });

  const notify = t.sendMail({
    from: FROM,
    to: ADMIN_TO,
    replyTo: reg.email,
    subject: `New registration: ${name}`,
    text: `New registration\n\nName: ${name}\nPhone: ${reg.phone}\nEmail: ${reg.email}${reg.notes ? `\nNotes: ${reg.notes}` : ""}`,
    html: shell("New registration received", details),
  });

  const results = await Promise.allSettled([confirmation, notify]);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[mail] ${i === 0 ? "confirmation" : "notification"} failed:`, r.reason);
    }
  });
}
