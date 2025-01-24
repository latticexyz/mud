import { redirect } from "next/navigation";
import { supportedChainName } from "../../../../../common";

type Props = {
  params: Promise<{
    chainName: supportedChainName;
    worldAddress: string;
  }>;
};

export default async function WorldPage(props: Props) {
  const params = await props.params;

  const { chainName, worldAddress } = params;

  return redirect(`/${chainName}/worlds/${worldAddress}/explore`);
}
