# Change Log

## 2.2.22

### Patch Changes

- @latticexyz/store@2.2.22
- @latticexyz/recs@2.2.22

## 2.2.21

### Patch Changes

- @latticexyz/store@2.2.21
- @latticexyz/recs@2.2.21

## 2.2.20

### Patch Changes

- Updated dependencies [06e48e0]
  - @latticexyz/store@2.2.20
  - @latticexyz/recs@2.2.20

## 2.2.19

### Patch Changes

- @latticexyz/recs@2.2.19
- @latticexyz/store@2.2.19

## 2.2.18

### Patch Changes

- Updated dependencies [5d6fb1b]
  - @latticexyz/store@2.2.18
  - @latticexyz/recs@2.2.18

## 2.2.17

### Patch Changes

- @latticexyz/store@2.2.17
- @latticexyz/recs@2.2.17

## 2.2.16

### Patch Changes

- @latticexyz/recs@2.2.16
- @latticexyz/store@2.2.16

## 2.2.15

### Patch Changes

- Updated dependencies [09e9bd5]
- Updated dependencies [1b477d4]
- Updated dependencies [09536b0]
  - @latticexyz/store@2.2.15
  - @latticexyz/recs@2.2.15

## 2.2.14

### Patch Changes

- @latticexyz/recs@2.2.14
- @latticexyz/store@2.2.14

## 2.2.13

### Patch Changes

- @latticexyz/store@2.2.13
- @latticexyz/recs@2.2.13

## 2.2.12

### Patch Changes

- Updated dependencies [ea18f27]
  - @latticexyz/store@2.2.12
  - @latticexyz/recs@2.2.12

## 2.2.11

### Patch Changes

- Updated dependencies [7ddcf64]
- Updated dependencies [13e5689]
  - @latticexyz/store@2.2.11
  - @latticexyz/recs@2.2.11

## 2.2.10

### Patch Changes

- @latticexyz/recs@2.2.10
- @latticexyz/store@2.2.10

## 2.2.9

### Patch Changes

- @latticexyz/recs@2.2.9
- @latticexyz/store@2.2.9

## 2.2.8

### Patch Changes

- @latticexyz/store@2.2.8
- @latticexyz/recs@2.2.8

## 2.2.7

### Patch Changes

- Updated dependencies [a08ba5e]
  - @latticexyz/store@2.2.7
  - @latticexyz/recs@2.2.7

## 2.2.6

### Patch Changes

- @latticexyz/recs@2.2.6
- @latticexyz/store@2.2.6

## 2.2.5

### Patch Changes

- @latticexyz/recs@2.2.5
- @latticexyz/store@2.2.5

## 2.2.4

### Patch Changes

- Updated dependencies [50010fb]
  - @latticexyz/store@2.2.4
  - @latticexyz/recs@2.2.4

## 2.2.3

### Patch Changes

- @latticexyz/recs@2.2.3
- @latticexyz/store@2.2.3

## 2.2.2

### Patch Changes

- @latticexyz/recs@2.2.2
- @latticexyz/store@2.2.2

## 2.2.1

### Patch Changes

- @latticexyz/store@2.2.1
- @latticexyz/recs@2.2.1

## 2.2.0

### Patch Changes

- Updated dependencies [04c675c]
  - @latticexyz/store@2.2.0
  - @latticexyz/recs@2.2.0

## 2.1.1

### Patch Changes

- Updated dependencies [9e21e42]
- Updated dependencies [57bf8c3]
  - @latticexyz/store@2.1.1
  - @latticexyz/recs@2.1.1

## 2.1.0

### Patch Changes

- Updated dependencies [24e285d]
- Updated dependencies [7129a16]
- Updated dependencies [e85dc53]
- Updated dependencies [a10b453]
- Updated dependencies [69eb63b]
- Updated dependencies [fb1cfef]
  - @latticexyz/store@2.1.0
  - @latticexyz/recs@2.1.0

## 2.0.12

### Patch Changes

