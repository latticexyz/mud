import { useClient } from "wagmi";
import { Hex, parseEther } from "viem";
import { getBalance, setBalance } from "viem/actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type AutoTopUpParameters = {
  address: Hex | null | undefined;
  minBalance?: bigint;
};

export function useAutoTopUp({ address, minBalance = parseEther("10000") }: AutoTopUpParameters) {
  const queryClient = useQueryClient();
  const client = useClient();
  useQuery({
    queryKey: ["autoTopUp", address, client?.uid],
    refetchInterval: 30_000,
    async queryFn() {
      if (!address) return null;
      if (!client) return null;
      if (client.chain.id !== 31337) return null;

      const balance = await getBalance(client, { address });
      if (balance < minBalance) {
        console.log("topping up", address);
        await setBalance({ ...client, mode: "anvil" }, { address, value: minBalance });
        queryClient.invalidateQueries({ queryKey: ["balance"] });
      }

      return null;
    },
  });
}
