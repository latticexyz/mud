// "use client";

import Database from "better-sqlite3";

export default async function Home() {
  const db = new Database("/Users/karolis/Code/Lattice.xyz/mud/templates/react-ecs/packages/explorer/indexer.db", {
    verbose: console.log,
  });

  const rows = db.prepare("SELECT * FROM tablename;").all();
  console.log(rows);

  const dirname = __dirname;
  const filename = __filename;
  const processCwd = process.cwd().split("node_modules")[0];
  const processExec = process.execPath;

  return (
    <main>
      <h1>{dirname}</h1>
      <h2>{filename}</h2>
      <h3>{processCwd}</h3>
      <h4>{processExec}</h4>
      <h4>Hello, world</h4>

      <h5>Rows: {rows.map((row) => row.value).join(", ")}</h5>
    </main>
  );
}
