import { Tooltip as RadixTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/Tooltip";

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
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
