import { forge } from "@latticexyz/common/foundry";
import { Address, ByteArray, Hex, getCreate2Address } from "viem";
import { salt } from "./deploy/common";

type VerificationOptions = {
  address: Hex;
  name: string;
  rpc: string;
  verifier?: string;
  verifierUrl?: string;
};

type ForgeOptions = { profile?: string; silent?: boolean; env?: NodeJS.ProcessEnv; cwd?: string };

type Create2Options = {
  bytecode: ByteArray | Hex;
  from: Address;
  salt: ByteArray | Hex;
};

export async function verifyContract(
  { address, name, rpc, verifier, verifierUrl }: VerificationOptions,
  options?: ForgeOptions,
) {
  const args = ["verify-contract", address, name, "--rpc-url", rpc];

  if (verifier) {
    args.push("--verifier", verifier);
  }
  if (verifierUrl) {
    args.push("--verifier-url", verifierUrl);
  }
  await forge(args, options);
}

export async function verifyContractCreate2(
  { name, rpc, verifier, verifierUrl, from, bytecode, salt }: Omit<VerificationOptions, "address"> & Create2Options,
  options?: ForgeOptions,
) {
  const address = getCreate2Address({ from, bytecode, salt });

  return verifyContract({ address, name, rpc, verifier, verifierUrl }, options);
}

export async function verifyContractCreate2DefaultSalt(
  {
    name,
    rpc,
    verifier,
    verifierUrl,
    from,
    bytecode,
  }: Omit<VerificationOptions, "address"> & Omit<Create2Options, "salt">,
  options?: ForgeOptions,
) {
  return verifyContractCreate2({ name, rpc, verifier, verifierUrl, from, bytecode, salt }, options);
}
