import type { CommandModule } from "yargs";
import { FaucetServiceDefinition } from "@latticexyz/services/protobuf/ts/faucet/faucet";
import { createChannel, createClient } from "nice-grpc-web";
import chalk from "chalk";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";

type Options = {
  dripDev?: boolean;
  faucetUrl: string;
  address: string;
};

/**
 * Create a FaucetServiceClient
 * @param url FaucetService URL
 * @returns FaucetServiceClient
 */
function createFaucetService(url: string) {
  return createClient(FaucetServiceDefinition, createChannel(url, NodeHttpTransport()));
}

const commandModule: CommandModule<Options, Options> = {
  command: "faucet",

  describe: "Interact with a MUD faucet",

  builder(yargs) {
    return yargs.options({
      dripDev: {
        type: "boolean",
        desc: "Request a drip from the dev endpoint (requires faucet to have dev mode enabled)",
        default: true,
      },
      faucetUrl: {
        type: "string",
        desc: "URL of the MUD faucet",
        default: "https://faucet.testnet-mud-services.linfra.xyz",
      },
      address: {
        type: "string",
        desc: "Ethereum address to fund",
        required: true,
      },
    });
  },

  async handler({ dripDev, faucetUrl, address }) {
    const faucet = createFaucetService(faucetUrl);

    if (dripDev) {
      console.log(chalk.yellow("Dripping to", address));
      await faucet.dripDev({ address });
      console.log(chalk.yellow("Success"));
    }

    process.exit(0);
  },
};

export default commandModule;
