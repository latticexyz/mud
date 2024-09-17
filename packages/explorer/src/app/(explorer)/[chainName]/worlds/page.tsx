import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    chainName: string;
  };
};

export default function WorldsPage({ params }: Props) {
  const worldAddress = process.env.WORLD_ADDRESS;
  if (worldAddress) return redirect(`/${params.chainName}/worlds/${worldAddress}`);
  return notFound();
}
