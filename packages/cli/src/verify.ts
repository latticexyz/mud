import { forge } from "@latticexyz/common/foundry";

type VerifyOptions = {
  foundryProfile?: string;
};

export async function verify({ foundryProfile = process.env.FOUNDRY_PROFILE }: VerifyOptions): Promise<void> {
  await forge(
    [
      "verify-contract",
      "0x8838Cfe2E7D96c5b77E4D84EF0612f5C37F45D6A",
      "IncrementSystem",
      "--verifier",
      "sourcify",
      "--chain",
      "holesky",
      "--optimizer-runs",
      "3000",
      "--compiler-version",
      "v0.8.24+commit.e11b9ed9",
    ],
    { profile: foundryProfile },
  );
}
