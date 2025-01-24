import { CreateNonceManagerOptions, CreateNonceManagerResult, createNonceManager } from "./createNonceManager";
import { getNonceManagerId } from "./getNonceManagerId";

const nonceManagers = new Map<string, CreateNonceManagerResult>();

export async function getNonceManager({
  client,
  address, // TODO: rename to account?
  blockTag = "latest",
  ...opts
}: CreateNonceManagerOptions): Promise<CreateNonceManagerResult> {
  const id = await getNonceManagerId({ client, address, blockTag });

  const nonceManager = nonceManagers.get(id) ?? createNonceManager({ client, address, blockTag, ...opts });
  if (!nonceManagers.has(id)) {
    nonceManagers.set(id, nonceManager);
  }

  if (!nonceManager.hasNonce()) {
    await nonceManager.resetNonce();
  }

  return nonceManager;
}
