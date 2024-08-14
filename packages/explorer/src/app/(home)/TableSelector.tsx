import { Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { NON_EDITABLE_TABLES } from "../../consts";
import { useWorldAddress } from "../../hooks/useWorldAddress";

export function TableSelector({ value, options }: { value: string | undefined; options: string[] }) {
  const worldAddress = useWorldAddress();
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
              <SelectItem key={option} value={option} className="font-mono">
                {NON_EDITABLE_TABLES.includes(option) && <Lock className="mr-2 inline-block opacity-70" size={14} />}
                {option.replace(`${worldAddress}__`, "")}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
