import { Lock } from "lucide-react";
import { internalTableNames } from "@latticexyz/store-sync/sqlite";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../components/ui/Select";

type Option = {
  label: React.ReactNode;
  value: string;
};

type Props = {
  value: string | undefined;
  options: Option[];
};

export function TableSelector({ value, options }: Props) {
  return (
    <div className="py-4">
      <Select
        value={value}
        onValueChange={(value: string) => {
          const url = new URL(window.location.href);
          const searchParams = new URLSearchParams(url.search);
          searchParams.set("table", value);
          window.history.pushState({}, "", `${window.location.pathname}?${searchParams}`);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a table ..." />
        </SelectTrigger>

        <SelectContent>
          {options?.map((option) => {
            return (
              <SelectItem key={option.value} value={option.value} className="font-mono">
                {(internalTableNames as string[]).includes(option.value) && (
                  <Lock className="mr-2 inline-block opacity-70" size={14} />
                )}
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
