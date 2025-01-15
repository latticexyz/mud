import { ReactNode } from "react";
import { useSyncProgress } from "./useSyncProgress";

export type Props = {
  children: ReactNode;
};

export function Loading({ children }: Props) {
  const { isLive, message, percentage } = useSyncProgress();
  return isLive ? (
    children
  ) : (
    <div className="tabular-nums">
      {message} ({percentage.toFixed(1)}%)…
    </div>
  );
}
