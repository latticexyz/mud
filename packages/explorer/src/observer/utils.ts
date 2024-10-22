import { Address, encodeAbiParameters, keccak256 } from "viem";

// TODO: type userOperation
export const getUserOperationHashV07 = (userOperation: unknown, entryPointAddress: Address, chainId: number) => {
  const hash = keccak256(
    encodeAbiParameters(
      [
        {
          name: "sender",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "initCode",
          type: "bytes32",
        },
        {
          name: "callData",
          type: "bytes32",
        },
        {
          name: "accountGasLimits",
          type: "bytes32",
        },
        {
          name: "preVerificationGas",
          type: "uint256",
        },
        {
          name: "gasFees",
          type: "bytes32",
        },
        {
          name: "paymasterAndData",
          type: "bytes32",
        },
      ],
      [
        userOperation.sender,
        userOperation.nonce,
        keccak256(userOperation.initCode),
        keccak256(userOperation.callData),
        userOperation.accountGasLimits,
        userOperation.preVerificationGas,
        userOperation.gasFees,
        keccak256(userOperation.paymasterAndData),
      ],
    ),
  );

  return keccak256(
    encodeAbiParameters(
      [
        {
          name: "userOp",
          type: "bytes32",
        },
        {
          name: "entryPointAddress",
          type: "address",
        },
        {
          name: "chainId",
          type: "uint256",
        },
      ],
      [hash, entryPointAddress, BigInt(chainId)],
    ),
  );
};
