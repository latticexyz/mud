"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import Image from "next/image";

interface CopyButtonProps {
  value: string;
  label?: string;
}

function useCopyToClipboard(resetInterval = 3000) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = React.useCallback((value: string) => {
    navigator.clipboard.writeText(value).then(() => setIsCopied(true));
  }, []);

  React.useEffect(() => {
    if (isCopied) {
      const resetTimeout = setTimeout(() => setIsCopied(false), resetInterval);
      return () => clearTimeout(resetTimeout);
    }
  }, [isCopied, resetInterval]);

  return { isCopied, copyToClipboard };
}

export default function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={isCopied}>
        <TooltipPrimitive.Trigger asChild>
          <Image
            src="/images/icons/clipboard.svg"
            alt={label}
            aria-label={label}
            width={28}
            height={28}
            onClick={() => copyToClipboard(value)}
            className="cursor-pointer"
          />
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            // eslint-disable-next-line max-len
            className="bg-light-gray text-primary-foreground px-3 py-1.5 text-xs font-mono uppercase rounded-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            sideOffset={5}
          >
            Copied!
            <TooltipPrimitive.Arrow className="fill-light-gray" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
