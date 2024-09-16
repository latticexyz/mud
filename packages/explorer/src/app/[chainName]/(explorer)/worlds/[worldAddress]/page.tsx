import { redirect } from "next/navigation";

type Props = {
  params: {
    chainName: string;
    worldAddress: string;
  };
};

export default async function WorldPage({ params }: Props) {
  const { chainName, worldAddress } = params;
  return redirect(`/${chainName}/worlds/${worldAddress}/explore`);
}
