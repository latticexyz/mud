import { beforeAll, beforeEach } from "vitest";
import { testClient } from "./common";

beforeAll(async () => {
  const state = await testClient.dumpState();
  return async (): Promise<void> => {
    await testClient.loadState({ state });
  };
});

beforeEach(async () => {
  const state = await testClient.dumpState();
  return async (): Promise<void> => {
    await testClient.loadState({ state });
  };
});
