import { Client, Transport, Chain, Account, concatHex, getCreate2Address, Hex } from "viem";
import { getBytecode } from "viem/actions";
import { deployer } from "./ensureDeployer";
import { salt } from "./common";
import { sendTransaction } from "@latticexyz/common";
import { debug } from "./debug";
import pRetry from "p-retry";
import { wait } from "@latticexyz/common/utils";

export type Contract = {
  bytecode: Hex;
  label?: string;
};

export async function ensureContract({
  client,
  bytecode,
  label = "contract",
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
} & Contract): Promise<readonly Hex[]> {
  const address = getCreate2Address({ from: deployer, salt, bytecode });

  const contractCode = await getBytecode(client, { address, blockTag: "pending" });
  if (contractCode) {
    debug("found", label, "at", address);
    return [];
  }

  debug("deploying", label, "at", address);
  return [
    await pRetry(
      () =>
        sendTransaction(client, {
          chain: client.chain ?? null,
          to: deployer,
          data: concatHex([salt, bytecode]),
        }),
      {
        retries: 3,
        onFailedAttempt: async (error) => {
          const delay = error.attemptNumber * 500;
          debug(`failed to deploy ${label}, retrying in ${delay}ms...`);
          await wait(delay);
        },
      }
    ),
  ];
}
