import { getMudHook } from "@latticexyz/config";

getMudHook("beforeAll").tap("store", () => {
  console.log("called store's beforeAll hook");
});

getMudHook("afterAll").tap("store", () => {
  console.log("called store's afterAll hook");
});
