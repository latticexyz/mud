import { db } from "../db";

export async function GET() {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  return Response.json({ tables });
}
