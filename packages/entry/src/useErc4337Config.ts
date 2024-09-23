import { http } from "wagmi";
import { assert } from "@latticexyz/common/utils";
import { Erc4337Config } from "./config";
import { useConfig } from "./AccountKitConfigProvider";
import { useAppChain } from "./useAppChain";

export function useErc4337Config(): Erc4337Config | undefined {
  const config = useConfig();
  const chain = useAppChain();

  // TODO: do bundler transport health check?
  // TODO: check if paymaster contracts exist?

  if (config.erc4337 === false) return undefined;
  if (config.erc4337 != null) return config.erc4337;

  return {
    transport: http(
      assert(
        chain.rpcUrls.erc4337Bundler?.http[0],
        // eslint-disable-next-line max-len
        "Account Kit was not configured with `erc4337` and is attempting to set up a default transport, but did not find an `erc4337Bundler.http` URL on `chain.rpcUrls`.\n\nYou can either add that to your chain config or disable ERC-4337 with `erc4337: false`.",
      ),
    ),
    paymasters: [
      {
        type: "gasTank",
        address: assert(
          chain.contracts?.gasTank?.address,
          // eslint-disable-next-line max-len
          "Account Kit was not configured with `erc4337` and is attempting to set up a default paymaster, but did not find a `gasTank` contract on `chain.contracts`.\n\nYou can either add that to your chain config or disable ERC-4337 with `erc4337: false`.",
        ),
      },
    ],
  };
}
