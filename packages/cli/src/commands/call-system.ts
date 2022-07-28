import { defaultAbiCoder as abi } from "ethers/lib/utils";
import { Arguments, CommandBuilder } from "yargs";
import { execLog } from "../utils";

type Options = {
  rpc?: string;
  caller?: string;
  world: string;
  systemId?: string;
  systemAddress?: string;
  argTypes?: any[];
  args?: any[];
  calldata?: string;
  broadcast?: boolean;
  callerPrivateKey?: string;
  debug?: boolean;
};

export const command = "call-system";
export const desc = "Execute a mud system";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    rpc: { type: "string", description: "json rpc endpoint, defaults to http://localhost:8545" },
    caller: { type: "string", description: "caller address" },
    world: { type: "string", required: true, description: "world contract address" },
    systemId: { type: "string", description: "system id preimage (eg mud.system.Move)" },
    systemAddress: { type: "string", description: "system address (alternative to system id)" },
    argTypes: { type: "array", description: "system argument types for abi encoding" },
    args: { type: "array", description: "system arguments" },
    calldata: { type: "string", description: "abi encoded system arguments (instead of args/argTypes)" },
    broadcast: { type: "boolean", description: "send txs to the chain" },
    callerPrivateKey: {
      type: "string",
      description: "must be set if broadcast is set, must correspond to caller address",
    },
    debug: { type: "boolean", description: "open debugger" },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { rpc, caller, world, systemId, argTypes, args, calldata, broadcast, callerPrivateKey, debug } = argv;
  const encodedArgs = calldata ?? (argTypes && args && abi.encode(argTypes, args)) ?? "";
  await execLog("forge", [
    "script",
    "--fork-url",
    rpc ?? "http://localhost:8545", // default anvil rpc
    "--sig",
    "debug(address,address,string,bytes,bool)",
    "src/test/utils/Debug.sol", // the cli expects the Debug.sol file at this path
    caller ?? "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // default anvil deployer
    world,
    systemId || "",
    encodedArgs,
    broadcast ? "true" : "false",
    "-vvvvv",
    broadcast ? "--broadcast" : "",
    callerPrivateKey ? `--private-key ${callerPrivateKey}` : "",
    debug ? "--debug" : "",
  ]);

  process.exit(0);
};
