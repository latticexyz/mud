import { redirect } from "next/navigation";
import { chainIdToName, validateChainId } from "../../common";

export const dynamic = "force-dynamic";

export default function IndexPage() {
  const chainId = Number(process.env.CHAIN_ID);
  validateChainId(chainId);

  const worldAddress = process.env.WORLD_ADDRESS;
  const chainName = chainIdToName[chainId] ?? "anvil";

  if (worldAddress) return redirect(`/${chainName}/worlds/${worldAddress}`);
  return redirect(`/${chainName}/worlds`);
}
