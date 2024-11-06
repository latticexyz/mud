import { Account, Chain, Client, Transport, parseEther } from "viem";
import { rhodolite } from "@latticexyz/common/chains";
import { getAction } from "viem/utils";
import { getChainId, setBalance } from "viem/actions";
import { claimGasPass } from "@latticexyz/quarry/internal";
import { anvil } from "viem/chains";
import { debug } from "./debug";

// CLI only takes in an RPC URL, not a chain config, so we can't do our usual chain config checks (`quarryPaymaster` contract, etc.)
// So for now we'll just check if the chain ID is for Rhodolite.

export async function fundAccount({ client }: { client: Client<Transport, Chain | undefined, Account> }) {
  const chainId = client.chain?.id || (await getAction(client, getChainId, "getChainId")({}));
  if (chainId === rhodolite.id) {
    await claimGasPass({ client, chain: rhodolite });
  } else if (chainId === anvil.id) {
    debug("Setting anvil balance");
    await setBalance(
      client.extend(() => ({ mode: "anvil" })),
      {
        address: client.account.address,
        value: parseEther("100"),
      },
    );
  }
}
