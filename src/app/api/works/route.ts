import { NextRequest, NextResponse } from "next/server";
import {
  createWork,
  describeDbError,
  listWorks,
  searchWorks,
} from "@/lib/workOrders";
import { validateWorkOrderInput } from "@/lib/types";
import type { WorkOrderInput } from "@/lib/types";

function dbErrorResponse(err: unknown) {
  console.error(err);
  const { status, message } = describeDbError(err);
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  try {
    const works = q ? await searchWorks(q) : await listWorks();
    return NextResponse.json({ works });
  } catch (err) {
    return dbErrorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  let body: WorkOrderInput;
  try {
    body = (await request.json()) as WorkOrderInput;
  } catch {
    return NextResponse.json(
      { error: "Request body was not valid JSON." },
      { status: 400 }
    );
  }

  const validationError = validateWorkOrderInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const work = await createWork(body);
    return NextResponse.json({ work }, { status: 201 });
  } catch (err) {
    return dbErrorResponse(err);
  }
}
