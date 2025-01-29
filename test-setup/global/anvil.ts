import { startProxy as startAnvilProxy } from "@viem/anvil";
import { anvilHost, anvilPort } from "../common";
import { execa } from "execa";

// ensure anvil dies
// TODO: maybe don't need this once we move to prool
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());
process.on("SIGQUIT", () => process.exit());

export default async () => {
  console.log("building mock game contracts");
  await execa("pnpm", ["build"], {
    cwd: `${__dirname}/../../test/mock-game-contracts`,
    stdout: "inherit",
    stderr: "inherit",
  });

  console.log("starting anvil proxy");
  return startAnvilProxy({ host: anvilHost, port: anvilPort });
};
