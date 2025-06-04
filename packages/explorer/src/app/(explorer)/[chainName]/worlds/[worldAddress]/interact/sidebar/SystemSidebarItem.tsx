import { ChevronsUpDown } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { Badge } from "../../../../../../../components/ui/Badge";
import { Button } from "../../../../../../../components/ui/Button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../../../../components/ui/Collapsible";

type SystemSidebarItemProps = {
  name: string;
  systemId: string;
  children?: React.ReactNode;
  functionCount?: number;
  isNamespace?: boolean;
  filterValue?: string;
};

export function SystemSidebarItem({ systemId, name, children, functionCount, isNamespace }: SystemSidebarItemProps) {
  const [isExpanded, setIsExpanded] = useQueryState("expanded", parseAsArrayOf(parseAsString).withDefault([]));

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => {
      if (prev.includes(systemId)) {
        return prev.filter((item) => item !== systemId);
      }
      return [...prev, systemId];
    });
  };

  return (
    <li>
      <Collapsible open={isExpanded.includes(systemId)} onOpenChange={handleToggleExpanded}>
        <CollapsibleTrigger asChild>
          <div className="group flex w-full cursor-pointer items-center justify-between space-x-1">
            <h4 className="truncate text-sm font-semibold">{name}</h4>
            <div className="flex items-center gap-1">
              {functionCount !== undefined && (
                <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full px-1.5">
                  {functionCount}
                </Badge>
              )}

              <Button size="sm" variant="ghost">
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className={isNamespace ? undefined : "space-y-1"}>{children}</CollapsibleContent>
      </Collapsible>
    </li>
  );
}
