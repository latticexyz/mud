import { Provider } from "@ethersproject/providers";
import { Component } from "@latticexyz/solecs";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import { BigNumber, Contract } from "ethers";
import { defaultAbiCoder as abi } from "ethers/lib/utils";

// TODO: Find a way to get this from the contract automatically
enum ContractSchemaValue {
  UINT8,
  UINT256,
  INT64,
  UINT256_ARRAY,
  BYTES,
}

const ContractSchemaValueId: { [key: number]: string } = {
  [ContractSchemaValue.UINT8]: "uint8",
  [ContractSchemaValue.UINT256]: "uint256", // This might have to be represented as a string
  [ContractSchemaValue.INT64]: "int64",
  [ContractSchemaValue.UINT256_ARRAY]: "uint256[]", // TODO: Not sure if automatically decoding this is possible
  [ContractSchemaValue.BYTES]: "bytes",
};

type ContractSchemaValueType = {
  [ContractSchemaValue.UINT8]: number;
  [ContractSchemaValue.UINT256]: number; // This might have to be represented as a string
  [ContractSchemaValue.INT64]: number;
  [ContractSchemaValue.UINT256_ARRAY]: number[];
  [ContractSchemaValue.BYTES]: string;
};

function isRepresentable(value: BigNumber) {
  return value.lte(0x1fffffffffffff - 1); // This is the MAX_SAFE number used in BigNumber.from()
}

// TODO: separate constructing the decoder function and fetching the schema, then add tests for constructing the decoder function
export async function createDecoder<V = unknown>(
  componentContractAddress: string,
  provider: Provider
): Promise<(data: string) => V> {
  const componentContract = new Contract(componentContractAddress, ComponentAbi.abi, provider) as Component;
  const [keys, values] = await componentContract.getSchema();
  console.log("Schema", keys, values);

  return (data: string) => {
    // Decode data with the schema values provided by the component
    const decoded = abi.decode(
      values.map((value) => ContractSchemaValueId[value]),
      data
    );

    // Contruct the client component value
    // TODO: This does not take into account schemas without keys, should we support them? Need to add support in client libraries
    const result: { [key: string]: unknown } = {};
    for (let i = 0; i < keys.length; i++) {
      const value = decoded[i];
      result[keys[i]] = BigNumber.isBigNumber(value)
        ? isRepresentable(value)
          ? value.toNumber()
          : value.toHexString()
        : value;
    }

    console.log("Decoded", data, "to", result);
    return result as unknown as V;
  };
}
