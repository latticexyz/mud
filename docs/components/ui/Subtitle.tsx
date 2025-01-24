import { cn } from "../../lib/cn";

export const Subtitle = ({
  style,
  className,
  children,
}: {
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h3
      style={style}
      className={cn(
        "text-[32px] md:text-[36px] lg:text-[42px]",
        "mt-[12px]",
        "leading-[54px]",
        "font-mono",
        "uppercase",
        className,
      )}
    >
      {children}
    </h3>
  );
};
