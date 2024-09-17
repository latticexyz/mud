import { redirect } from "next/navigation";
import { supportedChainsById, validateChainId } from "../common";

export const dynamic = "force-dynamic";

export default function IndexPage() {
  const chainId = Number(process.env.CHAIN_ID);
  validateChainId(chainId);

  const chainName = supportedChainsById[chainId];
  return redirect(`/${chainName}/worlds`);
}
