import type { Arguments, CommandBuilder } from "yargs";
import { FaucetServiceDefinition } from "@latticexyz/services/protobuf/ts/faucet/faucet";
import { createChannel, createClient } from "nice-grpc-web";
import chalk from "chalk";

type Options = {
  dripDev?: boolean;
  faucetUrl: string;
  address: string;
};

export const command = "faucet";
export const desc = "Interact with a MUD faucet";

/**
 * Create a FaucetServiceClient
 * @param url FaucetService URL
 * @returns FaucetServiceClient
 */
export function createFaucetService(url: string) {
  return createClient(FaucetServiceDefinition, createChannel(url));
}

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
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

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { dripDev, faucetUrl, address } = argv;

  const faucet = createFaucetService(faucetUrl);

  if (dripDev) {
    console.log(chalk.yellow("Dripping to", address));
    await faucet.dripDev({ address });
    console.log(chalk.yellow("Success"));
  }

  process.exit(0);
};
