import { Address, Client, isAddress, keccak256, withCache } from "viem";
import { getCode, getProof } from "viem/actions";
import { execa } from "execa";
import { DeployedBytecode } from "./common";

const emptyTrieRoot = "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421";

export async function getDeployedBytecode({ client, address }: { client: Client; address: Address }) {
  const code = await withCache(() => getCode(client, { address }), {
    cacheKey: `getCode:${client.uid}:${address.toLowerCase()}`,
  });
  if (!code) return;

  const { stdout } = await withCache(() => execa({ input: code })`cast disassemble`, {
    cacheKey: `cast disassemble:${keccak256(code)}`,
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

    const { storageHash } = await withCache(() => getProof(client, { address: value, storageKeys: [] }), {
      cacheKey: `getProof:${client.uid}:${address.toLowerCase()}`,
    });
    // if contract storage is used, it's probably not a public library
    if (storageHash !== emptyTrieRoot) {
      continue;
    }

    const reference = await getDeployedBytecode({ client, address: value });
    if (!reference) continue;

    libraries.push({ offset, reference });
  }

  return {
    address,
    code,
    libraries,
  } satisfies DeployedBytecode;
}
