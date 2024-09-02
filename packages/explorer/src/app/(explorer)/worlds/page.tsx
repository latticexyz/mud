import { notFound, redirect } from "next/navigation";

export default async function WorldsPage() {
  const worldAddress = process.env.WORLD_ADDRESS;
  if (worldAddress) return redirect(`/worlds/${worldAddress}`);
  return notFound();
}
