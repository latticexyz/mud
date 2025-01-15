import { useClient } from "wagmi";
import { chainId, worldAddress } from "../common";
import { Account, Chain, Client, GetContractReturnType, Transport, getContract } from "viem";
import { useQuery } from "@tanstack/react-query";
import { useSessionClient } from "@latticexyz/entrykit/internal";
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
  const client = useClient({ chainId });
  const { data: sessionClient } = useSessionClient();

  const { data: worldContract } = useQuery({
    queryKey: ["worldContract", client?.uid, worldAddress, sessionClient?.uid],
    queryFn: () => {
      if (!client || !sessionClient) {
        throw new Error("Not connected.");
      }
      if (!worldAddress) {
        throw new Error("World not ready.");
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
