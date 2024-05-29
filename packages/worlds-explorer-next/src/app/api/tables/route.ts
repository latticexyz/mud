import { getDatabase } from "../database";

const db = getDatabase();

export async function GET() {
  const tables = db?.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  return Response.json({ tables });
}
