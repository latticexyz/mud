import { getDatabase } from "../database";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = getDatabase();
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const schema = db?.prepare("SELECT * FROM pragma_table_info(?)").all(table);

  return Response.json({ schema });
}
