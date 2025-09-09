import { Address, Client, Hex, isAddress, keccak256, withCache } from "viem";
import { getCode } from "viem/actions";
import { execa } from "execa";

export type DeployedBytecode = {
  address: Address;
  code: Hex;
  libraries: {
    offset: number;
    reference: DeployedBytecode;
  }[];
};

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
    const address = match[2];
    if (!isAddress(address, { strict: false })) {
      throw new Error(`Found PUSH20 with invalid address: ${address}`);
    }
    // check if PUSH20 is followed by a DELEGATECALL within a reasonable number of opcodes
    // otherwise it's probably not a public library
    if (!new RegExp(`PUSH20 ${address}\n(\N+\n){0,24}DELEGATECALL`).test(stdout)) {
      continue;
    }
    const reference = await getDeployedBytecode({ client, address });
    if (!reference) continue;

    libraries.push({ offset, reference });
  }

  return {
    address,
    code,
    libraries,
  } satisfies DeployedBytecode;
}
