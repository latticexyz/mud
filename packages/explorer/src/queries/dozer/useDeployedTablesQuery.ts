import { useParams } from "next/navigation";
import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";
import { decodeTable } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
import { useDozerUrl } from "../../hooks/useDozerUrl";

export type DozerResponse = {
  block_height: number;
  result: [Hex[][]];
};

export function useDeployedTablesQuery() {
  const { worldAddress, chainName } = useParams();
  const dozerUrl = useDozerUrl();

  return useQuery({
    queryKey: ["deployedTables", worldAddress, chainName],
    queryFn: async () => {
      const response = await fetch(dozerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            address: worldAddress,
            query: `select ${[
              "tableId",
              "fieldLayout",
              "keySchema",
              "valueSchema",
              "abiEncodedKeyNames",
              "abiEncodedFieldNames",
            ].join(", ")} from store__Tables`,
          },
        ]),
      });
      return response.json();
    },
    select: (data: DozerResponse) => {
      return data.result[0].slice(1).map((row) => {
        return decodeTable(row);
      });
    },
  });
}
