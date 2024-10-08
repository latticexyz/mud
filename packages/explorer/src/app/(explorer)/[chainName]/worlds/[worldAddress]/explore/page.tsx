import { Metadata } from "next";
import { Explorer } from "./Explorer";

export const metadata: Metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return <Explorer />;
}
