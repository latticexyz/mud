import { forge } from "@latticexyz/common/foundry";
import { Address, ByteArray, Hex, getCreate2Address } from "viem";
import { salt } from "../deploy/common";

type Create2Options = {
  bytecode: ByteArray | Hex;
  from: Address;
};

type VerifyContractOptions = {
  name: string;
  rpc: string;
  verifier?: string;
  verifierUrl?: string;
} & ({ address: Address } | Create2Options);

type ForgeOptions = { profile?: string; silent?: boolean; env?: NodeJS.ProcessEnv; cwd?: string };

export async function verifyContract(options: VerifyContractOptions, forgeOptions?: ForgeOptions) {
  const address =
    "address" in options
      ? options.address
      : getCreate2Address({
          from: options.from,
          bytecode: options.bytecode,
          salt,
        });

  const args = ["verify-contract", address, options.name, "--rpc-url", options.rpc];

  if (options.verifier) {
    args.push("--verifier", options.verifier);
  }
  if (options.verifierUrl) {
    args.push("--verifier-url", options.verifierUrl);
  }
  await forge(args, forgeOptions);
}
