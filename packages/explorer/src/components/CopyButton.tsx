import { CheckIcon, ClipboardIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../utils";
import { Button, ButtonProps } from "./ui/Button";

interface CopyButtonProps extends ButtonProps {
  value: string;
}

function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value);
}

export function CopyButton({ className, variant = "outline", value, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    }
  }, [hasCopied]);

  return (
    <Button
      size="icon"
      variant={variant}
      className={cn(
        "relative z-10 h-6 w-6 border-white/15 bg-transparent text-zinc-50 hover:bg-secondary hover:text-zinc-50 [&_svg]:h-3 [&_svg]:w-3",
        className,
      )}
      onClick={() => {
        copyToClipboard(value);
        setHasCopied(true);
      }}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
    </Button>
  );
}
