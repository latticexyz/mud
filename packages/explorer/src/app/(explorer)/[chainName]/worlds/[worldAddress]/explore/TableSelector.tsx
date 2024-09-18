import { Link2Icon, Link2OffIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../components/ui/Select";
import { DeployedTable } from "./utils/decodeTable";

type Props = {
  value: string | undefined;
  deployedTables: DeployedTable[] | undefined;
};

export function TableSelector({ value, deployedTables }: Props) {
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
        <SelectTrigger disabled={!deployedTables}>
          <SelectValue placeholder="Select a table ..." />
        </SelectTrigger>

        <SelectContent>
          {deployedTables?.map(({ tableId, name, type, namespace }) => {
            return (
              <SelectItem key={tableId} value={tableId} className="font-mono">
                {type === "offchainTable" && <Link2OffIcon className="mr-2 inline-block opacity-70" size={14} />}
                {type === "table" && <Link2Icon className="mr-2 inline-block opacity-70" size={14} />}
                {name} {namespace && <span className="opacity-70">({namespace})</span>}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
