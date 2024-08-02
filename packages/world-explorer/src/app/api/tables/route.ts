import { getDatabase } from "../database";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDatabase();
  const tables = db
    ?.prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();

  return Response.json({ tables });
}
