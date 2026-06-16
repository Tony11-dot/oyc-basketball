import { findCoachByIdNumber, setCoachSession } from "@/lib/coachAuth";

// POST — sign a coach in with their ID number.
export async function POST(request: Request) {
  let body: { idNumber?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const coach = await findCoachByIdNumber(String(body.idNumber ?? ""));
  if (!coach) {
    return Response.json({ error: "Unknown coach" }, { status: 401 });
  }

  await setCoachSession(coach.id);
  return Response.json({ ok: true, coach: { id: coach.id, name: coach.name } });
}
