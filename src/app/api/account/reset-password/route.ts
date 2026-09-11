import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import {
  describeDbError,
  getUserByUsername,
  setUserPassword,
} from "@/lib/users";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body was not valid JSON." },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current and new password are required." },
      { status: 400 }
    );
  }

  try {
    const user = await getUserByUsername(session.username);
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const result = await setUserPassword(session.sub, newPassword);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    const { status, message } = describeDbError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
