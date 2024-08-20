# @latticexyz/query

## 2.1.1

### Patch Changes

- 9e21e42: Bumped viem to `2.19.8` and abitype to `1.0.5`.

  MUD projects using viem or abitype should do the same to ensure no type errors due to mismatched versions:

  ```
  pnpm recursive up viem@2.19.8 abitype@1.0.5
  ```

- Updated dependencies [9e21e42]
- Updated dependencies [2daaab1]
- Updated dependencies [57bf8c3]
  - @latticexyz/common@2.1.1
  - @latticexyz/config@2.1.1
  - @latticexyz/schema-type@2.1.1
  - @latticexyz/store@2.1.1

## 2.1.0

### Patch Changes

- 7129a16: Bumped `@arktype/util` and moved `evaluate`/`satisfy` usages to its `show`/`satisfy` helpers.
- Updated dependencies [24e285d]
- Updated dependencies [7129a16]
- Updated dependencies [7129a16]
- Updated dependencies [e85dc53]
- Updated dependencies [a10b453]
- Updated dependencies [69eb63b]
- Updated dependencies [8d0453e]
- Updated dependencies [fb1cfef]
  - @latticexyz/store@2.1.0
  - @latticexyz/config@2.1.0
  - @latticexyz/common@2.1.0
  - @latticexyz/schema-type@2.1.0

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
  - @latticexyz/common@2.0.12
  - @latticexyz/config@2.0.12
  - @latticexyz/schema-type@2.0.12

## 2.0.11

### Patch Changes

- @latticexyz/common@2.0.11
- @latticexyz/config@2.0.11
- @latticexyz/schema-type@2.0.11
- @latticexyz/store@2.0.11

## 2.0.10

### Patch Changes

- Updated dependencies [4e4e9104]
- Updated dependencies [51b137d3]
- Updated dependencies [32c1cda6]
- Updated dependencies [4caca05e]
- Updated dependencies [27f888c7]
  - @latticexyz/store@2.0.10
  - @latticexyz/common@2.0.10
  - @latticexyz/config@2.0.10
  - @latticexyz/schema-type@2.0.10

## 2.0.9

### Patch Changes

- Updated dependencies [764ca0a0]
- Updated dependencies [bad3ad1b]
  - @latticexyz/common@2.0.9
  - @latticexyz/config@2.0.9
  - @latticexyz/store@2.0.9
  - @latticexyz/schema-type@2.0.9

## 2.0.8

### Patch Changes

- Updated dependencies [df4781ac]
  - @latticexyz/common@2.0.8
  - @latticexyz/config@2.0.8
  - @latticexyz/store@2.0.8
  - @latticexyz/schema-type@2.0.8

## 2.0.7

### Patch Changes

- Updated dependencies [375d902e]
- Updated dependencies [38c61158]
- Updated dependencies [ed404b7d]
- Updated dependencies [f736c43d]
  - @latticexyz/common@2.0.7
  - @latticexyz/store@2.0.7
  - @latticexyz/config@2.0.7
  - @latticexyz/schema-type@2.0.7

## 2.0.6

### Patch Changes

- c18e93c5: Bumped viem to 2.9.20.
- d95028a6: Bumped viem to 2.9.16.
- Updated dependencies [6c8ab471]
- Updated dependencies [103db6ce]
- Updated dependencies [9720b568]
- Updated dependencies [c18e93c5]
- Updated dependencies [d95028a6]
  - @latticexyz/common@2.0.6
  - @latticexyz/store@2.0.6
  - @latticexyz/config@2.0.6
  - @latticexyz/schema-type@2.0.6

## 2.0.5

### Patch Changes

- Updated dependencies [a9e8a407]
- Updated dependencies [b798ccb2]
  - @latticexyz/common@2.0.5
  - @latticexyz/store@2.0.5
  - @latticexyz/config@2.0.5
  - @latticexyz/schema-type@2.0.5

## 2.0.4

### Patch Changes

- Updated dependencies [620e4ec1]
  - @latticexyz/common@2.0.4
  - @latticexyz/config@2.0.4
  - @latticexyz/store@2.0.4
  - @latticexyz/schema-type@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [d2e4d0fb]
  - @latticexyz/common@2.0.3
  - @latticexyz/config@2.0.3
  - @latticexyz/store@2.0.3
  - @latticexyz/schema-type@2.0.3

## 2.0.2

### Patch Changes

- @latticexyz/common@2.0.2
- @latticexyz/config@2.0.2
- @latticexyz/schema-type@2.0.2
- @latticexyz/store@2.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [4a6b4598]
  - @latticexyz/store@2.0.1
  - @latticexyz/common@2.0.1
  - @latticexyz/config@2.0.1
  - @latticexyz/schema-type@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [7ce82b6fc]
