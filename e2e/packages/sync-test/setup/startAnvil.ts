import { ExecaChildProcess, execa } from "execa";

export function startAnvil(port: number): ExecaChildProcess {
  return execa("anvil", [
    "-b",
    "1",
    "--block-base-fee-per-gas",
    "0",
    "--gas-limit",
    "20000000",
    "--port",
    String(port),
  ]);
}
