// Public app config — safe to import on the client and the server.

/**
 * DocuSign PowerForm URL where a new member completes & signs the registration
 * form. Override per deployment with NEXT_PUBLIC_DOCUSIGN_URL. A PowerForm is a
 * self-service signing link, so no DocuSign API credentials are needed — paste
 * the real PowerForm URL into the env var when ready.
 */
export const DOCUSIGN_URL =
  process.env.NEXT_PUBLIC_DOCUSIGN_URL ??
  "https://demo.docusign.net/Member/PowerFormSigning.aspx";

/**
 * DocuSign PowerForm URL with the signer's details appended so the form can
 * pre-fill them. PowerForms read recipient fields from query params shaped like
 * `<RecipientName>_UserName` / `<RecipientName>_Email`; we send both those and
 * generic name/email params so the link works regardless of how the PowerForm
 * is configured. The signer role defaults to "Member" (override with
 * NEXT_PUBLIC_DOCUSIGN_ROLE).
 */
export function docusignUrl(prefill?: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}): string {
  if (!prefill) return DOCUSIGN_URL;
  const role = process.env.NEXT_PUBLIC_DOCUSIGN_ROLE ?? "Member";
  const name = `${prefill.firstName ?? ""} ${prefill.lastName ?? ""}`.trim();
  const p = new URLSearchParams();
  if (name) {
    p.set("name", name);
    p.set(`${role}_UserName`, name);
  }
  if (prefill.email) {
    p.set("email", prefill.email);
    p.set(`${role}_Email`, prefill.email);
  }
  if (prefill.phone) p.set("phone", prefill.phone);
  const q = p.toString();
  if (!q) return DOCUSIGN_URL;
  return DOCUSIGN_URL.includes("?") ? `${DOCUSIGN_URL}&${q}` : `${DOCUSIGN_URL}?${q}`;
}
