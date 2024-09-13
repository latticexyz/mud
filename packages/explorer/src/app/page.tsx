import { notFound, redirect } from "next/navigation";
import { chainsNamesMap } from "../common";

export const dynamic = "force-dynamic";

export default function IndexPage() {
  const chainId = Number(process.env.CHAIN_ID);
  const chainName = chainsNamesMap[chainId];

  if (chainName) {
    // TODO: improve
    return redirect(`/${chainName}/worlds`);
  }
  return notFound();
}
