import { clearCoachSession } from "@/lib/coachAuth";

// POST — sign the current coach out.
export async function POST() {
  await clearCoachSession();
  return Response.json({ ok: true });
}
