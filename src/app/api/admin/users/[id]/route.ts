import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  countAdmins,
  deleteUser,
  describeDbError,
  getUserById,
  setUserPassword,
} from "@/lib/users";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body was not valid JSON." },
      { status: 400 }
    );
  }

  if (!body.password) {
    return NextResponse.json(
      { error: "New password is required." },
      { status: 400 }
    );
  }

  try {
    const result = await setUserPassword(id, body.password);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ user: result });
  } catch (err) {
    console.error(err);
    const { status, message } = describeDbError(err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (session?.sub === id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  try {
    const target = await getUserById(id);
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (target.role === "admin" && (await countAdmins()) <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last remaining admin." },
        { status: 400 }
      );
    }

    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    const { status, message } = describeDbError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
