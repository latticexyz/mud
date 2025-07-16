import { getTxpoolContent, mine } from "viem/actions";
import { createTestClient } from "with-anvil";

export async function minePending(): Promise<void> {
  const testClient = createTestClient();

  const content = await getTxpoolContent(testClient);
  if (!Object.keys(content.pending).length) return;

  await mine(testClient, { blocks: 1 });
  await minePending();
}
