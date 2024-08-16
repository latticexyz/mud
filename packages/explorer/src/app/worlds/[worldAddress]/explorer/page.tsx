import { Suspense } from "react";
import { DataExplorer } from "./DataExplorer";

export default function ExplorerPage() {
  return (
    <div className="w-full">
      <Suspense>
        <DataExplorer />
      </Suspense>
    </div>
  );
}
