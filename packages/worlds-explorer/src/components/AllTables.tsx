import { useEffect, useState } from "react";
import initSqlJs, { Database } from "sql.js";
import sqliteUrl from "../assets/sql-wasm.wasm?url";

function AllTables() {
  const [, setDb] = useState<Database | null>(null);
  const [, setError] = useState<string>("");

  useEffect(() => {
    async function initializeDatabase() {
      try {
        const SQL = await initSqlJs({
          locateFile: () => sqliteUrl,
        });
        const response = await fetch("indexer.db");

        const buffer = await response.arrayBuffer();
        const data = new Uint8Array(buffer);
        const db = new SQL.Database(data);
        setDb(db);

        const query = "PRAGMA table_list;";
        const results = db.exec(query);
        console.log(results);
      } catch (error) {
        console.log("error", error);

        if (error instanceof Error) {
          setError(`An error occurred: ${error.message}`);
        } else if (typeof error === "string") {
          setError(error);
        } else {
          setError("An unknown error occurred " + error);
        }
      }
    }

    initializeDatabase();
  }, []);

  return <div>all tables 123</div>;
}

export default AllTables;
