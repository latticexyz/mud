import _ from "lodash";
import { getDatabase } from "../database";

export const dynamic = "force-dynamic";

type Row = {
  [key: string]: string;
};

type RowsResponse = Row[] | undefined;

function convertKeysToCamelCase(rows: RowsResponse): Row[] {
  if (rows == undefined) {
    return [];
  }

  return rows.map((row) => {
    return Object.keys(row).reduce((result: { [key: string]: string }, key) => {
      const camelKey = _.camelCase(key);
      result[camelKey] = row[key];
      return result;
    }, {});
  });
}

export async function GET(request: Request) {
  const db = getDatabase();
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const rows = db
    ?.prepare(`SELECT * FROM '${table}' LIMIT 30`)
    .all() as RowsResponse;

  return Response.json({ rows: convertKeysToCamelCase(rows) });
}