- 96e7bf430: TS source has been removed from published packages in favor of DTS in an effort to improve TS performance. All packages now inherit from a base TS config in `@latticexyz/common` to allow us to continue iterating on TS performance without requiring changes in your project code.

  If you have a MUD project that you're upgrading, we suggest adding a `tsconfig.json` file to your project workspace that extends this base config.

  ```sh
  pnpm add -D @latticexyz/common
  echo "{\n  \"extends\": \"@latticexyz/common/tsconfig.base.json\"\n}" > tsconfig.json
  ```

  Then in each package of your project, inherit from your workspace root's config.

  For example, your TS config in `packages/contracts/tsconfig.json` might look like:

  ```json
  {
    "extends": "../../tsconfig.json"
  }
  ```

  And your TS config in `packages/client/tsconfig.json` might look like:

  ```json
  {
    "extends": "../../tsconfig.json",
    "compilerOptions": {
      "types": ["vite/client"],
      "target": "ESNext",
      "lib": ["ESNext", "DOM"],
      "jsx": "react-jsx",
      "jsxImportSource": "react"
    },
    "include": ["src"]
  }
  ```

  You may need to adjust the above configs to include any additional TS options you've set. This config pattern may also reveal new TS errors that need to be fixed or rules disabled.

  If you want to keep your existing TS configs, we recommend at least updating your `moduleResolution` setting.

  ```diff
  -"moduleResolution": "node"
  +"moduleResolution": "Bundler"
  ```

- Updated dependencies [c10c9fb2d]
- Updated dependencies [c10c9fb2d]
- Updated dependencies [96e7bf430]
  - @latticexyz/store@2.0.12
  - @latticexyz/recs@2.0.12

## 2.0.11

### Patch Changes

- @latticexyz/recs@2.0.11
- @latticexyz/store@2.0.11

## 2.0.10

### Patch Changes

- Updated dependencies [4e4e9104]
- Updated dependencies [32c1cda6]
- Updated dependencies [4caca05e]
- Updated dependencies [27f888c7]
  - @latticexyz/store@2.0.10
  - @latticexyz/recs@2.0.10

## 2.0.9

### Patch Changes

- @latticexyz/store@2.0.9
- @latticexyz/recs@2.0.9

## 2.0.8

### Patch Changes

- @latticexyz/store@2.0.8
- @latticexyz/recs@2.0.8

## 2.0.7

### Patch Changes

- Updated dependencies [ed404b7d]
  - @latticexyz/store@2.0.7
  - @latticexyz/recs@2.0.7

## 2.0.6

### Patch Changes

- Updated dependencies [103db6ce]
- Updated dependencies [9720b568]
- Updated dependencies [c18e93c5]
- Updated dependencies [d95028a6]
  - @latticexyz/store@2.0.6
  - @latticexyz/recs@2.0.6

## 2.0.5

### Patch Changes

- Updated dependencies [b798ccb2]
  - @latticexyz/store@2.0.5
  - @latticexyz/recs@2.0.5

## 2.0.4

### Patch Changes

- @latticexyz/store@2.0.4
- @latticexyz/recs@2.0.4

## 2.0.3

### Patch Changes

- @latticexyz/store@2.0.3
- @latticexyz/recs@2.0.3

## 2.0.2

### Patch Changes

- @latticexyz/recs@2.0.2
- @latticexyz/store@2.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [4a6b4598]
  - @latticexyz/store@2.0.1
  - @latticexyz/recs@2.0.1

## 2.0.0

### Major Changes

- e3de1a338: Removes `useRow` and `useRows` hooks, previously powered by `store-cache`, which is now deprecated. Please use `recs` and the corresponding `useEntityQuery` and `useComponentValue` hooks. We'll have more hooks soon for SQL.js sync backends.

### Minor Changes

- 939916bcd: Adds a `usePromise` hook that returns a [native `PromiseSettledResult` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled).

  ```tsx
  const promise = fetch(url);
  const result = usePromise(promise);

  if (result.status === "idle" || result.status === "pending") {
    return <>fetching</>;
  }

  if (result.status === "rejected") {
    return <>error fetching: {String(result.reason)}</>;
  }

  if (result.status === "fulfilled") {
    return <>fetch status: {result.value.status}</>;
  }
  ```

