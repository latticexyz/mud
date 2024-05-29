import Database from "better-sqlite3";

const db = new Database("/Users/karolis/Code/Lattice.xyz/mud/templates/react-ecs/packages/explorer/indexer.db");

export async function GET() {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  return Response.json(tables);
}
