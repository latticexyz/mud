import { ChangeEvent, watch } from "turbowatch";
import { ChokidarWatcher } from "./chokidarWatcher";
import { getWorkspaceRoot } from "workspace-tools";

const cwd = process.cwd();
const workspaceRoot = getWorkspaceRoot(cwd);

let previousPackage = "";
const start = Date.now();
const previousTimeMap = new Map<string, number>();
previousTimeMap.set("world", start);
previousTimeMap.set("common", start);
previousTimeMap.set("config", start);
previousTimeMap.set("schema-type", start);
previousTimeMap.set("store", start);
previousTimeMap.set("cli", start);
previousTimeMap.set("std-client", start);
previousTimeMap.set("network", start);
previousTimeMap.set("recs", start);
previousTimeMap.set("solecs", start);
previousTimeMap.set("utils", start);
previousTimeMap.set("ecs-browser", start);
previousTimeMap.set("phaserx", start);
previousTimeMap.set("react", start);
previousTimeMap.set("services", start);
previousTimeMap.set("std-contracts", start);
previousTimeMap.set("noise", start);
previousTimeMap.set("create-mud", start);

const WATCH_DELAY_SECONDS = 10;

watch({
  project: workspaceRoot || "",
  Watcher: ChokidarWatcher,
  triggers: [
    {
      expression: [
        "allof",
        [
          "allof",
          ["not", ["dirname", "node_modules"]],
          ["not", ["dirname", ".turbo"]],
          ["not", ["dirname", "dist"]],
          ["not", ["dirname", "out"]],
          ["not", ["dirname", "abi"]],
          ["not", ["dirname", "types"]],
          ["not", ["dirname", "build"]],
          ["not", ["dirname", "bin"]],
          ["not", ["dirname", "protoc"]],
          ["not", ["dirname", "protobuf"]],
          ["not", ["dirname", "src/mud-definitions"]],
          ["not", ["dirname", ".parcel-cache"]],
        ],
        ["anyof", ["match", "*.sol", "basename"]],
      ],
      name: `turbowatch_sol`,
      interruptible: false,
      initialRun: true,
      persistent: false,
      onChange: async ({ spawn, files, first, abortSignal }: ChangeEvent) => {
        if (first) {
          console.log("Turbowatch started in", Date.now() - start, "ms");
        } else {
          console.log("File change detected", files);
        }
        console.log("Building workspace dependencies");

        const filenameTokens = files[0].name.split("/");
        const index = filenameTokens.lastIndexOf("packages");
        const changedWorkspace = filenameTokens[index + 1];

        const onChangeTime = new Date();
        const timeDiff = (onChangeTime.getTime() - (previousTimeMap.get(changedWorkspace) || Date.now())) / 1000; //in ms
        const seconds = Math.round(timeDiff);

        if (previousPackage != changedWorkspace || seconds > WATCH_DELAY_SECONDS) {
          previousTimeMap.set(changedWorkspace, Date.now());
          previousPackage = changedWorkspace;

          await spawn`turbo build --filter=${changedWorkspace}`;
        }

        if (abortSignal?.aborted) return;
      },
    },
  ],
});
