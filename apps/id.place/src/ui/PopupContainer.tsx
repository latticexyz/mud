import { ReactNode } from "react";

export function PopupContainer({ children }: { children: ReactNode }) {
  return <div className="min-h-full flex flex-col p-8 gap-8">{children}</div>;
}