### Patch Changes

- 01e46d99: Removed some unused files, namely `curry` in `@latticexyz/common` and `useDeprecatedComputedValue` from `@latticexyz/react`.
- 590542030: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 9ef3f9a7c: Fixed an issue where `useComponentValue` would not detect a change and re-render if the component value was immediately removed.
- Updated dependencies [7ce82b6fc]
- Updated dependencies [d8c8f66bf]
- Updated dependencies [c6c13f2ea]
- Updated dependencies [1b86eac05]
- Updated dependencies [a35c05ea9]
- Updated dependencies [c9ee5e4a]
- Updated dependencies [c963b46c7]
- Updated dependencies [05b3e8882]
- Updated dependencies [ce7125a1b]
- Updated dependencies [aea67c580]
- Updated dependencies [07dd6f32c]
- Updated dependencies [c14f8bf1e]
- Updated dependencies [90e4161bb]
- Updated dependencies [aabd30767]
- Updated dependencies [331dbfdcb]
- Updated dependencies [1d60930d6]
- Updated dependencies [f9f9609ef]
- Updated dependencies [904fd7d4e]
- Updated dependencies [e6c03a87a]
- Updated dependencies [1077c7f53]
- Updated dependencies [2c920de7]
- Updated dependencies [b9e562d8f]
- Updated dependencies [44236041f]
- Updated dependencies [759514d8b]
- Updated dependencies [952cd5344]
- Updated dependencies [d5094a242]
- Updated dependencies [a25881160]
- Updated dependencies [c4d5eb4e4]
- Updated dependencies [f62c767e7]
- Updated dependencies [9aa5e786]
- Updated dependencies [de151fec0]
- Updated dependencies [37c228c63]
- Updated dependencies [c991c71a]
- Updated dependencies [ae340b2bf]
- Updated dependencies [1bf2e9087]
- Updated dependencies [211be2a1e]
- Updated dependencies [0f3e2e02b]
- Updated dependencies [d08789282]
- Updated dependencies [5c965a919]
- Updated dependencies [f99e88987]
- Updated dependencies [d5b73b126]
- Updated dependencies [190fdd11]
- Updated dependencies [433078c54]
- Updated dependencies [b2d2aa715]
- Updated dependencies [83583a505]
- Updated dependencies [5e723b90e]
- Updated dependencies [6573e38e9]
- Updated dependencies [afaf2f5ff]
- Updated dependencies [37c228c63]
- Updated dependencies [37c228c63]
- Updated dependencies [44a5432ac]
- Updated dependencies [6e66c5b74]
- Updated dependencies [8d51a0348]
- Updated dependencies [1e2ad78e2]
- Updated dependencies [65c9546c4]
- Updated dependencies [48909d151]
- Updated dependencies [7b28d32e5]
- Updated dependencies [590542030]
- Updated dependencies [48c51b52a]
- Updated dependencies [9f8b84e73]
- Updated dependencies [66cc35a8c]
- Updated dependencies [672d05ca1]
- Updated dependencies [55a05fd7a]
- Updated dependencies [63831a264]
- Updated dependencies [6db95ce15]
- Updated dependencies [8193136a9]
- Updated dependencies [5d737cf2e]
- Updated dependencies [a7b30c79b]
- Updated dependencies [92de59982]
- Updated dependencies [22ee44700]
- Updated dependencies [ad4ac4459]
- Updated dependencies [be313068b]
- Updated dependencies [ac508bf18]
- Updated dependencies [93390d89]
- Updated dependencies [bb91edaa0]
- Updated dependencies [144c0d8d]
- Updated dependencies [5ac4c97f4]
- Updated dependencies [bfcb293d1]
- Updated dependencies [1890f1a06]
- Updated dependencies [e48171741]
- Updated dependencies [9b43029c3]
- Updated dependencies [37c228c63]
- Updated dependencies [55ab88a60]
- Updated dependencies [c58da9ad]
- Updated dependencies [37c228c63]
- Updated dependencies [535229984]
- Updated dependencies [af639a264]
- Updated dependencies [5e723b90e]
- Updated dependencies [99ab9cd6f]
- Updated dependencies [0d12db8c2]
- Updated dependencies [c049c23f4]
- Updated dependencies [80dd6992e]
- Updated dependencies [60cfd089f]
- Updated dependencies [24a6cd536]
- Updated dependencies [37c228c63]
- Updated dependencies [708b49c50]
- Updated dependencies [3ac68ade6]
- Updated dependencies [22ba7b675]
- Updated dependencies [3042f86e]
- Updated dependencies [5e71e1cb5]
- Updated dependencies [d7b1c588a]
- Updated dependencies [5c52bee09]
- Updated dependencies [8025c3505]
- Updated dependencies [745485cda]
- Updated dependencies [afdba793f]
- Updated dependencies [37c228c63]
- Updated dependencies [3e7d83d0]
- Updated dependencies [cea754dde]
- Updated dependencies [cc2c8da00]
- Updated dependencies [252a1852]
- Updated dependencies [103f635eb]
  - @latticexyz/store@2.0.0
  - @latticexyz/recs@2.0.0

