import { Hex, Client, Transport, Chain, Account } from "viem";
import { WorldDeploy } from "./common";

type LabeledResource = {
  readonly resourceId: Hex;
  readonly label: string;
};

export async function ensureResourceLabels({
  client,
  worldDeploy,
  resources,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly resources: readonly LabeledResource[];
}): Promise<readonly Hex[]> {
  // TODO: check if we can set resource metadata
  // TODO: check which resources we can label (not already set, in a namespace we have access to)
  return [];
}
