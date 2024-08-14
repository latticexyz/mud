import { getDatabase } from "../utils/getDatabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");

  if (!table) {
    return new Response(JSON.stringify({ error: "table is required" }), {
      status: 400,
    });
  }

  try {
    const db = getDatabase();
    const schema = db?.prepare("SELECT * FROM pragma_table_info(?)").all(table);

    return new Response(JSON.stringify({ schema }), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json({ error: "An unknown error occurred" }, { status: 400 });
    }
  }
}
