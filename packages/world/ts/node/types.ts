import { type } from "arktype";

export const bytecode = type("string").narrow(
  (input, ctx): input is `0x${string}` => input.startsWith("0x") || ctx.mustBe("a hex string"),
);

export const slice = type({ start: "number", length: "number" }).readonly();

export const linkReferences = type({
  // key is source filename like `src/WorldResourceId.sol`
  // TODO: support for named generic keys?
  "[string]": type({
    // key is library name like `WorldResourceIdLib`
    // TODO: support for named generic keys?
    "[string]": slice.array().readonly(),
  }).readonly(),
}).readonly();

export const artifactBytecode = type({
  object: bytecode,
  // "compilationTarget":{"src/World.sol":"World"}
  "linkReferences?": linkReferences,
}).readonly();

// TODO: finish specifying this type
export const artifact = type({
  bytecode: artifactBytecode,
  deployedBytecode: artifactBytecode,
  // TODO
  abi: "unknown[]",
  metadata: type({
    // TODO: figure out if this is optional
    settings: type({
      // TODO: figure out if this is optional
      compilationTarget: type({
        // key is source filename name like `src/WorldResourceId.sol`
        // value is contract name like `WorldResourceIdLib`
        "[string]": "string",
      }).readonly(),
    }).readonly(),
  }).readonly(),
}).readonly();

export const parseArtifact = type("parse.json").to(artifact);

export function unwrap<T>(input: type.errors | T): T {
  return input instanceof type.errors ? input.throw() : input;
}
