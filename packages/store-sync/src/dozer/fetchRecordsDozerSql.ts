import { DecodeDozerRecordsResult, DozerQueryResult, decodeDozerRecords } from "@latticexyz/protocol-parser/internal";
import { Hex } from "viem";
import { DozerTableQuery } from "./common";
import { Table } from "@latticexyz/config";

type DozerResponseSuccess = {
  block_height: string;
  result: DozerQueryResult[];
};

type DozerResponseFail = { msg: string };

type DozerResponse = DozerResponseSuccess | DozerResponseFail;

type FetchDozerSqlArgs = {
  dozerUrl: string;
  storeAddress: Hex;
  queries: DozerTableQuery[];
};

type FetchDozerSqlResult =
  | {
      blockHeight: bigint;
      result: {
        table: Table;
        records: DecodeDozerRecordsResult;
      }[];
    }
  | undefined;

function isDozerResponseFail(response: DozerResponse): response is DozerResponseFail {
  return "msg" in response;
}

export async function fetchRecordsDozerSql({
  dozerUrl,
  queries,
  storeAddress,
}: FetchDozerSqlArgs): Promise<FetchDozerSqlResult> {
  const response: DozerResponse = await (
    await fetch(dozerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queries.map((query) => ({ address: storeAddress, query: query.sql }))),
    })
  ).json();

  if (isDozerResponseFail(response)) {
    console.warn(`Dozer response: ${response.msg}\n\nTry reproducing via cURL:
    curl ${dozerUrl} \\
    --compressed \\
    -H 'Accept-Encoding: gzip' \\
    -H 'Content-Type: application/json' \\
    -d '[${queries.map((query) => `{"address": "${storeAddress}", "query": "${query.sql.replaceAll('"', '\\"')}"}`).join(",")}]'`);
    return;
  }

  const result: FetchDozerSqlResult = {
    blockHeight: BigInt(response.block_height),
    result: response.result.map((records, index) => ({
      table: queries[index].table,
      records: decodeDozerRecords({ schema: queries[index].table.schema, records }),
    })),
  };

  return result;
}
