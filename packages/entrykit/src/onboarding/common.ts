import { ReactNode } from "react";

export type Step = {
  id: string;
  label: string;
  isComplete: boolean;
  content: null | ReactNode;
};
