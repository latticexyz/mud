import { redirect } from "next/navigation";

type Props = {
  params: {
    chainName: string;
  };
};

export default async function ChainPage({ params }: Props) {
  const { chainName } = params;
  const worldAddress = process.env.WORLD_ADDRESS;

  if (worldAddress) return redirect(`/${chainName}/worlds/${worldAddress}`);
  return redirect(`/${chainName}/worlds`);
}
