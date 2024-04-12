import { forge } from "@latticexyz/common/foundry";

type VerifyOptions = {
  foundryProfile?: string;
};

export async function verify({ foundryProfile = process.env.FOUNDRY_PROFILE }: VerifyOptions): Promise<void> {
  await forge(
    [
      "verify-contract",
      "0xA04EA49CCA55B764B1EADE56e60d63D8592e9E97",
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
