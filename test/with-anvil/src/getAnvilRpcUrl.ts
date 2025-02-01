// Usually you'd use something like `VITEST_POOL_ID` here, but we can't because
// we might be running many instances of Vitest in parallel with Turbo.
// Instead, we'll just pick a random ID. We do this out here instead of inside
// the function to guarantee that each importing context (i.e. Vitest worker)
// has a stable ID.
const instanceId = Math.floor(Math.random() * 100000);

export function getAnvilRpcUrl() {
  const rpcUrl = process.env.PROOL_ANVIL_URL ? `${process.env.PROOL_ANVIL_URL}/${instanceId}` : "http://127.0.0.1:8545";

  if (!process.env.PROOL_ANVIL_URL) {
    console.warn(`
      A test asked for the Anvil RPC URL, but was run outside of our test wrapper that manages Anvil instances.

      You can either start an Anvil server at "${rpcUrl}" or prefix your command:

        pnpm with-anvil ${process.env.npm_lifecycle_script || "vitest ..."}

    `);
  }

  return rpcUrl;
}
