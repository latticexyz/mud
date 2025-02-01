import { getTestClient } from "../../../../test-setup/common";

export async function minePending(): Promise<void> {
  const testClient = getTestClient();

  const content = await testClient.getTxpoolContent();
  if (!Object.keys(content.pending).length) return;

  await testClient.mine({ blocks: 1 });
  await minePending();
}
