import { DataExplorerLocal } from "./DataExplorerLocal";
import { DataExplorerRemote } from "./DataExplorerRemote";

type Props = {
  params: {
    worldAddress: string;
    chainName: string;
  };
};

export default function ExplorerPage({ params }: Props) {
  if (params.chainName === "anvil") {
    return <DataExplorerLocal />;
  }

  return <DataExplorerRemote />;
}
