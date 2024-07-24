import { createWalletClient, Hex, http } from "viem";
import { getWorldDeploy, getWorldAbi } from "@latticexyz/cli";
import { getRpcUrl } from "@latticexyz/common/foundry";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const worldAddress = searchParams.get("address") as Hex;

  if (!worldAddress) {
    return Response.json({ error: "address is required" }, { status: 400 });
  }

  const profile = process.env.FOUNDRY_PROFILE;
  const rpc = await getRpcUrl(profile);
  const client = createWalletClient({
    transport: http(rpc),
  });

  try {
    const worldDeploy = await getWorldDeploy(client, worldAddress);
    const worldAbi = await getWorldAbi({
      client,
      worldDeploy,
    });

    return Response.json({ abi: worldAbi });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json({ error: "An unknown error occurred" }, { status: 400 });
    }
  }
}
