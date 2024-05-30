import { getDatabase } from "../database";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = getDatabase();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const rows = db?.prepare(query || "").all();

  return Response.json({ rows });
}
