import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    chainName: string;
  }>;
};

export default async function ChainPage(props: Props) {
  const params = await props.params;

  const { chainName } = params;

  return redirect(`/${chainName}/worlds`);
}
