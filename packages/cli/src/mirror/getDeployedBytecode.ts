import { Address, Client, isAddress, isHex, keccak256, withCache } from "viem";
import { getProof } from "viem/actions";
import { execa } from "execa";
import { DeployedBytecode } from "./common";
import { getWorldConsumerStorageHash } from "./getWorldConsumerStorageHash";
import chalk from "chalk";

const emptyStorageHash = "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421";

export async function getDeployedBytecode({
  client,
  address,
  debugLabel,
  allowedStorage,
  blockscoutUrl,
}: {
  client: Client;
  address: Address;
  debugLabel: string;
  allowedStorage: ("empty" | { worldConsumer: Address })[];
  blockscoutUrl: string;
}) {
  const initCode = await withCache(
    () =>
      fetch(`${blockscoutUrl}/api/v2/smart-contracts/${address.toLowerCase()}`)
        .then((res) => res.json())
        .then((data) => data.creation_bytecode),
    {
      cacheKey: `${blockscoutUrl}/api/v2/smart-contracts/${address.toLowerCase()}`,
    },
  );
  if (!isHex(initCode)) return;

  async function getStorageHash() {
    const { storageHash } = await withCache(() => getProof(client, { address, storageKeys: [] }), {
      cacheKey: `getProof:${client.uid}:${address.toLowerCase()}`,
    });
    return storageHash;
  }

  const isAllowed = await (async (): Promise<boolean> => {
    for (const mode of allowedStorage) {
      if (mode === "empty") {
        const storageHash = await getStorageHash();
        if (storageHash === emptyStorageHash) {
          return true;
        }
      } else if ("worldConsumer" in mode) {
        const storageHash = await getStorageHash();
        if (storageHash === getWorldConsumerStorageHash(mode.worldConsumer)) {
          return true;
        }
      }
    }
    return false;
  })();

  if (!isAllowed) {
    console.warn(
      // eslint-disable-next-line max-len
      `${chalk.bgYellowBright(chalk.black(" Warning! "))} ${debugLabel} (${address}) is expected to be stateless, but has unexpected storage. It'll be deployed using its original constructor arguments, but may be missing some of its internal state.`,
    );
  }

  const { stdout } = await withCache(() => execa({ input: initCode })`cast disassemble`, {
    cacheKey: `cast disassemble:${keccak256(initCode)}`,
  });

  const matches = stdout.matchAll(/([0-9a-f]+): PUSH20 (0x[0-9a-f]{40})/g);
  const libraries: DeployedBytecode["libraries"] = [];

  for (const match of matches) {
    // address bytecode offset after opcode
    const offset = parseInt(match[1], 16) + 1;
    const value = match[2];
    if (!isAddress(value, { strict: false })) {
      throw new Error(`Found PUSH20 with invalid address: ${value}`);
    }
    // check if PUSH20 is followed by a DELEGATECALL within a reasonable number of opcodes
    // otherwise it's probably not a public library
    if (!new RegExp(`PUSH20 ${value}\n([^\n]+\n){0,24}[0-9a-f]+: DELEGATECALL`).test(stdout)) {
      continue;
    }

    const reference = await getDeployedBytecode({
      client,
      address: value,
      debugLabel: `address at bytecode offset ${offset}`,
      allowedStorage: ["empty"],
      blockscoutUrl,
    });
    if (!reference) continue;

    libraries.push({ offset, reference });
  }

  return {
    address,
    initCode,
    libraries,
  } satisfies DeployedBytecode;
}
