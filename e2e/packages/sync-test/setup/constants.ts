export const poolId = Number(process.env.VITEST_POOL_ID ?? 1);
export const rpcHttpUrl = `http://127.0.0.1:8545/${poolId}`;
export const rpcWsUrl = `ws://127.0.0.1:8545/${poolId}`;