- Updated dependencies [d8c8f66bf]
- Updated dependencies [c6c13f2ea]
- Updated dependencies [1b86eac05]
- Updated dependencies [a35c05ea9]
- Updated dependencies [c9ee5e4a]
- Updated dependencies [c963b46c7]
- Updated dependencies [05b3e8882]
- Updated dependencies [16b13ea8f]
- Updated dependencies [aea67c580]
- Updated dependencies [82693072]
- Updated dependencies [07dd6f32c]
- Updated dependencies [90e4161bb]
- Updated dependencies [aabd30767]
- Updated dependencies [65c9546c4]
- Updated dependencies [331dbfdcb]
- Updated dependencies [d5c0682fb]
- Updated dependencies [1d60930d6]
- Updated dependencies [01e46d99]
- Updated dependencies [f9f9609ef]
- Updated dependencies [904fd7d4e]
- Updated dependencies [e6c03a87a]
- Updated dependencies [1077c7f53]
- Updated dependencies [2c920de7]
- Updated dependencies [b9e562d8f]
- Updated dependencies [331dbfdcb]
- Updated dependencies [44236041f]
- Updated dependencies [066056154]
- Updated dependencies [759514d8b]
- Updated dependencies [952cd5344]
- Updated dependencies [d5094a242]
- Updated dependencies [3fb9ce283]
- Updated dependencies [bb6ada740]
- Updated dependencies [35c9f33df]
- Updated dependencies [a25881160]
- Updated dependencies [0b8ce3f2c]
- Updated dependencies [933b54b5f]
- Updated dependencies [c4d5eb4e4]
- Updated dependencies [f62c767e7]
- Updated dependencies [9aa5e786]
- Updated dependencies [307abab3]
- Updated dependencies [de151fec0]
- Updated dependencies [37c228c63]
- Updated dependencies [aacffcb59]
- Updated dependencies [c991c71a]
- Updated dependencies [ae340b2bf]
- Updated dependencies [1bf2e9087]
- Updated dependencies [b38c096d]
- Updated dependencies [211be2a1e]
- Updated dependencies [0f3e2e02b]
- Updated dependencies [d08789282]
- Updated dependencies [5c965a919]
- Updated dependencies [f99e88987]
- Updated dependencies [939916bcd]
- Updated dependencies [d5b73b126]
- Updated dependencies [e34d1170]
- Updated dependencies [b8a6158d6]
- Updated dependencies [190fdd11]
- Updated dependencies [433078c54]
- Updated dependencies [db314a74]
- Updated dependencies [b2d2aa715]
- Updated dependencies [83583a505]
- Updated dependencies [5e723b90e]
- Updated dependencies [6573e38e9]
- Updated dependencies [afaf2f5ff]
- Updated dependencies [37c228c63]
- Updated dependencies [59267655]
- Updated dependencies [37c228c63]
- Updated dependencies [44a5432ac]
- Updated dependencies [6e66c5b74]
- Updated dependencies [8d51a0348]
- Updated dependencies [c162ad5a5]
- Updated dependencies [65c9546c4]
- Updated dependencies [48909d151]
- Updated dependencies [7b28d32e5]
- Updated dependencies [b02f9d0e4]
- Updated dependencies [f62c767e7]
- Updated dependencies [bb91edaa0]
- Updated dependencies [590542030]
- Updated dependencies [1b5eb0d07]
- Updated dependencies [44a5432ac]
- Updated dependencies [48c51b52a]
- Updated dependencies [9f8b84e73]
- Updated dependencies [66cc35a8c]
- Updated dependencies [672d05ca1]
- Updated dependencies [55a05fd7a]
- Updated dependencies [f03531d97]
- Updated dependencies [63831a264]
- Updated dependencies [b8a6158d6]
- Updated dependencies [6db95ce15]
- Updated dependencies [8193136a9]
- Updated dependencies [5d737cf2e]
- Updated dependencies [d075f82f3]
- Updated dependencies [331dbfdcb]
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
- Updated dependencies [3e057061d]
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
- Updated dependencies [0c4f9fea9]
- Updated dependencies [0d12db8c2]
- Updated dependencies [c049c23f4]
- Updated dependencies [80dd6992e]
- Updated dependencies [60cfd089f]
- Updated dependencies [24a6cd536]
- Updated dependencies [37c228c63]
- Updated dependencies [708b49c50]
- Updated dependencies [d2f8e9400]
- Updated dependencies [25086be5f]
- Updated dependencies [b1d41727d]
- Updated dependencies [3ac68ade6]
- Updated dependencies [22ba7b675]
- Updated dependencies [4c1dcd81e]
- Updated dependencies [3042f86e]
- Updated dependencies [5e71e1cb5]
- Updated dependencies [6071163f7]
- Updated dependencies [6c6733256]
- Updated dependencies [cd5abcc3b]
- Updated dependencies [d7b1c588a]
- Updated dependencies [5c52bee09]
- Updated dependencies [8025c3505]
- Updated dependencies [c4f49240d]
- Updated dependencies [745485cda]
- Updated dependencies [37c228c63]
- Updated dependencies [3e7d83d0]
- Updated dependencies [5df1f31bc]
- Updated dependencies [cea754dde]
- Updated dependencies [331f0d636]
- Updated dependencies [cc2c8da00]
- Updated dependencies [252a1852]
- Updated dependencies [103f635eb]
  - @latticexyz/store@2.0.0
  - @latticexyz/common@2.0.0
  - @latticexyz/schema-type@2.0.0
  - @latticexyz/config@2.0.0

## 2.0.0-next.18

### Patch Changes

- Updated dependencies [c9ee5e4a]
- Updated dependencies [82693072]
- Updated dependencies [d5c0682fb]
- Updated dependencies [01e46d99]
- Updated dependencies [2c920de7]
- Updated dependencies [44236041]
- Updated dependencies [9aa5e786]
- Updated dependencies [307abab3]
- Updated dependencies [c991c71a]
- Updated dependencies [b38c096d]
- Updated dependencies [e34d1170]
- Updated dependencies [190fdd11]
- Updated dependencies [db314a74]
- Updated dependencies [59267655]
- Updated dependencies [8193136a9]
- Updated dependencies [93390d89]
- Updated dependencies [144c0d8d]
- Updated dependencies [c58da9ad]
- Updated dependencies [3042f86e]
- Updated dependencies [d7b1c588a]
- Updated dependencies [3e7d83d0]
- Updated dependencies [252a1852]
  - @latticexyz/store@2.0.0-next.18
  - @latticexyz/common@2.0.0-next.18
  - @latticexyz/schema-type@2.0.0-next.18
  - @latticexyz/config@2.0.0-next.18
