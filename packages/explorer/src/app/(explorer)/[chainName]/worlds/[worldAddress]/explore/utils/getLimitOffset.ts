import { Parser } from "node-sql-parser";

const sqlParser = new Parser();
const opt = {
  database: "Postgresql",
};

export function getLimitOffset(query: string) {
  try {
    const decodedQuery = decodeURIComponent(query);
    let ast = sqlParser.astify(decodedQuery, opt);
    if (Array.isArray(ast) && ast.length > 0) {
      const astFirst = ast[0];
      if (astFirst) {
        ast = astFirst;
      }
    }

    let limit = null;
    let offset = null;

    if ("limit" in ast) {
      // If limit has a separator "offset", it contains both limit and offset values. Otherwise, only limit is set.
      if (ast.limit?.seperator === "offset") {
        limit = ast.limit?.value?.[0]?.value;
        offset = ast.limit?.value?.[1]?.value;
      } else {
        limit = ast.limit?.value?.[0]?.value;
      }
    }

    return { limit, offset };
  } catch (error) {
    console.error("Error parsing query:", error);
    return { limit: null, offset: null };
  }
}
