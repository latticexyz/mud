import { scope, type } from "arktype";
import { Hex, Abi, isHex } from "viem";

export const types = scope({
  Bytecode: type("string").narrow(
    (input, ctx): input is Hex => isHex(input, { strict: false }) || ctx.mustBe("a hex string"),
  ),
  Slice: { start: "number", length: "number" },
  LinkReferences: {
    // key is source filename like `src/WorldResourceId.sol`
    "[string]": {
      // key is library name like `WorldResourceIdLib`
      "[string]": "Slice[]",
    },
  },
  ArtifactBytecode: {
    object: "Bytecode",
    "linkReferences?": "LinkReferences",
  },
  Artifact: {
    bytecode: "ArtifactBytecode",
    deployedBytecode: "ArtifactBytecode",
    // TODO: improve narrowing with `isAbi` or import arktype type from abitype (when either are available)
    abi: type("unknown[]").pipe((input) => input as Abi),
    "metadata?": {
      settings: {
        compilationTarget: {
          // key is source filename name like `src/WorldResourceId.sol`
          // value is contract name like `WorldResourceIdLib`
          "[string]": "string",
        },
      },
    },
  },
}).export();
