import { ReactNode } from "react";

export function PopupContainer({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-blue-600/10 flex flex-col p-8 gap-8">{children}</div>;
}
