# Change Log

## 2.0.10

## 2.0.9

## 2.0.8

## 2.0.7

## 2.0.6

## 2.0.5

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

## 2.0.0

### Major Changes

- aabd30767: Bumped Solidity version to 0.8.24.
- 92de59982: Bump Solidity version to 0.8.21
- 9af542d3e: Renames `mud-gas-report` binary to `gas-report`, since it's no longer MUD specific.

### Minor Changes

- 66cc35a8c: Create gas-report package, move gas-report cli command and GasReporter contract to it
- 4385c5a4c: Allow the `gas-report` CLI to parse logs via `stdin`, so it can be used with custom test commands (e.g. `mud test`).

  Usage:

  ```sh
  # replace `forge test -vvv` with the custom test command
  GAS_REPORTER_ENABLED=true forge test -vvv | pnpm gas-report --stdin
  ```

- 90d0d79c: Now uses `--isolate` flag in `forge test` for more accurate gas measurement.

### Patch Changes

- ba17bdab5: Pass through `stdin` logs in `gas-report`. Since the script piping in logs to `gas-report` can be long-running, it is useful to see its logs to know if it's stalling.
- 48909d151: bump forge-std and ds-test dependencies
- 590542030: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- a02da555b: Fixed gas report parsing for foundry versions released after 2024-02-15.

## 2.0.0-next.18

### Minor Changes

- 90d0d79c: Now uses `--isolate` flag in `forge test` for more accurate gas measurement.

### Patch Changes

- a02da555b: Fixed gas report parsing for foundry versions released after 2024-02-15.

## 2.0.0-next.17

### Major Changes

- aabd3076: Bumped Solidity version to 0.8.24.

## 2.0.0-next.16

## 2.0.0-next.15

### Patch Changes

- 59054203: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.

## 2.0.0-next.14

## 2.0.0-next.13

## 2.0.0-next.12

## 2.0.0-next.11

### Minor Changes

- 4385c5a4: Allow the `gas-report` CLI to parse logs via `stdin`, so it can be used with custom test commands (e.g. `mud test`).

  Usage:

  ```sh
  # replace `forge test -vvv` with the custom test command
  GAS_REPORTER_ENABLED=true forge test -vvv | pnpm gas-report --stdin
  ```

### Patch Changes

- ba17bdab: Pass through `stdin` logs in `gas-report`. Since the script piping in logs to `gas-report` can be long-running, it is useful to see its logs to know if it's stalling.

## 2.0.0-next.10

## 2.0.0-next.9

### Major Changes

- [#1473](https://github.com/latticexyz/mud/pull/1473) [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a) Thanks [@holic](https://github.com/holic)! - Bump Solidity version to 0.8.21

## 2.0.0-next.8

## 2.0.0-next.7

## 2.0.0-next.6

### Major Changes

- [#1410](https://github.com/latticexyz/mud/pull/1410) [`9af542d3`](https://github.com/latticexyz/mud/commit/9af542d3e29e2699144534dec3430e19294077d4) Thanks [@holic](https://github.com/holic)! - Renames `mud-gas-report` binary to `gas-report`, since it's no longer MUD specific.

## 2.0.0-next.5

## 2.0.0-next.4

## 2.0.0-next.3

## 2.0.0-next.2

## 2.0.0-next.1

## 2.0.0-next.0

### Minor Changes

- [#1147](https://github.com/latticexyz/mud/pull/1147) [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11) Thanks [@dk1a](https://github.com/dk1a)! - Create gas-report package, move gas-report cli command and GasReporter contract to it

### Patch Changes

- [#1168](https://github.com/latticexyz/mud/pull/1168) [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b) Thanks [@dk1a](https://github.com/dk1a)! - bump forge-std and ds-test dependencies

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.
