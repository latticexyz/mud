import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function WorldsPage() {
  const worldAddress = process.env.WORLD_ADDRESS;
  if (worldAddress) return redirect(`/worlds/${worldAddress}`);
  return notFound();
}
