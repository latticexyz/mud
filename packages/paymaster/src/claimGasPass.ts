import { Address, Chain } from "viem";
import { quarryPassIssuer } from "./transports/quarryPassIssuer";
import { debug } from "./debug";

export async function claimGasPass({ chain, userAddress }: { chain: Chain; userAddress: Address }) {
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
