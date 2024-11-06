import { Account, Chain, Client, Transport, getChainContractAddress } from "viem";
import { getAllowance } from "./getAllowance";
import { quarryPassIssuer } from "./transports/quarryPassIssuer";
import { minGasBalance } from "./common";
import { debug } from "./debug";

export async function claimGasPass({
  client,
  chain,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  chain: Chain;
}) {
  const paymasterAddress = getChainContractAddress({ chain, contract: "quarryPaymaster" });
  const userAddress = client.account.address;

  const allowance = await getAllowance({ client, paymasterAddress, userAddress });
  if (allowance >= minGasBalance) return;

  const transport = quarryPassIssuer()({ chain });
  // TODO: handle case where you already have a pass?
  debug("Issuing gas pass to", userAddress);
  await transport.request({
    method: "quarry_issuePass",
    params: ["0x01", userAddress],
  });

  debug("Claiming gas allowance for", userAddress);
  await transport.request({
    method: "quarry_claimAllowance",
    params: ["0x01", userAddress],
  });
}
