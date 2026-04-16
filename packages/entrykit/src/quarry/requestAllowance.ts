import { Address, Chain } from "viem";
import { quarrySponsor } from "./transports/quarrySponsor";
import { debug } from "./debug";

export async function requestAllowance({ chain, userAddress }: { chain: Chain; userAddress: Address }) {
  const transport = quarrySponsor()({ chain });

  debug("Requesting allowance for", userAddress);
  await transport.request({
    method: "sponsor_requestAllowance",
    params: [userAddress],
  });
}
