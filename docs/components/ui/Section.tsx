import { ForwardedRef, forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Section = forwardRef(function RefSection(
  {
    children,
    className,
    style,
  }: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  },
  ref?: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div className={cn("flex w-full flex-col", className)} style={style} ref={ref}>
      {children}
    </div>
  );
});
