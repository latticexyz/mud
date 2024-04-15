import { forge, getRpcUrl } from "@latticexyz/common/foundry";
import { Hex, createWalletClient, http } from "viem";
import { getSystems } from "./deploy/getSystems";
import { getWorldDeploy } from "./deploy/getWorldDeploy";

type VerifyOptions = {
  worldAddress: Hex;
  foundryProfile?: string;
};

export async function verify({
  worldAddress,
  foundryProfile = process.env.FOUNDRY_PROFILE,
}: VerifyOptions): Promise<void> {
  const rpc = await getRpcUrl(foundryProfile);

  const client = createWalletClient({
    transport: http(rpc),
  });

  const worldDeploy = await getWorldDeploy(client, worldAddress);

  const systems = await getSystems({ client, worldDeploy });

  await Promise.all(
    systems.map((system) =>
      forge(["verify-contract", system.address, system.name, "--verifier", "sourcify"], {
        profile: foundryProfile,
      }),
    ),
  );
}
