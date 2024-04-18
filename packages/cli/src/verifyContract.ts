import { forge } from "@latticexyz/common/foundry";
import { Address, ByteArray, Hex, getCreate2Address } from "viem";
import { salt } from "./deploy/common";

type ForgeOptions = { profile?: string; silent?: boolean; env?: NodeJS.ProcessEnv; cwd?: string };

type Create2Options = {
  bytecode: ByteArray | Hex;
  from: Address;
  salt: ByteArray | Hex;
};

export async function verifyContract(
  {
    address,
    name,
    rpc,
    verifier,
  }: {
    address: Hex;
    name: string;
    rpc: string;
    verifier?: string;
  },
  options?: ForgeOptions,
) {
  if (verifier) {
    await forge(["verify-contract", address, name, "--rpc-url", rpc, "--verifier", verifier], options);
  } else {
    await forge(["verify-contract", address, name, "--rpc-url", rpc], options);
  }
}

export async function verifyContractCreate2(
  {
    name,
    rpc,
    verifier,
    from,
    bytecode,
    salt,
  }: {
    name: string;
    rpc: string;
    verifier?: string;
  } & Create2Options,
  options?: ForgeOptions,
) {
  const address = getCreate2Address({ from, bytecode, salt });

  return verifyContract({ address, name, rpc, verifier }, options);
}

export async function verifyContractCreate2DefaultSalt(
  {
    name,
    rpc,
    verifier,
    from,
    bytecode,
  }: {
    name: string;
    rpc: string;
    verifier?: string;
  } & Omit<Create2Options, "salt">,
  options?: ForgeOptions,
) {
  return verifyContractCreate2({ name, rpc, verifier, from, bytecode, salt }, options);
}
