import { redirect } from "next/navigation";
import { chainIdToName, validateChainId } from "../../common";

export const dynamic = "force-dynamic";

export default function IndexPage() {
  const chainId = Number(process.env.CHAIN_ID);
  validateChainId(chainId);

  const chainName = chainIdToName[chainId] ?? "anvil";
  return redirect(`/${chainName}/worlds`);
}
