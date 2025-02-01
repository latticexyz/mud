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
