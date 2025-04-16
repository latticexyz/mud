import {
  slice,
  concat,
  type Transport,
  type Chain,
  type Hex,
  type Client,
  type EncodeFunctionDataParameters,
  Abi,
  WriteContractParameters,
} from "viem";
import { getAction, encodeFunctionData } from "viem/utils";
import { readHex } from "@latticexyz/common";
import { BundlerActions, sendUserOperation as viem_sendUserOperation, SmartAccount } from "viem/account-abstraction";
import { worldFunctionToSystemFunction } from "../worldFunctionToSystemFunction";
import { worldCallAbi } from "../../worldCallAbi";

type CallFromParameters = {
  worldAddress: Hex;
  delegatorAddress: Hex;
  worldFunctionToSystemFunction?: (worldFunctionSelector: Hex) => Promise<SystemFunction>;
  publicClient?: Client;
};

type SystemFunction = { systemId: Hex; systemFunctionSelector: Hex };

// By extending viem clients with this function after delegation, the delegation is automatically applied to World contract writes.
// This means that these writes are made on behalf of the delegator.
// Internally, it transforms the write arguments to use `callFrom`.
//
// Accepts either `worldFunctionToSystemFunction` or `publicClient` as an argument.
// `worldFunctionToSystemFunction` allows manually providing the mapping function, thus users can utilize their client store for the lookup.
// If `publicClient` is provided instead, this function retrieves the corresponding system function from the World contract.
//
// The function mapping is cached to avoid redundant retrievals for the same World function.
export function sendUserOperationFrom(
  params: CallFromParameters,
): <chain extends Chain, account extends SmartAccount | undefined>(
  client: Client<Transport, chain, account>,
) => Pick<BundlerActions<account>, "sendUserOperation"> {
  return (client) => ({
    async sendUserOperation(args) {
      const _sendUserOperation = getAction(client, viem_sendUserOperation, "sendUserOperation");

      if (args.callData) {
        return _sendUserOperation(args as never); // TODO: fix type issue
      }

      const calls = await Promise.all(
        args.calls.map(async (call) => {
          // Skip if the call doesn't match the decoded format (`functionName`, `args`, `to`)
          if (!isDecodedCall(call)) return call;

          // Skip if the contract isn't the World or the function called should not be redirected through `callFrom`.
          if (
            call.to !== params.worldAddress ||
            call.functionName === "call" ||
            call.functionName === "callFrom" ||
            call.functionName === "batchCallFrom" ||
            call.functionName === "callWithSignature"
          ) {
            return call;
          }

          // Wrap system calls from `batchCall` with delegator for a `batchCallFrom`
          // TODO: remove this specific workaround once https://github.com/latticexyz/mud/pull/3506 lands
          if (call.functionName === "batchCall") {
            const batchCallArgs = call.args as unknown as WriteContractParameters<worldCallAbi, "batchCall">;
            const [systemCalls] = batchCallArgs.args;
            if (!systemCalls.length) {
              throw new Error("`batchCall` should have at least one system call.");
            }

            return {
              ...call,
              functionName: "batchCallFrom",
              args: [systemCalls.map((systemCall) => ({ from: params.delegatorAddress, ...systemCall }))],
            };
          }

          // Encode the World's calldata (which includes the World's function selector).
          const worldCalldata = encodeFunctionData({
            abi: call.abi,
            functionName: call.functionName,
            args: call.args,
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

          return {
            ...call,
            functionName: "callFrom",
            args: [params.delegatorAddress, systemId, systemCalldata],
          };
        }),
      );

      // Call `sendUserOperation` with the new args.
      return _sendUserOperation({ ...args, calls } as never); // TODO: fix type issue
    },
  });
}

// Matching https://github.com/wevm/viem/blob/26e4bcafb3be976510b4d8170ef29bb69e014263/src/types/calls.ts#L6-L23 (not exported)
type DecodedCall = {
  abi: Abi;
  functionName: string;
  args: unknown[];
  to: Hex;
};

function isDecodedCall(call: unknown): call is DecodedCall {
  return "functionName" in (call as never) && "args" in (call as never) && "to" in (call as never);
}
