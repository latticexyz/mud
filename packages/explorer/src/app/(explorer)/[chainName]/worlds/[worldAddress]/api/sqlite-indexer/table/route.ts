import { camelCase } from "../../../../../../../../lib/utils";
import { fetchSqliteTable } from "../../utils/fetchSqlite";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return Response.json({ error: "query is required" }, { status: 400 });
  }

  try {
    const data = await fetchSqliteTable(query);
    const formattedData = data?.map((row: object) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          if (Buffer.isBuffer(value)) {
            return [camelCase(key), value.toString()];
          }
          return [camelCase(key), value];
        }),
      );
    });

    return Response.json({ data: formattedData });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}
