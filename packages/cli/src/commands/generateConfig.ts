import { formatAndWriteTypescript } from "@latticexyz/common/codegen";
import type { CommandModule, InferredOptionTypes } from "yargs";

const generateConfigOptions = {
  worldAddress: { type: "string", required: true, desc: "Verify an existing World at the given address" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
} as const;

type Options = InferredOptionTypes<typeof generateConfigOptions>;

const commandModule: CommandModule<Options, Options> = {
  command: "generate-config",

  describe: "Generate a MUD config given a world address",

  builder(yargs) {
    return yargs.options(generateConfigOptions);
  },

  async handler() {
    const tables = {
      CounterTable: {
        schema: {
          value: "uint32",
        },
        key: [],
        codegen: { storeArgument: true },
      },
      MessageTable: {
        type: "offchainTable",
        schema: {
          value: "string",
        },
        key: [],
      },
      Inventory: {
        schema: {
          owner: "address",
          item: "uint32",
          itemVariant: "uint32",
          amount: "uint32",
        },
        key: ["owner", "item", "itemVariant"],
      },
    };

    formatAndWriteTypescript(
      `
      import { defineWorld } from "@latticexyz/world";
      
      export default defineWorld({
        tables: ${JSON.stringify(tables)}
      });
      `,
      "world.config.ts",
      "generating MUD config from world",
    );
  },
};

export default commandModule;
