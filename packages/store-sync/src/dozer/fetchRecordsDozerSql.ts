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
  url: string;
  address: Hex;
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

export async function fetchRecordsDozerSql({ url, queries, address }: FetchDozerSqlArgs): Promise<FetchDozerSqlResult> {
  const response: DozerResponse = await (
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queries.map((query) => ({ address, query: query.sql }))),
    })
  ).json();

  if (isDozerResponseFail(response)) {
    console.warn(`Dozer response: ${response.msg}\n\nTry reproducing via cURL:
    curl ${url} \\
    --compressed \\
    -H 'Accept-Encoding: gzip' \\
    -H 'Content-Type: application/json' \\
    -d '[${queries.map((query) => `{"address": "${address}", "query": "${query.sql.replaceAll('"', '\\"')}"}`).join(",")}]'`);
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
