import { Suspense } from "react";
import { DataExplorer } from "./DataExplorer";

export default function Home() {
  return (
    <div className="w-full">
      <Suspense>
        <DataExplorer />
      </Suspense>
    </div>
  );
}
