import { redirect } from "next/navigation";

// TODO: can params be dynamically extracted
type Props = {
  params: {
    chainName: string;
  };
};

export default async function ChainPage({ params }: Props) {
  return redirect(`/${params.chainName}/worlds`);
}
