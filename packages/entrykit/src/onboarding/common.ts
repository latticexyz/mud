import { ReactNode } from "react";
import { Account, Chain, Client, Transport } from "viem";

export type ConnectedClient = Client<Transport, Chain, Account>;

export type Step = {
  id: string;
  label: string;
  isComplete: boolean;
  content: null | ReactNode;
};