## 2.0.0-next.18

### Patch Changes

- 01e46d99: Removed some unused files, namely `curry` in `@latticexyz/common` and `useDeprecatedComputedValue` from `@latticexyz/react`.
- Updated dependencies [c9ee5e4a]
- Updated dependencies [2c920de7]
- Updated dependencies [44236041]
- Updated dependencies [9aa5e786]
- Updated dependencies [c991c71a]
- Updated dependencies [190fdd11]
- Updated dependencies [8193136a9]
- Updated dependencies [93390d89]
- Updated dependencies [144c0d8d]
- Updated dependencies [c58da9ad]
- Updated dependencies [3042f86e]
- Updated dependencies [d7b1c588a]
- Updated dependencies [3e7d83d0]
- Updated dependencies [252a1852]
  - @latticexyz/store@2.0.0-next.18
  - @latticexyz/recs@2.0.0-next.18

## 2.0.0-next.17

### Patch Changes

- Updated dependencies [a35c05ea]
- Updated dependencies [05b3e888]
- Updated dependencies [aabd3076]
- Updated dependencies [55a05fd7]
- Updated dependencies [5c52bee0]
- Updated dependencies [745485cd]
  - @latticexyz/store@2.0.0-next.17
  - @latticexyz/recs@2.0.0-next.17

## 2.0.0-next.16

### Patch Changes

- Updated dependencies [c6c13f2e]
- Updated dependencies [e6c03a87]
- Updated dependencies [37c228c6]
- Updated dependencies [1bf2e908]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [7b28d32e]
- Updated dependencies [9f8b84e7]
- Updated dependencies [ad4ac445]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [37c228c6]
- Updated dependencies [3ac68ade]
- Updated dependencies [37c228c6]
- Updated dependencies [103f635e]
  - @latticexyz/store@2.0.0-next.16
  - @latticexyz/recs@2.0.0-next.16

## 2.0.0-next.15

### Patch Changes

- 59054203: TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
- 9ef3f9a7: Fixed an issue where `useComponentValue` would not detect a change and re-render if the component value was immediately removed.
- Updated dependencies [d8c8f66b]
- Updated dependencies [1b86eac0]
- Updated dependencies [1077c7f5]
- Updated dependencies [59054203]
- Updated dependencies [6db95ce1]
- Updated dependencies [5d737cf2]
- Updated dependencies [5ac4c97f]
- Updated dependencies [e4817174]
  - @latticexyz/store@2.0.0-next.15
  - @latticexyz/recs@2.0.0-next.15

## 2.0.0-next.14

### Patch Changes

- Updated dependencies [b2d2aa71]
- Updated dependencies [bb91edaa]
  - @latticexyz/store@2.0.0-next.14
  - @latticexyz/recs@2.0.0-next.14

