# @latticexyz/protocol-parser

## 2.0.0-next.2

### Patch Changes

- [#1308](https://github.com/latticexyz/mud/pull/1308) [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39) Thanks [@holic](https://github.com/holic)! - bump viem to 1.6.0

- Updated dependencies [[`939916bc`](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39), [`b8a6158d`](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)]:
  - @latticexyz/common@2.0.0-next.2
  - @latticexyz/schema-type@2.0.0-next.2

## 2.0.0-next.1

### Patch Changes

- Updated dependencies [[`3fb9ce28`](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50), [`35c9f33d`](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb), [`b02f9d0e`](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07), [`60cfd089`](https://github.com/latticexyz/mud/commit/60cfd089fc7a17b98864b631d265f36718df35a9), [`6071163f`](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983), [`6c673325`](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7), [`cd5abcc3`](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb), [`cc2c8da0`](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)]:
  - @latticexyz/common@2.0.0-next.1
  - @latticexyz/schema-type@2.0.0-next.1

## 2.0.0-next.0

### Minor Changes

- [#1100](https://github.com/latticexyz/mud/pull/1100) [`b98e5180`](https://github.com/latticexyz/mud/commit/b98e51808aaa29f922ac215cf666cf6049e692d6) Thanks [@alvrs](https://github.com/alvrs)! - feat: add abiTypesToSchema, a util to turn a list of abi types into a Schema by separating static and dynamic types

- [#1111](https://github.com/latticexyz/mud/pull/1111) [`ca50fef8`](https://github.com/latticexyz/mud/commit/ca50fef8108422a121d03571fb4679060bd4891a) Thanks [@alvrs](https://github.com/alvrs)! - feat: add `encodeKeyTuple`, a util to encode key tuples in Typescript (equivalent to key tuple encoding in Solidity and inverse of `decodeKeyTuple`).
  Example:

  ```ts
  encodeKeyTuple({ staticFields: ["uint256", "int32", "bytes16", "address", "bool", "int8"], dynamicFields: [] }, [
    42n,
    -42,
    "0x12340000000000000000000000000000",
    "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
    true,
    3,
  ]);
  // [
  //  "0x000000000000000000000000000000000000000000000000000000000000002a",
  //  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6",
  //  "0x1234000000000000000000000000000000000000000000000000000000000000",
  //  "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
  //  "0x0000000000000000000000000000000000000000000000000000000000000001",
  //  "0x0000000000000000000000000000000000000000000000000000000000000003",
  // ]
  ```

### Patch Changes

- [#1075](https://github.com/latticexyz/mud/pull/1075) [`904fd7d4`](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9) Thanks [@holic](https://github.com/holic)! - Add store sync package

- [#1177](https://github.com/latticexyz/mud/pull/1177) [`4bb7e8cb`](https://github.com/latticexyz/mud/commit/4bb7e8cbf0da45c85b70532dc73791e0e2e1d78c) Thanks [@holic](https://github.com/holic)! - `decodeRecord` now properly decodes empty records

- [#1179](https://github.com/latticexyz/mud/pull/1179) [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f) Thanks [@holic](https://github.com/holic)! - - bump to viem 1.3.0 and abitype 0.9.3
  - move `@wagmi/chains` imports to `viem/chains`
  - refine a few types
- Updated dependencies [[`8d51a034`](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f), [`48909d15`](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b), [`f03531d9`](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3), [`53522998`](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f), [`0c4f9fea`](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)]:
  - @latticexyz/common@2.0.0-next.0
  - @latticexyz/schema-type@2.0.0-next.0
