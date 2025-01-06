import { cn } from "../../lib/cn";

export const Paragraph = ({
  style,
  className,
  children,
}: {
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      style={style}
      className={cn(
        "text-[20px] md:text-[21px]",
        "font-sans",
        "leading-[30px]",
        "mt-[16px]",
        "tracking-[-0.22px]",
        className,
      )}
    >
      {children}
    </p>
  );
};
