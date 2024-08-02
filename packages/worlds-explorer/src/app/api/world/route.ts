import { Hex, createWalletClient, http } from "viem";
import { getWorldAbi, getWorldDeploy } from "@latticexyz/cli";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { abi as defaultAbi } from "./abi";
import { deduplicateABI } from "./utils/deduplicateABI";

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

    const combinedABI = [...worldAbi, ...defaultAbi];
    const filteredABI = deduplicateABI(combinedABI).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const sortedABI = filteredABI.sort((a, b) => a.name.localeCompare(b.name));

    return Response.json({ abi: sortedABI });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json(
        { error: "An unknown error occurred" },
        { status: 400 },
      );
    }
  }
}
