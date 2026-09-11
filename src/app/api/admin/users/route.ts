import { NextRequest, NextResponse } from "next/server";
import { USER_ROLES } from "@/lib/types";
import { createUser, describeDbError, listUsers } from "@/lib/users";

export async function GET() {
  try {
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (err) {
    console.error(err);
    const { status, message } = describeDbError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body was not valid JSON." },
      { status: 400 }
    );
  }

  const { username, password, role } = body;
  if (!username || !password || !role) {
    return NextResponse.json(
      { error: "Username, password and role are required." },
      { status: 400 }
    );
  }
  if (!USER_ROLES.includes(role as (typeof USER_ROLES)[number])) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  try {
    const result = await createUser({
      username,
      password,
      role: role as (typeof USER_ROLES)[number],
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ user: result }, { status: 201 });
  } catch (err) {
    console.error(err);
    const { status, message } = describeDbError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
