import { useClient } from "wagmi";
import { chainId } from "../common";
import { Account, Chain, Client, GetContractReturnType, Transport, getContract } from "viem";
import { useQuery } from "@tanstack/react-query";
import { useSessionClient, useEntryKitConfig } from "@latticexyz/entrykit/internal";
import { observer } from "@latticexyz/explorer/observer";
import worldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

export function useWorldContract():
  | GetContractReturnType<
      typeof worldAbi,
      {
        public: Client<Transport, Chain>;
        wallet: Client<Transport, Chain, Account>;
      }
    >
  | undefined {
  const { worldAddress } = useEntryKitConfig();
  const client = useClient({ chainId });
  const { data: sessionClient } = useSessionClient();

  const { data: worldContract } = useQuery({
    queryKey: ["worldContract", worldAddress, client?.uid, sessionClient?.uid],
    queryFn: () => {
      if (!client || !sessionClient) {
        throw new Error("Not connected.");
      }

      return getContract({
        abi: worldAbi,
        address: worldAddress,
        client: {
          public: client,
          wallet: sessionClient.extend(observer()),
        },
      });
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return worldContract;
}
