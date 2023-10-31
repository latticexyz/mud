import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "ecs-relay": "protobuf/ts/ecs-relay/ecs-relay.ts",
    "ecs-snapshot": "protobuf/ts/ecs-snapshot/ecs-snapshot.ts",
    "ecs-stream": "protobuf/ts/ecs-stream/ecs-stream.ts",
    faucet: "ts/faucet/index.ts",
    mode: "protobuf/ts/mode/mode.ts",
  },
  target: "esnext",
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
});
