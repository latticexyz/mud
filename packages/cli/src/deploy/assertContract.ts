import { Client, Transport, Chain, Account, getCreate2Address, Hex } from "viem";
import { getBytecode } from "viem/actions";
import { deployer } from "./ensureDeployer";
import { salt } from "./common";

export async function assertContract({
  client,
  bytecode,
  label = "contract",
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly bytecode: Hex;
  readonly label?: string;
}): Promise<void> {
  const address = getCreate2Address({ from: deployer, salt, bytecode });

  // Transactions calling contracts that are still pending will fail gas estimation, so we can't use `blockTag: pending` here.
  const contractCode = await getBytecode(client, { address });
  if (!contractCode) {
    throw new Error(`Missing ${label} bytecode at ${address}`);
  }
}
