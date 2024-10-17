import { redirect } from "next/navigation";
import { supportedChainName } from "../../../../../common";

type Props = {
  params: {
    chainName: supportedChainName;
    worldAddress: string;
  };
};

export default async function WorldPage({ params: { chainName, worldAddress } }: Props) {
  return redirect(`/${chainName}/worlds/${worldAddress}/explore`);
}
