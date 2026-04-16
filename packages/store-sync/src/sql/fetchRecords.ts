import { DecodeRecordsResult, QueryResult, decodeRecords } from "./decodeRecords";
import { Hex } from "viem";
import { TableQuery } from "./common";
import { Table } from "@latticexyz/config";

type ResponseSuccess = {
  block_height: string;
  result: QueryResult[];
};

type ResponseFail = { msg: string };

type Response = ResponseSuccess | ResponseFail;

function isResponseFail(response: Response): response is ResponseFail {
  return "msg" in response;
}

type FetchRecordsArgs = {
  indexerUrl: string;
  storeAddress: Hex;
  queries: TableQuery[];
};

type FetchRecordsResult = {
  blockHeight: bigint;
  result: {
    table: Table;
    records: DecodeRecordsResult;
  }[];
};

export async function fetchRecords({
  indexerUrl,
  queries,
  storeAddress,
}: FetchRecordsArgs): Promise<FetchRecordsResult> {
  const apiUrl = `${new URL(indexerUrl).origin}/q`;

  const query = JSON.stringify(
    queries.map((query) => ({
      address: storeAddress,
      query: query.sql,
      ...(query.toBlock ? { block_height: Number(query.toBlock), block_height_direction: "<=" } : {}),
    })),
  );

  try {
    const response: Response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: query,
    }).then((res) => res.json());

    if (isResponseFail(response)) {
      throw new Error(`Response: ${response.msg}\n\nTry reproducing via cURL:
    curl ${apiUrl} \\
    --compressed \\
    -H 'Accept-Encoding: gzip' \\
    -H 'Content-Type: application/json' \\
    -d '${query.replaceAll("'", "\\'")}'`);
    }

    const result: FetchRecordsResult = {
      blockHeight: BigInt(response.block_height),
      result: response.result.map((records, index) => ({
        table: queries[index].table,
        records: decodeRecords({ schema: queries[index].table.schema, records }),
      })),
    };

    return result;
  } catch (e) {
    console.error(`Error fetching records: ${e instanceof Error ? e.message : String(e)}\n\nTry reproducing via cURL:
    curl ${apiUrl} \\
    --compressed \\
    -H 'Accept-Encoding: gzip' \\
    -H 'Content-Type: application/json' \\
    -d '${query.replaceAll("'", "\\'")}'`);
    throw e;
  }
}
