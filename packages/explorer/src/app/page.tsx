import { notFound, redirect } from "next/navigation";
import { chainNameId } from "../common";

export const dynamic = "force-dynamic";

export default function IndexPage() {
  const chainId = Number(process.env.CHAIN_ID);
  const chainName = chainNameId[chainId]; // TODO: TS

  if (chainName) return redirect(`/${chainName}/worlds`);
  return notFound();
}
