import { getDatabase } from "../getDatabase";

export const dynamic = "force-dynamic";

export type TableRow = {
  name: string;
};

export async function GET() {
  try {
    const db = getDatabase();
    const tables = db?.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as TableRow[];

    return Response.json({ tables });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json({ error: "An unknown error occurred" }, { status: 400 });
    }
  }
}
