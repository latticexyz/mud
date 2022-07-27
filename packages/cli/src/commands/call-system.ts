import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { Arguments, CommandBuilder } from "yargs";
import { execLog } from "../utils";

type Options = {
  rpc?: string;
  caller?: string;
  world: string;
  system: string;
  argTypes: any[];
  args: any[];
  broadcast?: boolean;
  callerPrivateKey?: string;
  debug?: boolean;
};

export const command = "call-system";
export const desc = "Call mud system";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    rpc: { type: "string" },
    caller: { type: "string" },
    world: { type: "string", required: true },
    system: { type: "string", required: true },
    argTypes: { type: "array", required: true },
    args: { type: "array", required: true },
    broadcast: { type: "boolean" },
    callerPrivateKey: { type: "string" },
    debug: { type: "boolean" },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { rpc, caller, world, system, argTypes, args, broadcast, callerPrivateKey, debug } = argv;
  const encodedArgs = abi.encode(argTypes, args);
  await execLog("forge", [
    "script",
    "--fork-url",
    rpc ?? "http://localhost:8545", // default anvil rpc
    "--sig",
    "debug(address,address,string,bytes,bool)",
    "src/test/utils/Debug.sol", // the cli expects the Debug.sol file at this path
    caller ?? "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // default anvil deployer
    world,
    system,
    encodedArgs,
    broadcast ? "true" : "false",
    "-vvvvv",
    broadcast ? "--broadcast" : "",
    callerPrivateKey ? `--private-key ${callerPrivateKey}` : "",
    debug ? "--debug" : "",
  ]);

  process.exit(0);
};
