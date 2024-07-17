import { createWalletClient, Hex, http } from "viem";
import { getWorldDeploy, getWorldAbi } from "@latticexyz/cli";
import { getRpcUrl } from "@latticexyz/common/foundry";

export const dynamic = "force-dynamic";

export async function GET() {
  const worldAddress = process.env.NEXT_PUBLIC_WORLD_ADDRESS as Hex;
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
