import { cn } from "../../lib/cn";

export const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("flex flex-col w-full px-4 sm:px-6 xl:px-[calc((100%-1152px)/2)]", className)}>{children}</div>
  );
};
