import { Hex } from "viem";
import { getAbi } from "../interact/page";
import { BlocksWatcher } from "./BlocksWatcher";

type Props = {
  params: {
    worldAddress: Hex;
  };
};

export default async function TransactionsPage({ params }: Props) {
  const { worldAddress } = params;
  const data = await getAbi(worldAddress);
  return <BlocksWatcher abi={data.abi} />;
}
