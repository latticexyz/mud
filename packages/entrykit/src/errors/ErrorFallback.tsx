import { ReactNode } from "react";
import { FallbackProps } from "react-error-boundary";
import { ErrorOverlay } from "./ErrorOverlay";

export type Props = {
  children: ReactNode;
};

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="h-64">
      <ErrorOverlay error={error} retry={resetErrorBoundary} />
    </div>
  );
}
