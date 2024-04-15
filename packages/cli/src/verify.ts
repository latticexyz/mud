import { forge, getRpcUrl } from "@latticexyz/common/foundry";
import { Hex, createWalletClient, getCreate2Address, http } from "viem";
import { readFileSync, readdirSync } from "fs";
import { salt } from "./deploy/common";
import { ensureDeployer } from "./deploy/ensureDeployer";
import { privateKeyToAccount } from "viem/accounts";
import { MUDError } from "@latticexyz/common/errors";

type VerifyOptions = {
  foundryProfile?: string;
};

async function verifyFolder(outPath: string, foundryProfile: string | undefined, deployerAddress: Hex) {
  const folderNames = readdirSync(outPath);

  await Promise.all(
    folderNames.map((name) => {
      const fileNames = readdirSync(`out/${name}`);

      fileNames
        .filter((filename) => filename.split(".").length === 2) // check that the file ends in .json
        .map((filename) => {
          const filePath = `out/${name}/${filename}`;
          const bytecode = JSON.parse(readFileSync(filePath, "utf8")).bytecode.object as Hex;
          const system = getCreate2Address({ from: deployerAddress, bytecode, salt });

          forge(["verify-contract", system, filename, "--verifier", "sourcify"], {
            profile: foundryProfile,
          });
        });
    }),
  );
}

export async function verify({ foundryProfile = process.env.FOUNDRY_PROFILE }: VerifyOptions): Promise<void> {
  const privateKey = process.env.PRIVATE_KEY as Hex;
  if (!privateKey) {
    throw new MUDError(
      `Missing PRIVATE_KEY environment variable.
Run 'echo "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" > .env'
in your contracts directory to use the default anvil private key.`,
    );
  }

  const rpc = await getRpcUrl(foundryProfile);

  const client = createWalletClient({
    transport: http(rpc),
    account: privateKeyToAccount(privateKey),
  });

  const deployerAddress = await ensureDeployer(client);

  verifyFolder("out", foundryProfile, deployerAddress);
  verifyFolder("node_modules/@latticexyz/world/out", foundryProfile, deployerAddress);
  verifyFolder("node_modules/@latticexyz/world-modules/out", foundryProfile, deployerAddress);
}
