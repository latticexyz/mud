import { redirect } from "next/navigation";

export default async function WorldPage({ params }: { params: { worldAddress: string } }) {
  return redirect(`/worlds/${params.worldAddress}/explorer`);
}
