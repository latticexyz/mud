import { beforeEach, describe, expect, it, vi } from "vitest";
import { mainnet } from "viem/chains";
import { dustMainnet, dustTestnet } from "@latticexyz/common/chains";

const cachedFeesPerGasMock = vi.hoisted(() => vi.fn());
const viemCreateBundlerClientMock = vi.hoisted(() => vi.fn());

vi.mock("./actions/cachedFeesPerGas", () => ({
  cachedFeesPerGas: cachedFeesPerGasMock,
}));

vi.mock("viem/account-abstraction", async () => {
  const actual = await vi.importActual<typeof import("viem/account-abstraction")>("viem/account-abstraction");
  return {
    ...actual,
    createBundlerClient: viemCreateBundlerClientMock,
  };
});

import { createBundlerClient } from "./createBundlerClient";

describe("createBundlerClient fee estimation", () => {
  const feeEstimator = vi.fn(async () => ({ maxFeePerGas: 1n, maxPriorityFeePerGas: 1n }));

  beforeEach(() => {
    vi.clearAllMocks();
    cachedFeesPerGasMock.mockReturnValue(feeEstimator);
    viemCreateBundlerClientMock.mockImplementation((config) => config);
  });

  it.each([dustTestnet, dustMainnet])("uses cached fee estimation for %s", (chain) => {
    const client = { chain } as never;
    const bundlerClient = createBundlerClient({
      transport: {} as never,
      client,
    });

    expect(cachedFeesPerGasMock).toHaveBeenCalledWith(client);
    expect(viemCreateBundlerClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        client,
        userOperation: expect.objectContaining({
          estimateFeesPerGas: feeEstimator,
        }),
      }),
    );
    expect(bundlerClient).toMatchObject({
      client,
      userOperation: {
        estimateFeesPerGas: feeEstimator,
      },
    });
  });

  it("falls back to viem's default fee estimation on other chains", () => {
    const client = { chain: mainnet } as never;
    const bundlerClient = createBundlerClient({
      transport: {} as never,
      client,
    });

    expect(cachedFeesPerGasMock).not.toHaveBeenCalled();
    expect(viemCreateBundlerClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        client,
        userOperation: expect.objectContaining({
          estimateFeesPerGas: undefined,
        }),
      }),
    );
    expect(bundlerClient).toMatchObject({
      client,
      userOperation: {
        estimateFeesPerGas: undefined,
      },
    });
  });
});
