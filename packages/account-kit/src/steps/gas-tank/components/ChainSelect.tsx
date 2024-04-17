import { ReactNode, Ref, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import * as Select from "@radix-ui/react-select";
import { Shadow } from "../../../ui/Shadow";

type SelectItemProps = {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};
const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <Select.Item
      className={twMerge(
        "text-[13px] leading-none text-violet11 rounded-[3px] flex items-center",
        "h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8",
        "data-[disabled]:pointer-events-none data-[highlighted]:outline-none",
        "data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1",
        className,
      )}
      ref={forwardedRef as Ref<HTMLDivElement>}
      {...props}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
        {/* <CheckIcon /> */}
        CheckIcon
      </Select.ItemIndicator>
    </Select.Item>
  );
});
export function ChainSelect() {
  return (
    <Select.Root defaultValue="17069">
      <Select.Trigger
        className={twMerge(
          "inline-flex items-center justify-center h-[50px] w-[70px]",
          "text-[13px] leading-none gap-[5px]",
          "bg-white",
          "border border-neutral-300",
          "outline-none",
        )}
        aria-label="Food"
      >
        <Select.Value placeholder="Chain" />
        <Select.Icon>{/* <ChevronDownIcon /> */}</Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Shadow>
          <Select.Content
            className={twMerge(
              // Add `z-index` to match `Modal`. Internally, Radix copies this `z-index` to the popover, so we don't need to set `position` here.
              "z-[2147483646]",
              "overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]",
            )}
          >
            <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
              {/* <ChevronUpIcon /> */}
              Up
            </Select.ScrollUpButton>
            <Select.Viewport className="p-[5px]">
              <Select.Group>
                <Select.Label className="px-[25px] text-xs leading-[25px]">Select chain:</Select.Label>
                <SelectItem value="17069">Redstone</SelectItem>
                <SelectItem value="1">Ethereum</SelectItem>
                <SelectItem value="7777777">Zora</SelectItem>
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
              {/* <ChevronDownIcon /> */}
              Down
            </Select.ScrollDownButton>
          </Select.Content>
        </Shadow>
      </Select.Portal>
    </Select.Root>
  );
}
