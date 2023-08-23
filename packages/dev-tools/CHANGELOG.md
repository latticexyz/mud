# @latticexyz/dev-tools

## 2.0.0-next.3

### Patch Changes

- Updated dependencies [[`952cd534`](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57), [`bb6ada74`](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e), [`c32a9269`](https://github.com/latticexyz/mud/commit/c32a9269a30c1898932ebbf7e3b60e25d1bd884c), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1), [`d5b73b12`](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd), [`433078c5`](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db), [`afaf2f5f`](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab), [`3e024fcf`](https://github.com/latticexyz/mud/commit/3e024fcf395a1c1b38d12362fc98472290eb7cf1), [`0d12db8c`](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61), [`331f0d63`](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)]:
  - @latticexyz/store@2.0.0-next.3
  - @latticexyz/world@2.0.0-next.3
  - @latticexyz/common@2.0.0-next.3
  - @latticexyz/store-sync@2.0.0-next.3
  - @latticexyz/react@2.0.0-next.3
  - @latticexyz/recs@2.0.0-next.3
  - @latticexyz/utils@2.0.0-next.3

## 2.0.0-next.2

### Major Changes

- [#1284](https://github.com/latticexyz/mud/pull/1284) [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad) Thanks [@holic](https://github.com/holic)! - MUD dev tools is updated to latest sync stack. You must now pass in all of its data requirements rather than relying on magic globals.

  ```diff
  import { mount as mountDevTools } from "@latticexyz/dev-tools";

  - mountDevTools();
  + mountDevTools({
  +   config,
  +   publicClient,
  +   walletClient,
  +   latestBlock$,
  +   blockStorageOperations$,
  +   worldAddress,
  +   worldAbi,
  +   write$,
  +   // if you're using recs
  +   recsWorld,
  + });
  ```

  It's also advised to wrap dev tools so that it is only mounted during development mode. Here's how you do this with Vite:

  ```ts
  // https://vitejs.dev/guide/env-and-mode.html
  if (import.meta.env.DEV) {
    mountDevTools({ ... });
  }
  ```

### Patch Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

- [#1240](https://github.com/latticexyz/mud/pull/1240) [`753bdce4`](https://github.com/latticexyz/mud/commit/753bdce41597200641daba60727ff1b53d2b512e) Thanks [@holic](https://github.com/holic)! - Store sync logic is now consolidated into a `createStoreSync` function exported from `@latticexyz/store-sync`. This simplifies each storage sync strategy to just a simple wrapper around the storage adapter. You can now sync to RECS with `syncToRecs` or SQLite with `syncToSqlite` and PostgreSQL support coming soon.

  There are no breaking changes if you were just using `syncToRecs` from `@latticexyz/store-sync` or running the `sqlite-indexer` binary from `@latticexyz/store-indexer`.

- [#1302](https://github.com/latticexyz/mud/pull/1302) [`5294a7d5`](https://github.com/latticexyz/mud/commit/5294a7d5983c52cb336373566afd6a8ec7fc4bfb) Thanks [@holic](https://github.com/holic)! - Improves support for internal/client-only RECS components

- Updated dependencies [[`a2588116`](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062), [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`48c51b52`](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`753bdce4`](https://github.com/latticexyz/mud/commit/753bdce41597200641daba60727ff1b53d2b512e), [`5294a7d5`](https://github.com/latticexyz/mud/commit/5294a7d5983c52cb336373566afd6a8ec7fc4bfb), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad)]:
  - @latticexyz/store@2.0.0-next.2
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/store-sync@2.0.0-next.2
  - @latticexyz/world@2.0.0-next.2
  - @latticexyz/react@2.0.0-next.2
  - @latticexyz/recs@2.0.0-next.2
  - @latticexyz/utils@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- [#1258](https://github.com/latticexyz/mud/pull/1258) [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7) Thanks [@holic](https://github.com/holic)! - Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

- Updated dependencies [[`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`e259ef79`](https://github.com/latticexyz/mud/commit/e259ef79f4d9026353176d0f74628cae50c2f69b), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`afdba793`](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/std-client@2.0.0-next.1
  - @latticexyz/network@2.0.0-next.1
  - @latticexyz/world@2.0.0-next.1
  - @latticexyz/react@2.0.0-next.1
  - @latticexyz/utils@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`a7b30c79`](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda), [`4e4a3415`](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee), [`e019c776`](https://github.com/latticexyz/mud/commit/e019c77619f0ace6b7ee01f6ce96498446895934)]:
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/world@2.0.0-next.0
  - @latticexyz/utils@2.0.0-next.0
  - @latticexyz/network@2.0.0-next.0
  - @latticexyz/std-client@2.0.0-next.0
  - @latticexyz/react@2.0.0-next.0
