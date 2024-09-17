import { redirect } from "next/navigation";
import { supportedChainsIdName, validateChainId } from "../common";

export const dynamic = "force-dynamic";

export default function IndexPage() {
  const chainId = Number(process.env.CHAIN_ID);
  validateChainId(chainId);

  const chainName = supportedChainsIdName[chainId];
  return redirect(`/${chainName}/worlds`);
}
