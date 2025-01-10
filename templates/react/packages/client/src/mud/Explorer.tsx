import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useEntryKitConfig } from "@latticexyz/entrykit/internal";
import { MUDIcon } from "../ui/icons/MUDIcon";

export function Explorer() {
  const [open, setOpen] = useState(false);
  const { chain, worldAddress } = useEntryKitConfig();
  const explorerUrl = chain.blockExplorers?.worldsExplorer?.url;
  if (!explorerUrl) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 flex flex-col opacity-80 transition hover:opacity-100">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="outline-none flex justify-end gap-2 p-2 font-medium leading-none text-black"
      >
        {open ? (
          <>Close</>
        ) : (
          <>
            Explore <MUDIcon className="text-orange-500" />
          </>
        )}
      </button>
      {open ? (
        <iframe src={`${explorerUrl}/${worldAddress}`} className={twMerge("bg-black", open ? "h-[50vh]" : "h-0")} />
      ) : null}
    </div>
  );
}
