import { Cached } from "@mud/utils";
import { BaseContract } from "ethers";

export type Contracts = {
  [key: string]: BaseContract;
};

export type TxQueue<C extends Contracts> = Cached<C>;
