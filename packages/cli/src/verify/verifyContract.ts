import { execa } from "execa";
import { Address } from "viem";
import { printCommand } from "../utils/printCommand";

type VerifyContractOptions = {
  name: string;
  rpc: string;
  verifier?: string;
  verifierUrl?: string;
  address: Address;
  cwd?: string;
};

export async function verifyContract(options: VerifyContractOptions) {
  await printCommand(
    execa(
      "forge",
      [
        "verify-contract",
        options.address,
        options.name,
        ["--rpc-url", options.rpc],
        options.verifier ? ["--verifier", options.verifier] : [],
        options.verifierUrl ? ["--verifier-url", options.verifierUrl] : [],
      ].flat(),
      { stdio: "inherit" },
    ),
  );
}
