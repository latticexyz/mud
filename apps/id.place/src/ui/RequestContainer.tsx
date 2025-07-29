import { ReactNode } from "react";
import { TruncatedHex } from "./TruncatedHex";
import { Logo } from "./icons/Logo";
import { PopupContainer } from "./PopupContainer";
import { Hex } from "ox";

export function RequestContainer({
  account,
  onApprove,
  onCancel,
  children,
}: {
  account: { address: Hex.Hex };
  onApprove: () => void;
  onCancel: () => void;
  children: ReactNode;
}) {
  return (
    <PopupContainer>
      <div className="-mt-8 -mx-8 sticky top-0 text-xs flex gap-2 items-center justify-center bg-indigo-50 shadow p-3 leading-none">
        <Logo className="text-sm text-indigo-600" />
        <span className="text-slate-500">
          Signed in as{" "}
          <span className="font-mono">
            <TruncatedHex hex={account.address} />
          </span>
        </span>
      </div>
      {children}
      <div className="flex gap-2">
        <button
          type="button"
          className="w-full py-3 px-6 leading-none bg-indigo-400 hover:brightness-125 active:brightness-90 rounded text-white cursor-pointer border-2 border-indigo-400"
          onClick={(event) => {
            event.preventDefault();
            onCancel();
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="w-full py-3 px-6 leading-none bg-indigo-600 hover:brightness-125 active:brightness-90 rounded text-white cursor-pointer"
          onClick={(event) => {
            event.preventDefault();
            onApprove();
          }}
        >
          Approve
        </button>
      </div>
    </PopupContainer>
  );
}
