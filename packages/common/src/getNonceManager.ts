import { CreateNonceManagerOptions, CreateNonceManagerResult, createNonceManager } from "./createNonceManager";
import { getNonceManagerId } from "./getNonceManagerId";

const nonceManagers = new Map<string, CreateNonceManagerResult>();

export async function getNonceManager({
  client,
  address, // TODO: rename to account?
  blockTag = "pending",
}: CreateNonceManagerOptions): Promise<CreateNonceManagerResult> {
  const id = await getNonceManagerId({ client, address, blockTag });

  const existingNonceManager = nonceManagers.get(id);
  if (existingNonceManager) {
    return existingNonceManager;
  }

  const nonceManager = createNonceManager({ client, address, blockTag });
  nonceManagers.set(id, nonceManager);
  return nonceManager;
}
