import { randomUUID } from "crypto";
import { getRegistrations, updateRegistrations } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { validateRegistration } from "@/lib/validation";
import { sendRegistrationEmails } from "@/lib/mail";
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

// POST — submit a registration (public). The site then opens the DocuSign form.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = validateRegistration(body);
  if (!result.ok) return Response.json({ error: result.error }, { status: 422 });

  const registration: Registration = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...result.value,
    status: "new",
  };

  await updateRegistrations((list) => [registration, ...list]);

  // Send confirmation + club notification. sendRegistrationEmails never throws,
  // so a mail failure can't break the registration; we still await it so the
  // serverless function stays alive until the SMTP exchange completes.
  await sendRegistrationEmails(registration);

  return Response.json({ registration }, { status: 201 });
}