## 2.0.0-next.13

### Patch Changes

- @latticexyz/recs@2.0.0-next.13
- @latticexyz/store@2.0.0-next.13

## 2.0.0-next.12

### Patch Changes

- Updated dependencies [7ce82b6f]
- Updated dependencies [f62c767e]
  - @latticexyz/store@2.0.0-next.12
  - @latticexyz/recs@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- Updated dependencies [f99e8898]
  - @latticexyz/store@2.0.0-next.11
  - @latticexyz/recs@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- Updated dependencies []:
  - @latticexyz/recs@2.0.0-next.10
  - @latticexyz/store@2.0.0-next.10

## 2.0.0-next.9

### Patch Changes

- Updated dependencies [[`aea67c58`](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84), [`07dd6f32`](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9), [`90e4161b`](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`f9f9609e`](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2), [`759514d8`](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8), [`d5094a24`](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4), [`de151fec`](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e), [`ae340b2b`](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623), [`211be2a1`](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9), [`0f3e2e02`](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c), [`d0878928`](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c), [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`6573e38e`](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`6e66c5b7`](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`672d05ca`](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840), [`63831a26`](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`22ee4470`](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612), [`be313068`](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87), [`ac508bf1`](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70), [`9b43029c`](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7), [`55ab88a6`](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314), [`af639a26`](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`99ab9cd6`](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`80dd6992`](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`22ba7b67`](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b)]:
  - @latticexyz/store@2.0.0-next.9
  - @latticexyz/recs@2.0.0-next.9

## 2.0.0-next.8

### Patch Changes

