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

  return (
    <div>
      <h1>Transactions</h1>
      <BlocksWatcher abi={data.abi} />
    </div>
  );
}
