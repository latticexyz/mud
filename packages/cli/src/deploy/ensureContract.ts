import { Client, Transport, Chain, Account, concatHex, getCreate2Address, Hex } from "viem";
import { getBytecode } from "viem/actions";
import { contractSizeLimit, salt } from "./common";
import { sendTransaction } from "@latticexyz/common";
import { debug } from "./debug";
import pRetry from "p-retry";

export type Contract = {
  bytecode: Hex;
  deployedBytecodeSize?: number;
  debugLabel?: string;
};

export async function ensureContract({
  client,
  deployerAddress,
  bytecode,
  deployedBytecodeSize,
  debugLabel = "contract",
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly deployerAddress: Hex;
} & Contract): Promise<readonly Hex[]> {
  if (bytecode.includes("__$")) {
    throw new Error(`Found unlinked public library in ${debugLabel} bytecode`);
  }

  const address = getCreate2Address({ from: deployerAddress, salt, bytecode });

  const contractCode = await getBytecode(client, { address, blockTag: "pending" });
  if (contractCode) {
    debug("found", debugLabel, "at", address);
    return [];
  }

  if (deployedBytecodeSize != null) {
    if (deployedBytecodeSize > contractSizeLimit) {
      console.warn(
        `\nBytecode for ${debugLabel} (${deployedBytecodeSize} bytes) is over the contract size limit (${contractSizeLimit} bytes). Run \`forge build --sizes\` for more info.\n`,
      );
    } else if (deployedBytecodeSize > contractSizeLimit * 0.95) {
      console.warn(
        // eslint-disable-next-line max-len
        `\nBytecode for ${debugLabel} (${deployedBytecodeSize} bytes) is almost over the contract size limit (${contractSizeLimit} bytes). Run \`forge build --sizes\` for more info.\n`,
      );
    }
  }

  debug("deploying", debugLabel, "at", address);
  return [
    await pRetry(
      () =>
        sendTransaction(client, {
          chain: client.chain ?? null,
          to: deployerAddress,
          data: concatHex([salt, bytecode]),
        }),
      {
        retries: 3,
        onFailedAttempt: () => debug(`failed to deploy ${debugLabel}, retrying...`),
      },
    ),
  ];
}
