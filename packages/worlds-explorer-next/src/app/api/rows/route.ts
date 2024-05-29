import { db } from "../db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const rows = db.prepare(query || "").all();

  return Response.json({ rows });
}
