import { Hex } from "viem";
import { fetchRecords, selectFrom } from "@latticexyz/store-sync/internal";
import mudConfig from "@latticexyz/store/mud.config";
import { decodeTable } from "../../../(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
import { getDatabase } from "../sqlite-indexer/getDatabase";

export const dynamic = "force-dynamic";

type Row = {
  [key: string]: string;
};

type Table = Row[] | undefined;

// function doesTableExist(tableId: string) {
//   const db = getDatabase();
//   const result = db?.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableId);
//   return Boolean(result);
// }

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get("tableId");
  const worldAddress = "0x9ca094a38027bb331656e4f1f6ed40c9982dbe70"; // TODO: get from params
  const dozerUrl = "https://dozer.mud.garnetchain.com/q";

  let records = await fetchRecords({
    indexerUrl: dozerUrl,
    storeAddress: worldAddress as Hex,
    queries: [
      selectFrom({
        table: mudConfig.tables.store__Tables, // TODO: get table from params
      }),
    ],
  });

  records = records.result[0].records.map((record) => decodeTable(record));

  return Response.json({ data: records });

  // try {
  //   if (!tableId || !doesTableExist(tableId)) {
  //     return Response.json({ error: "Table does not exist" }, { status: 400 });
  //   }

  //   const db = getDatabase();
  //   const query = `SELECT * FROM "${tableId}" LIMIT 100`;
  //   const table = db?.prepare(query).all() as Table;

  //   return Response.json({ table });
  // } catch (error: unknown) {
  //   if (error instanceof Error) {
  //     return Response.json({ error: error.message }, { status: 400 });
  //   } else {
  //     return Response.json({ error: "An unknown error occurred" }, { status: 400 });
  //   }
  // }
}
