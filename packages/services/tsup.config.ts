import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "ecs-relay": "protobuf/ts/ecs-relay/ecs-relay.ts",
    "ecs-snapshot": "protobuf/ts/ecs-snapshot/ecs-snapshot.ts",
    "ecs-stream": "protobuf/ts/ecs-stream/ecs-stream.ts",
    faucet: "protobuf/ts/faucet/faucet.ts",
    mode: "protobuf/ts/mode/mode.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
});
