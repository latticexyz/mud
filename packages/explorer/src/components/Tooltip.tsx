import { Tooltip as RadixTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/Tooltip";

type Props = {
  text: string;
  children: React.ReactNode;
};

export function Tooltip({ text, children }: Props) {
  return (
    <TooltipProvider>
      <RadixTooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{text}</p>
        </TooltipContent>
      </RadixTooltip>
    </TooltipProvider>
  );
}
