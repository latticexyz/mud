import { Suspense } from "react";
import { DataExplorer } from "./DataExplorer";

export default function Home() {
  return (
    <>
      <h1 className="text-4xl font-bold py-4">Data explorer</h1>
      <div className="w-full">
        <Suspense>
          <DataExplorer />
        </Suspense>
      </div>
    </>
  );
}
