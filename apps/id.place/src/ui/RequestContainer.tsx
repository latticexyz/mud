import { ReactNode } from "react";
import { TruncatedHex } from "./TruncatedHex";
import { Logo } from "./icons/Logo";
import { PopupContainer } from "./PopupContainer";

export function RequestContainer({ children }: { children: ReactNode }) {
  return (
    <PopupContainer>
      <div className="self-center -mt-3 text-xs flex gap-2 items-center bg-blue-600/5 rounded p-2 leading-none">
        <Logo className="text-sm text-indigo-600" />
        <span className="text-slate-500">
          Signed in as{" "}
          <span className="font-mono">
            <TruncatedHex hex="0x2d70F1eFFbFD865764CAF19BE2A01a72F3CE774f" />
          </span>
        </span>
      </div>
      {children}
      <div className="flex gap-2">
        <button className="w-full py-3 px-6 leading-none bg-indigo-400 hover:brightness-125 active:brightness-90 rounded text-white cursor-pointer border-2 border-indigo-400">
          Cancel
        </button>
        <button className="w-full py-3 px-6 leading-none bg-indigo-600 hover:brightness-125 active:brightness-90 rounded text-white cursor-pointer">
          Approve
        </button>
      </div>
    </PopupContainer>
  );
}
