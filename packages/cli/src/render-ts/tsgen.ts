import path from "path";
import { MUDCoreConfig } from "@latticexyz/config";
import { formatAndWriteTypescript } from "@latticexyz/common/codegen";
import { getRecsV1TableOptions } from "../render-ts/recsV1TableOptions";
import { renderRecsV1Tables } from "../render-ts/renderRecsV1Tables";

export async function tsgen(config: MUDCoreConfig, outDirectory: string) {
  const fullOutputPath = path.join(outDirectory, `contractComponents.ts`);
  const options = getRecsV1TableOptions(config);
  const output = renderRecsV1Tables(options);
  formatAndWriteTypescript(output, fullOutputPath, "Generated ts definition files");
}
