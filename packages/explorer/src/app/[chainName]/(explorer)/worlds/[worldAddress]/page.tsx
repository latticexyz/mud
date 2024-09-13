import { redirect } from "next/navigation";

// TODO: move to common?
type ParamsProps = {
  chainName: string;
  worldAddress: string;
};

type Props = {
  params: ParamsProps;
};

export default async function WorldPage({ params }: Props) {
  const { chainName, worldAddress } = params;
  return redirect(`/${chainName}/worlds/${worldAddress}/explore`);
}
