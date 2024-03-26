import { UserOperation } from "permissionless";
import { Hex, concat, pad, toHex } from "viem";

function getInitCode(unpackedUserOperation: UserOperation<"v0.7">) {
  return unpackedUserOperation.factory
    ? concat([unpackedUserOperation.factory, unpackedUserOperation.factoryData || ("0x" as Hex)])
    : "0x";
}

export function getAccountGasLimits(unpackedUserOperation: UserOperation<"v0.7">) {
  return concat([
    pad(toHex(unpackedUserOperation.verificationGasLimit), {
      size: 16,
    }),
    pad(toHex(unpackedUserOperation.callGasLimit), { size: 16 }),
  ]);
}

export function getGasLimits(unpackedUserOperation: UserOperation<"v0.7">) {
  return concat([
    pad(toHex(unpackedUserOperation.maxPriorityFeePerGas), {
      size: 16,
    }),
    pad(toHex(unpackedUserOperation.maxFeePerGas), { size: 16 }),
  ]);
}

export function getPaymasterAndData(unpackedUserOperation: UserOperation<"v0.7">) {
  return unpackedUserOperation.paymaster
    ? concat([
        unpackedUserOperation.paymaster,
        pad(toHex(unpackedUserOperation.paymasterVerificationGasLimit || 0n), {
          size: 16,
        }),
        pad(toHex(unpackedUserOperation.paymasterPostOpGasLimit || 0n), {
          size: 16,
        }),
        unpackedUserOperation.paymasterData || ("0x" as Hex),
      ])
    : "0x";
}

export function toPackedUserOperation(unpackedUserOperation: UserOperation<"v0.7">) {
  return {
    sender: unpackedUserOperation.sender,
    nonce: unpackedUserOperation.nonce,
    initCode: getInitCode(unpackedUserOperation),
    callData: unpackedUserOperation.callData,
    accountGasLimits: getAccountGasLimits(unpackedUserOperation),
    preVerificationGas: unpackedUserOperation.preVerificationGas,
    gasFees: getGasLimits(unpackedUserOperation),
    paymasterAndData: getPaymasterAndData(unpackedUserOperation),
    signature: unpackedUserOperation.signature,
  };
}