- Updated dependencies [[`1d60930d`](https://github.com/latticexyz/mud/commit/1d60930d6d4c9a0bda262e5e23a5f719b9dd48c7), [`b9e562d8`](https://github.com/latticexyz/mud/commit/b9e562d8f7a6051bb1a7262979b268fd2c83daac), [`5e71e1cb`](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98)]:
  - @latticexyz/store@2.0.0-next.8
  - @latticexyz/recs@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- Updated dependencies [[`c4d5eb4e`](https://github.com/latticexyz/mud/commit/c4d5eb4e4e4737112b981a795a9c347e3578cb15)]:
  - @latticexyz/store@2.0.0-next.7
  - @latticexyz/recs@2.0.0-next.7

## 2.0.0-next.6

### Patch Changes

- Updated dependencies [[`8025c350`](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)]:
  - @latticexyz/store@2.0.0-next.6
  - @latticexyz/recs@2.0.0-next.6

## 2.0.0-next.5

### Patch Changes

- Updated dependencies []:
  - @latticexyz/recs@2.0.0-next.5
  - @latticexyz/store@2.0.0-next.5

## 2.0.0-next.4

### Major Changes

- [#1343](https://github.com/latticexyz/mud/pull/1343) [`e3de1a33`](https://github.com/latticexyz/mud/commit/e3de1a338fe110ac33ba9fb833366541e4cf4cf1) Thanks [@holic](https://github.com/holic)! - Removes `useRow` and `useRows` hooks, previously powered by `store-cache`, which is now deprecated. Please use `recs` and the corresponding `useEntityQuery` and `useComponentValue` hooks. We'll have more hooks soon for SQL.js sync backends.

### Patch Changes

- Updated dependencies [[`ce7125a1`](https://github.com/latticexyz/mud/commit/ce7125a1b97efd3db47c5ea1593d5a37ba143f64), [`c14f8bf1`](https://github.com/latticexyz/mud/commit/c14f8bf1ec8c199902c12899853ac144aa69bb9c)]:
  - @latticexyz/recs@2.0.0-next.4
  - @latticexyz/store@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- Updated dependencies [[`952cd534`](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57), [`d5b73b12`](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd), [`433078c5`](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db), [`afaf2f5f`](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab), [`0d12db8c`](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61)]:
  - @latticexyz/store@2.0.0-next.3
  - @latticexyz/store-cache@2.0.0-next.3
  - @latticexyz/recs@2.0.0-next.3

## 2.0.0-next.2

### Minor Changes

- [#1284](https://github.com/latticexyz/mud/pull/1284) [`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad) Thanks [@holic](https://github.com/holic)! - Adds a `usePromise` hook that returns a [native `PromiseSettledResult` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled).

  ```tsx
  const promise = fetch(url);
  const result = usePromise(promise);

  if (result.status === "idle" || result.status === "pending") {
    return <>fetching</>;
  }

  if (result.status === "rejected") {
    return <>error fetching: {String(result.reason)}</>;
  }

  if (result.status === "fulfilled") {
    return <>fetch status: {result.value.status}</>;
  }
  ```

### Patch Changes

- Updated dependencies [[`a2588116`](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062), [`48c51b52`](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473)]:
  - @latticexyz/store@2.0.0-next.2
  - @latticexyz/store-cache@2.0.0-next.2
  - @latticexyz/recs@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- Updated dependencies [[`c963b46c`](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021), [`5c965a91`](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`afdba793`](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/store@2.0.0-next.1
  - @latticexyz/recs@2.0.0-next.1
  - @latticexyz/store-cache@2.0.0-next.1

## 2.0.0-next.0

### Patch Changes

- Updated dependencies [[`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9), [`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`1e2ad78e`](https://github.com/latticexyz/mud/commit/1e2ad78e277b551dd1b8efb0e4438fb10441644c), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`66cc35a8`](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11), [`a7b30c79`](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f)]:
  - @latticexyz/store@2.0.0-next.0
  - @latticexyz/recs@2.0.0-next.0
  - @latticexyz/store-cache@2.0.0-next.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Features

- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

### Features

- **react:** option for useEntityQuery to re-render on value changes ([#460](https://github.com/latticexyz/mud/issues/460)) ([6b90b85](https://github.com/latticexyz/mud/commit/6b90b85febe00ff0a2c9a3c4642d0197b5107e35))

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

**Note:** Version bump only for package @latticexyz/react

# [1.39.0](https://github.com/latticexyz/mud/compare/v1.38.0...v1.39.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/react

# [1.38.0](https://github.com/latticexyz/mud/compare/v1.37.1...v1.38.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/react

## [1.37.1](https://github.com/latticexyz/mud/compare/v1.37.0...v1.37.1) (2023-02-17)

**Note:** Version bump only for package @latticexyz/react

# [1.37.0](https://github.com/latticexyz/mud/compare/v1.36.1...v1.37.0) (2023-02-16)

### Bug Fixes

- package entry points, peer dep versions ([#409](https://github.com/latticexyz/mud/issues/409)) ([66a7fd6](https://github.com/latticexyz/mud/commit/66a7fd6f74620ce02c60e3d55701d4740cc65251))

### Reverts

- Revert "chore(release): publish v1.37.0" ([c934f53](https://github.com/latticexyz/mud/commit/c934f5388c1e56f2fe6390fdda30f5b9b1ea1c20))

## [1.36.1](https://github.com/latticexyz/mud/compare/v1.36.0...v1.36.1) (2023-02-16)

**Note:** Version bump only for package @latticexyz/react

# [1.35.0](https://github.com/latticexyz/mud/compare/v1.34.0...v1.35.0) (2023-02-15)

**Note:** Version bump only for package @latticexyz/react

# [1.34.0](https://github.com/latticexyz/mud/compare/v1.33.1...v1.34.0) (2023-01-29)

**Note:** Version bump only for package @latticexyz/react

## [1.33.1](https://github.com/latticexyz/mud/compare/v1.33.0...v1.33.1) (2023-01-12)

**Note:** Version bump only for package @latticexyz/react

# [1.33.0](https://github.com/latticexyz/mud/compare/v1.32.0...v1.33.0) (2023-01-12)

### Features

- **react:** add react package ([#294](https://github.com/latticexyz/mud/issues/294)) ([f5ee290](https://github.com/latticexyz/mud/commit/f5ee290e776276b2b0dd273705694df04a85f400))
