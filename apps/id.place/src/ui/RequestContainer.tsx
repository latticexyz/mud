import { ReactNode } from "react";
import { TruncatedHex } from "./TruncatedHex";
import { Logo } from "./icons/Logo";

export function RequestContainer({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="grid grid-rows-[1fr_auto_auto]">
        <div className="col-start-1 row-start-1 row-span-2 bg-slate-200 p-4 flex items-start justify-end">
          <div className="text-xs text-slate-400 inline-flex gap-1.5 items-center">
            <Logo />
            <span className="font-mono">
              <TruncatedHex hex="0x2d70F1eFFbFD865764CAF19BE2A01a72F3CE774f" />
            </span>
          </div>
        </div>
        <div className="col-start-1 row-start-2 row-span-2 px-4 pointer-events-none">
          <div className="size-16 rounded-full grid place-items-center overflow-hidden bg-white border-4 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-full bg-amber-400 saturate-20" viewBox="0 0 24 24">
              <text dominantBaseline="hanging" fontSize="24" y="10%">
                🌊
              </text>
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </>
  );
}
