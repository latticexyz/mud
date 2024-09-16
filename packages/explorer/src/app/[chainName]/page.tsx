import { redirect } from "next/navigation";

type Props = {
  params: {
    chainName: string;
  };
};

export default async function ChainPage({ params }: Props) {
  return redirect(`/${params.chainName}/worlds`);
}
