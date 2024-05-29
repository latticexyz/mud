import { db } from "../tables/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const rows = db.prepare(`SELECT * FROM ${table}`).all();

  return Response.json({ rows });
}
