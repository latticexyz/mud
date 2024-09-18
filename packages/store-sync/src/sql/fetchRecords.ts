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
  const query = JSON.stringify(queries.map((query) => ({ address: storeAddress, query: query.sql })));

  const response: Response = await fetch(indexerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: query,
  }).then((res) => res.json());

  if (isResponseFail(response)) {
    throw new Error(`Dozer response: ${response.msg}\n\nTry reproducing via cURL:
    curl ${indexerUrl} \\
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
}
