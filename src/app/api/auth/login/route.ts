import { NextRequest, NextResponse } from "next/server";
import { describeDbError, verifyCredentials } from "@/lib/users";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days, matches session.ts

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body was not valid JSON." },
      { status: 400 }
    );
  }

  const username = body.username?.trim();
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 }
    );
  }

  try {
    const user = await verifyCredentials(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (err) {
    console.error(err);
    const { status, message } = describeDbError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
