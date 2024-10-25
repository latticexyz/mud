import { redirect } from "next/navigation";

type Props = {
  params: {
    chainName: string;
  };
};

export default async function ChainPage({ params: { chainName } }: Props) {
  return redirect(`/${chainName}/worlds`);
}
