import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  enums: {
    Colors: ["None", "Red", "Yellow", "Green", "Blue"],
    DogBreeds: ["None", "Corgi", "Poodle", "Husky"],
  },
  tables: {
    NumberList: {
      keySchema: {},
      schema: {
        value: "uint32[]",
      },
    },
    KeyTupleEncoding: {
      keySchema: {
        bigint: "uint256",
        signed: "int32",
        halfBytes: "bytes16",
        sender: "address",
        isTrue: "bool",
        color: "Colors",
        dogBreed: "DogBreeds",
      },
      schema: "bool",
    },
  },
});
