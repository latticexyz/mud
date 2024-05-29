import { db } from "../tables/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const schema = db.prepare(`PRAGMA table_info('${table}')`).all();

  return Response.json({ schema });
}
