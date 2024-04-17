import { forge, getRpcUrl } from "@latticexyz/common/foundry";
import { Hex, createWalletClient, getCreate2Address, http } from "viem";
import { salt } from "./deploy/common";
import { ensureDeployer } from "./deploy/ensureDeployer";
import { privateKeyToAccount } from "viem/accounts";
import { MUDError } from "@latticexyz/common/errors";
import { getWorldFactoryContracts } from "./deploy/ensureWorldFactory";
import { Contract } from "./deploy/ensureContract";

type VerifyOptions = {
  foundryProfile?: string;
  systems: Contract[];
  modules: Contract[];
};

async function verifyContract(
  foundryProfile: string | undefined,
  deployerAddress: Hex,
  name: string,
  bytecode: Hex,
  cwd?: string,
) {
  const system = getCreate2Address({ from: deployerAddress, bytecode, salt });

  await forge(["verify-contract", system, name, "--verifier", "sourcify", "--chain", "holesky"], {
    profile: foundryProfile,
    cwd,
  });
}

export async function verify({
  foundryProfile = process.env.FOUNDRY_PROFILE,
  systems,
  modules,
}: VerifyOptions): Promise<void> {
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

  await Promise.all(
    systems.map(({ label, bytecode }) => {
      if (label) {
        verifyContract(foundryProfile, deployerAddress, label, bytecode);
      }
    }),
  );

  await Promise.all(
    getWorldFactoryContracts(deployerAddress).map(({ label, bytecode }) => {
      if (label) {
        verifyContract(foundryProfile, deployerAddress, label, bytecode, "node_modules/@latticexyz/world");
      }
    }),
  );
  await Promise.all(
    modules.map(({ label, bytecode }) => {
      if (label) {
        verifyContract(foundryProfile, deployerAddress, label, bytecode, "node_modules/@latticexyz/world-modules");
      }
    }),
  );
}
