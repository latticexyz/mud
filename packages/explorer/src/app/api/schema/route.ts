import { getDatabase } from "../database";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = getDatabase();
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const schema = db?.prepare(`PRAGMA table_info('${table}')`).all();

  return Response.json({ schema });
}
