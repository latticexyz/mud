import { createWalletClient, Hex, http } from "viem";
import { getWorldDeploy, getWorldAbi } from "@latticexyz/cli";
import { getRpcUrl } from "@latticexyz/common/foundry";

export const dynamic = "force-dynamic";

export async function GET() {
  const worldAddress = "0x8d8b6b8414e1e3dcfd4168561b9be6bd3bf6ec4b" as Hex;
  const profile = process.env.FOUNDRY_PROFILE;
  const rpc = await getRpcUrl(profile);

  const client = createWalletClient({
    transport: http(rpc),
  });

  const worldDeploy = await getWorldDeploy(client, worldAddress);
  const worldAbi = await getWorldAbi({
    client,
    worldDeploy,
  });

  return Response.json({ abi: worldAbi });
}
