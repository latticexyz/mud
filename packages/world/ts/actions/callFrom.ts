import {
  slice,
  concat,
  type Transport,
  type Chain,
  type Account,
  type Hex,
  type WalletActions,
  type Client,
  type WriteContractParameters,
  type EncodeFunctionDataParameters,
} from "viem";
import { getAction, encodeFunctionData } from "viem/utils";
import { writeContract as viem_writeContract } from "viem/actions";
import { readHex } from "@latticexyz/common";
import { worldCallAbi } from "../worldCallAbi";
import { SystemFunction, worldFunctionToSystemFunction } from "../worldFunctionToSystemFunction";

type CallFromParameters = {
  worldAddress: Hex;
  delegatorAddress: Hex;
  worldFunctionToSystemFunction?: (worldFunctionSelector: Hex) => Promise<SystemFunction>;
  publicClient?: Client;
};

// By extending viem clients with this function after delegation, the delegation is automatically applied to World contract writes.
// This means that these writes are made on behalf of the delegator.
// Internally, it transforms the write arguments to use `callFrom`.
//
// Accepts either `worldFunctionToSystemFunction` or `publicClient` as an argument.
// `worldFunctionToSystemFunction` allows manually providing the mapping function, thus users can utilize their client store for the lookup.
// If `publicClient` is provided instead, this function retrieves the corresponding system function from the World contract.
//
// The function mapping is cached to avoid redundant retrievals for the same World function.
export function callFrom(
  params: CallFromParameters,
): <chain extends Chain, account extends Account | undefined>(
  client: Client<Transport, chain, account>,
) => Pick<WalletActions<chain, account>, "writeContract"> {
  return (client) => ({
    async writeContract(writeArgs) {
      console.log("call from", client, writeArgs);
      const _writeContract = getAction(client, viem_writeContract, "writeContract");

      // Skip if the contract isn't the World or the function called should not be redirected through `callFrom`.
      if (
        writeArgs.address !== params.worldAddress ||
        writeArgs.functionName === "call" ||
        writeArgs.functionName === "callFrom" ||
        writeArgs.functionName === "batchCallFrom" ||
        writeArgs.functionName === "callWithSignature"
      ) {
        return _writeContract(writeArgs);
      }

      // Wrap system calls from `batchCall` with delegator for a `batchCallFrom`
      // TODO: remove this specific workaround once https://github.com/latticexyz/mud/pull/3506 lands
      if (writeArgs.functionName === "batchCall") {
        const batchCallArgs = writeArgs as unknown as WriteContractParameters<worldCallAbi, "batchCall">;
        const [systemCalls] = batchCallArgs.args;
        if (!systemCalls.length) {
          throw new Error("`batchCall` should have at least one system call.");
        }

        return _writeContract({
          ...batchCallArgs,
          functionName: "batchCallFrom",
          args: [systemCalls.map((systemCall) => ({ from: params.delegatorAddress, ...systemCall }))],
        });
      }

      // Encode the World's calldata (which includes the World's function selector).
      const worldCalldata = encodeFunctionData({
        abi: writeArgs.abi,
        functionName: writeArgs.functionName,
        args: writeArgs.args,
      } as unknown as EncodeFunctionDataParameters);

      // The first 4 bytes of calldata represent the function selector.
      const worldFunctionSelector = slice(worldCalldata, 0, 4);

      // Get the systemId and System's function selector.
      const { systemId, systemFunctionSelector } = await worldFunctionToSystemFunction({
        ...params,
        publicClient: params.publicClient ?? client,
        worldFunctionSelector,
      });

      // Construct the System's calldata by replacing the World's function selector with the System's.
      // Use `readHex` instead of `slice` to prevent out-of-bounds errors with calldata that has no args.
      const systemCalldata = concat([systemFunctionSelector, readHex(worldCalldata, 4)]);

      // Call `writeContract` with the new args.
      return _writeContract({
        ...(writeArgs as unknown as WriteContractParameters<worldCallAbi, "callFrom">),
        functionName: "callFrom",
        args: [params.delegatorAddress, systemId, systemCalldata],
      });
    },
  });
}
