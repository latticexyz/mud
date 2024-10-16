import { redirect } from "next/navigation";

type Props = {
  params: {
    chainName: string;
    worldAddress: string;
  };
};

export default async function WorldPage({ params: { chainName, worldAddress } }: Props) {
  return redirect(`/${chainName}/worlds/${worldAddress}/explore`);
}
