import { ReactNode } from "react";
import { TruncatedHex } from "./TruncatedHex";
import { Logo } from "./icons/Logo";
import { PopupContainer } from "./PopupContainer";
import { Hex } from "ox";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./Button";

export function RequestContainer({
  account,
  onApprove,
  onCancel,
  children,
}: {
  account: { address: Hex.Hex };
  onApprove: () => Promise<void>;
  onCancel: () => Promise<void>;
  children: ReactNode;
}) {
  const approve = useMutation({
    mutationFn: onApprove,
  });
  const cancel = useMutation({
    mutationFn: onCancel,
  });

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
        <Button
          variant="secondary"
          onClick={(event) => {
            event.preventDefault();
            cancel.mutate();
          }}
          pending={cancel.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={(event) => {
            event.preventDefault();
            approve.mutate();
          }}
          pending={approve.isPending}
        >
          Approve
        </Button>
      </div>
    </PopupContainer>
  );
}
