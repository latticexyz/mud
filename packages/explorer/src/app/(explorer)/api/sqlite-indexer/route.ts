import { getDatabase } from "../utils/getDatabase";

type Row = {
  [key: string]: string;
};

type SqliteTable = Row[] | undefined;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const queries = await request.json();
  if (!queries.length) {
    return Response.json({ error: "No queries provided" }, { status: 400 });
  }

  try {
    const db = getDatabase();
    const result = [];
    for (const { query } of queries) {
      const data = (await db?.prepare(query).all()) as SqliteTable;

      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid query result");
      }

      if (data.length === 0) {
        return Response.json({ result: [] });
      }

      if (!data[0]) {
        throw new Error("Invalid row data");
      }

      const columns = Object.keys(data[0]).map((key) => key.replaceAll("_", "").toLowerCase());
      const rows = data.map((row) => Object.values(row).map((value) => value?.toString() ?? ""));
      result.push([columns, ...rows]);
    }

    return Response.json({ result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
