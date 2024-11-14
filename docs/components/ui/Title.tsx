import { cn } from "../../lib/cn";

export const Title = ({
  style,
  className,
  children,
}: {
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}) => {
  const title = (
    <h2
      style={style}
      className={cn(
        "flex items-center gap-[10px] font-mono text-[20px] uppercase leading-none text-white/75 opacity-50",
        className,
      )}
    >
      {children}
    </h2>
  );

  return title;
};
