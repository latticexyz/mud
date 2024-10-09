import { ReactNode } from "react";

export type Props = {
  id: string;
  label: string;
  isComplete: boolean;
  canComplete: boolean;
  children: ReactNode;
};

export function Step(_props: Props) {
  return null;
}
