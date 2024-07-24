import { DecodeDozerRecordsResult, DozerQueryResult, decodeDozerRecords } from "@latticexyz/protocol-parser/internal";
import { Hex } from "viem";
import { TableQuery } from "./common";

type DozerResponseSuccess = {
  block_height: string;
  result: DozerQueryResult[];
};

type DozerResponseFail = { msg: "schemas not found" };

type DozerResponse = DozerResponseSuccess | DozerResponseFail;

type FetchDozerSqlArgs = {
  url: string;
  worldAddress: Hex;
  queries: TableQuery[];
};

type FetchDozerSqlResult =
  | {
      blockHeight: bigint;
      result: DecodeDozerRecordsResult[];
    }
  | undefined;

function isDozerResponseFail(response: DozerResponse): response is DozerResponseFail {
  return "msg" in response;
}

export async function fetchRecordsDozerSql({
  url,
  queries,
  worldAddress,
}: FetchDozerSqlArgs): Promise<FetchDozerSqlResult> {
  console.log("queries", queries);
  const response: DozerResponse = await (
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queries.map((query) => ({ address: worldAddress, query: query.sql }))),
    })
  ).json();

  if (isDozerResponseFail(response)) {
    console.warn(`Dozer response: ${response.msg}`);
    return;
  }

  const result: FetchDozerSqlResult = {
    blockHeight: BigInt(response.block_height),
    result: response.result.map((records, index) =>
      decodeDozerRecords({ schema: queries[index].table.schema, records }),
    ),
  };

  return result;
}
