import { Client, Transport, Chain, Account, concatHex, getCreate2Address, Hex } from "viem";
import { getCode } from "viem/actions";
import { contractSizeLimit, singletonSalt } from "./common";
import { debug } from "./debug";
import { sendTransaction } from "../sendTransaction";

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

  const address = getCreate2Address({ from: deployerAddress, salt: singletonSalt, bytecode });

  const contractCode = await getCode(client, { address, blockTag: "pending" });
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
    await sendTransaction(client, {
      chain: client.chain ?? null,
      to: deployerAddress,
      data: concatHex([singletonSalt, bytecode]),
    }),
  ];
}
