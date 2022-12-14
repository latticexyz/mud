import type { Arguments, CommandBuilder } from "yargs";
import { spawnSync } from "node:child_process";
import fs from 'fs';
import path from 'path';
import chalk from "chalk";

import {readdirSync} from 'fs';
type Options = {
  components: string;
  systems: string;
  outdir: string;
};

export const command = "gen-deploy";
export const desc =
  "generate deploy.json from smart contracts";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    components: { type: "string", default: "./src/components", desc: "path to components dir" },
    systems: { type: "string", default: "./src/systems", desc: "path to systems dir" },
    outdir: { type: "string", default: "./deploy.json",desc: "output path" },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const depployJson:any= {};
  const { components, systems, outdir } = args;
  console.log("procesing...");
  const comp = readdirSync(components);

  const comps = comp.map(function(e) { 
    e = e.replace('.sol',''); 
    return e;
  });
  depployJson.components = comps

  const sys = readdirSync(systems).filter(c => c.includes(".sol"));
  const syss = sys.map(function(e) { 
    const route = path.resolve(systems, e);
    // give write access to any components that each system touch. even if it not actaully write
    const out = spawnSync("forge",["flatten" ,route]);
    const flatCode = out.stdout.toString()
    const used = comps.filter(c => flatCode.includes(c))
    return {
            "name": e.replace(".sol",""),
            "writeAccess": used
        };
  });
  depployJson.systems = syss

  const deployJsonStr = JSON.stringify(depployJson, undefined, 4);
  fs.writeFileSync(outdir, deployJsonStr, 'utf8');
  console.log("write output to", outdir)
  console.warn(chalk.yellow.bold("Warning: this function may grant more write access than necessary. It is recommended to manually remove any unnecessary permissions."))
  process.exit(0);
};
