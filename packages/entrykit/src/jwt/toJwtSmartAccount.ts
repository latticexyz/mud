import {
  type Address,
  type Assign,
  type Client,
  type Hex,
  type LocalAccount,
  decodeFunctionData,
  encodeFunctionData,
  encodeAbiParameters,
} from "viem";
import {
  type SmartAccount,
  type SmartAccountImplementation,
  type UserOperation,
  entryPoint07Abi,
  entryPoint07Address,
  getUserOperationHash,
  toSmartAccount,
} from "viem/account-abstraction";
import { getChainId, signMessage } from "viem/actions";
import { getAction } from "viem/utils";
import { getAccountNonce, getSenderAddress } from "permissionless/actions";

const getAccountInitCode = async (accountSalt: Hex): Promise<Hex> => {
  return encodeFunctionData({
    abi: [
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "salt",
            type: "bytes32",
          },
        ],
        name: "createAccount",
        outputs: [
          {
            internalType: "contract JwtAccount",
            name: "ret",
            type: "address",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "createAccount",
    args: [accountSalt],
  });
};

export type ToJwtSmartAccountParameters = {
  client: Client;
  jwtProof: any;
  signer: LocalAccount;
  factoryAddress?: Address;
  entryPoint?: {
    address: Address;
    version: "0.7";
  };
  address?: Address;
  nonceKey?: bigint;
};

const getFactoryAddress = (factoryAddress?: Address): Address => {
  if (factoryAddress) return factoryAddress;

  return "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44";
};

export type JwtSmartAccountImplementation = Assign<
  SmartAccountImplementation<
    typeof entryPoint07Abi,
    "0.7"
    // {
    //     // entryPoint === ENTRYPOINT_ADDRESS_V06 ? "0.2.2" : "0.3.0-beta"
    //     abi: entryPointVersion extends "0.6" ? typeof BiconomyAbi
    //     factory: { abi: typeof FactoryAbi; address: Address }
    // }
  >,
  { sign: NonNullable<SmartAccountImplementation["sign"]> }
>;

export type ToJwtSmartAccountReturnType = SmartAccount<JwtSmartAccountImplementation>;

/**
 * @description Creates an Account from a jwt proof.
 */
export async function toJwtSmartAccount(parameters: ToJwtSmartAccountParameters): Promise<ToJwtSmartAccountReturnType> {
  const { client, factoryAddress: _factoryAddress, signer, jwtProof, address, nonceKey } = parameters;

  const entryPoint = {
    address: parameters.entryPoint?.address ?? entryPoint07Address,
    abi: entryPoint07Abi,
    version: parameters.entryPoint?.version ?? "0.7",
  } as const;

  const factoryAddress = getFactoryAddress(_factoryAddress);

  let accountAddress: Address | undefined = address;

  let chainId: number;

  const getMemoizedChainId = async () => {
    if (chainId) return chainId;
    chainId = client.chain ? client.chain.id : await getAction(client, getChainId, "getChainId")({});
    return chainId;
  };

  const getFactoryArgs = async () => {
    console.log("getFactoryArgs, salt ", jwtProof.accountSalt);
    return {
      factory: factoryAddress,
      factoryData: await getAccountInitCode(jwtProof.accountSalt),
    };
  };

  return toSmartAccount({
    client,
    entryPoint,
    getFactoryArgs,
    async getAddress() {
      if (accountAddress) return accountAddress;

      const { factory, factoryData } = await getFactoryArgs();

      // Get the sender address based on the init code
      accountAddress = await getSenderAddress(client, {
        factory,
        factoryData,
        entryPointAddress: entryPoint.address,
      });

      return accountAddress;
    },
    async encodeCalls(calls) {
      if (calls.length > 1) {
        return encodeFunctionData({
          abi: [
            {
              inputs: [
                {
                  internalType: "address[]",
                  name: "dest",
                  type: "address[]",
                },
                {
                  internalType: "uint256[]",
                  name: "value",
                  type: "uint256[]",
                },
                {
                  internalType: "bytes[]",
                  name: "func",
                  type: "bytes[]",
                },
              ],
              name: "executeBatch",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "executeBatch",
          args: [calls.map((a) => a.to), calls.map((a) => a.value ?? 0n), calls.map((a) => a.data ?? "0x")],
        });
      }

      const call = calls.length === 0 ? undefined : calls[0];

      if (!call) {
        throw new Error("No calls to encode");
      }

      return encodeFunctionData({
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "dest",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
              {
                internalType: "bytes",
                name: "func",
                type: "bytes",
              },
            ],
            name: "execute",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "execute",
        args: [call.to, call.value ?? 0n, call.data ?? "0x"],
      });
    },
    decodeCalls: async (callData: any) => {
      try {
        const decodedV6 = decodeFunctionData({
          abi: [
            {
              inputs: [
                {
                  internalType: "address[]",
                  name: "dest",
                  type: "address[]",
                },
                {
                  internalType: "bytes[]",
                  name: "func",
                  type: "bytes[]",
                },
              ],
              name: "executeBatch",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          data: callData,
        });

        const calls: {
          to: Address;
          data: Hex;
          value?: bigint;
        }[] = [];

        for (let i = 0; i < decodedV6.args.length; i++) {
          calls.push({
            to: decodedV6.args[0][i],
            data: decodedV6.args[1][i],
            value: 0n,
          });
        }

        return calls;
      } catch (_) {
        try {
          const decodedV7 = decodeFunctionData({
            abi: [
              {
                inputs: [
                  {
                    internalType: "address[]",
                    name: "dest",
                    type: "address[]",
                  },
                  {
                    internalType: "uint256[]",
                    name: "value",
                    type: "uint256[]",
                  },
                  {
                    internalType: "bytes[]",
                    name: "func",
                    type: "bytes[]",
                  },
                ],
                name: "executeBatch",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            data: callData,
          });

          const calls: {
            to: Address;
            data: Hex;
            value?: bigint;
          }[] = [];

          for (let i = 0; i < decodedV7.args[0].length; i++) {
            calls.push({
              to: decodedV7.args[0][i],
              value: decodedV7.args[1][i],
              data: decodedV7.args[2][i],
            });
          }

          return calls;
        } catch (_) {
          const decodedSingle = decodeFunctionData({
            abi: [
              {
                inputs: [
                  {
                    internalType: "address",
                    name: "dest",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "value",
                    type: "uint256",
                  },
                  {
                    internalType: "bytes",
                    name: "func",
                    type: "bytes",
                  },
                ],
                name: "execute",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            data: callData,
          });
          return [
            {
              to: decodedSingle.args[0],
              value: decodedSingle.args[1],
              data: decodedSingle.args[2],
            },
          ];
        }
      }
    },
    async getNonce(args) {
      return getAccountNonce(client, {
        address: await this.getAddress(),
        entryPointAddress: entryPoint.address,
        key: nonceKey ?? args?.key,
      });
    },
    async getStubSignature() {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },
    async sign({ hash }) {
      return this.signMessage({ message: hash });
    },
    signMessage: async (_) => {
      throw new Error("Jwt account isn't 1271 compliant");
    },
    signTypedData: async (_) => {
      throw new Error("Jwt account isn't 1271 compliant");
    },
    async signUserOperation(parameters) {
      const { chainId = await getMemoizedChainId(), ...userOperation } = parameters;
      const hash = getUserOperationHash({
        userOperation: {
          ...userOperation,
          sender: userOperation.sender ?? (await this.getAddress()),
          signature: "0x",
        } as UserOperation<"0.7">,
        entryPointAddress: entryPoint.address,
        entryPointVersion: entryPoint.version,
        chainId,
      });

      const userOpHashSig = await signMessage(client, {
        account: signer,
        message: {
          raw: hash,
        },
      });

      const sig = encodeAbiParameters(
        [
          {
            name: "jwtProof",
            type: "tuple",
            components: [
              { name: "kid", type: "uint256" },
              { name: "iss", type: "string" },
              { name: "azp", type: "string" },
              { name: "publicKeyHash", type: "bytes32" },
              { name: "timestamp", type: "uint256" },
              { name: "maskedCommand", type: "string" },
              { name: "emailNullifier", type: "bytes32" },
              { name: "accountSalt", type: "bytes32" },
              { name: "isCodeExist", type: "bool" },
              { name: "domainName", type: "string" },
              { name: "proof", type: "bytes" },
            ],
          },
          { name: "userOpHashSig", type: "bytes" },
        ],
        [jwtProof, userOpHashSig],
      );

      return sig;
    },
  }) as Promise<ToJwtSmartAccountReturnType>;
}
