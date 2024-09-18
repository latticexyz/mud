import { DataExplorerDozer } from "./DataExplorerDozer";
import { DataExplorerSqlite } from "./DataExplorerSqlite";

type Props = {
  params: {
    worldAddress: string;
    chainName: string;
  };
};

export default function ExplorerPage({ params }: Props) {
  if (params.chainName === "anvil") {
    return <DataExplorerSqlite />;
  }

  return <DataExplorerDozer />;
}
