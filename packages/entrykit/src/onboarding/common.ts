import { ReactNode } from "react";

export type Step = {
  id: string;
  label: string;
  isComplete: boolean;
  canComplete: boolean;
  content: ReactNode;
};
