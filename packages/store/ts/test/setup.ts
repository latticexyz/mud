import { beforeAll, beforeEach } from "vitest";
import { testClient } from "./common";

// Some test suites deploy contracts in a `beforeAll` handler, so we restore chain state here.
beforeAll(async () => {
  const state = await testClient.dumpState();
  return async (): Promise<void> => {
    await testClient.loadState({ state });
  };
});

// Some tests execute transactions, so we restore chain state here.
beforeEach(async () => {
  const state = await testClient.dumpState();
  return async (): Promise<void> => {
    await testClient.loadState({ state });
  };
});
