import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TableSelector({
  value,
  options,
}: {
  value: string | undefined;
  options: string[];
}) {
  return (
    <div className="py-4">
      <Select
        value={value}
        onValueChange={(value: string) => {
          const url = new URL(window.location.href);
          const searchParams = new URLSearchParams(url.search);
          searchParams.set("table", value);
          window.history.pushState(
            {},
            "",
            `${window.location.pathname}?${searchParams}`,
          );
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a table ..." />
        </SelectTrigger>
        <SelectContent>
          {options?.map((option) => {
            return (
              <SelectItem key={option} value={option} className="font-mono">
                {option}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
