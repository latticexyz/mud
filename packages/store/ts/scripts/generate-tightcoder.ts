import { formatAndWriteSolidity } from "@latticexyz/common/codegen";
import { renderDecodeSlice, renderEncodeArray, renderTightCoderAutoTest } from "../codegen/tightcoder";

await formatAndWriteSolidity(renderDecodeSlice(), "src/tightcoder/DecodeSlice.sol", "Generated DecodeSlice");
await formatAndWriteSolidity(renderEncodeArray(), "src/tightcoder/EncodeArray.sol", "Generated EncodeArray");
await formatAndWriteSolidity(
  renderTightCoderAutoTest(),
  "test/tightcoder/TightCoderAuto.t.sol",
  "Generated TightCoderAutoTest"
);
