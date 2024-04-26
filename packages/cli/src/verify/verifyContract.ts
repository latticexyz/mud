import { forge } from "@latticexyz/common/foundry";
import { Address } from "viem";

type VerifyContractOptions = {
  name: string;
  rpc: string;
  verifier?: string;
  verifierUrl?: string;
  address: Address;
};

type ForgeOptions = { profile?: string; silent?: boolean; env?: NodeJS.ProcessEnv; cwd?: string };

export async function verifyContract(options: VerifyContractOptions, forgeOptions?: ForgeOptions) {
  const args = ["verify-contract", options.address, options.name, "--rpc-url", options.rpc];

  if (options.verifier) {
    args.push("--verifier", options.verifier);
  }
  if (options.verifierUrl) {
    args.push("--verifier-url", options.verifierUrl);
  }
  await forge(args, forgeOptions);
}
