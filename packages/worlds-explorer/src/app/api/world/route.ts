import { createWalletClient, Hex, http } from "viem";
import { getWorldDeploy, getWorldAbi } from "@latticexyz/cli";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { abi as defaultAbi } from "./abi";

export const dynamic = "force-dynamic";

function removeDuplicateObjects(array) {
  return array.filter(function (item, index, self) {
    return (
      index ===
      self.findIndex(function (t) {
        return JSON.stringify(t) === JSON.stringify(item);
      })
    );
  });
}

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
    const duplicatedABI = [...worldAbi, ...defaultAbi];
    const abi = removeDuplicateObjects(duplicatedABI);

    return Response.json({ abi });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json({ error: "An unknown error occurred" }, { status: 400 });
    }
  }
}
