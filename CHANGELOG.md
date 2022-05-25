# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.1.8](https://github.com/latticexyz/mud/compare/v0.1.7...v0.1.8) (2022-05-25)

### Bug Fixes

- **@latticexyz/cli:** fix create script ([2c3b0db](https://github.com/latticexyz/mud/commit/2c3b0db177ded2c3a74721f82fad59d7f596c98e))
- **ri-client:** change bufferCount to bufferTime to apply ecs updates immediately below threshold ([03ecc70](https://github.com/latticexyz/mud/commit/03ecc70ee5b83d0d76b62b9dfe64d9e0efbdf525))

### Performance Improvements

- **ri-contracts:** disable hardhat automine ([72d644a](https://github.com/latticexyz/mud/commit/72d644ac9adc470aec9db62fc8eb576738ecb8b5))

## [0.1.7](https://github.com/latticexyz/mud/compare/v0.1.6...v0.1.7) (2022-05-25)

**Note:** Version bump only for package mud

## [0.1.6](https://github.com/latticexyz/mud/compare/v0.1.5...v0.1.6) (2022-05-25)

**Note:** Version bump only for package mud

## [0.1.5](https://github.com/latticexyz/mud/compare/v0.1.4...v0.1.5) (2022-05-24)

**Note:** Version bump only for package mud

## [0.1.4](https://github.com/latticexyz/mud/compare/v0.1.3...v0.1.4) (2022-05-24)

**Note:** Version bump only for package mud

## [0.1.3](https://github.com/latticexyz/mud/compare/v0.1.2...v0.1.3) (2022-05-23)

**Note:** Version bump only for package mud

## [0.1.2](https://github.com/latticexyz/mud/compare/v0.1.1...v0.1.2) (2022-05-23)

**Note:** Version bump only for package mud

## [0.1.1](https://github.com/latticexyz/mud/compare/v0.1.0...v0.1.1) (2022-05-23)

**Note:** Version bump only for package mud

# 0.1.0 (2022-05-23)

### Bug Fixes

- **@mud/network:** do not increase nonce for view functions ([233c4b5](https://github.com/latticexyz/mud/commit/233c4b51c9cb11ab40fa2c299c2303bc195b6a10))
- **@mud/network:** use component id for ecs event mapping (instead of address) ([baa5f10](https://github.com/latticexyz/mud/commit/baa5f101796086bff7123186e8e0eba1941d20d0))
- **@mud/network:** use component id instead of address for mapping ([39b516c](https://github.com/latticexyz/mud/commit/39b516c477b7e430ef0d00064c65f03afe29d1b4))
- **@mud/solecs:** early return from Component.remove if value does not exist ([02f78c1](https://github.com/latticexyz/mud/commit/02f78c1114f311196928d565cd271c2243b1e9ef))
- **ri-client:** fix assuming component value is not undefined when using updateQuery ([f93ee23](https://github.com/latticexyz/mud/commit/f93ee233d1a2d4a1ef38d946cc241cc75b81e5a9))
- **ri-client:** integrate client with new contract-side component ids ([78bbdfb](https://github.com/latticexyz/mud/commit/78bbdfb87f7e19964550315696fba080a2056ab8))
- **ri-client:** type game contracts using combined facet abi ([6bc48a8](https://github.com/latticexyz/mud/commit/6bc48a89dfe9058b5505fcc07aedaf476fae1477))

### Features

- **@mud/cli:** add deploy script to cli ([99d0b70](https://github.com/latticexyz/mud/commit/99d0b704a3fda8646aad257c02fe7d9dc7a0c6c5))
- **@mud/cli:** add initial version of mud create script ([72758cf](https://github.com/latticexyz/mud/commit/72758cfc0923e7592667cb7db73605e301be1c5d))
- **@mud/cli:** add mud cli and move diamond abi generation to cli ([034af90](https://github.com/latticexyz/mud/commit/034af9075c6f8dfbfb10a8f21a442db39d22bbf7))
- **@mud/network:** add @mud/network ([9a29452](https://github.com/latticexyz/mud/commit/9a29452e76b743f4bf1de3599eb0755fbcb93533))
- **@mud/network:** add option to ignore tx confirmation to txQueue, add ready state, add fetch log ([438549a](https://github.com/latticexyz/mud/commit/438549adf92c42bb987eec46015c9c6f2235be80))
- **@mud/phaserx:** add @mud/phaserx ([cbefb71](https://github.com/latticexyz/mud/commit/cbefb7134407e2fee3b8257e70475aa8e7eb801d))
- **@mud/recs:** add @mud/recs ([aaf6d0f](https://github.com/latticexyz/mud/commit/aaf6d0faf7a98330823ed3449936c5c336113d7e))
- **@mud/solecs:** add @mud/solecs ([84f05f0](https://github.com/latticexyz/mud/commit/84f05f00540c411eb15cdb8139127fd64fa118cc))
- **@mud/solecs:** add advanced queries with support for relationships ([e56f6f4](https://github.com/latticexyz/mud/commit/e56f6f42163653efd53f11e019eb502d41bd3a2b))
- **@mud/utils:** add @mud/utils package ([fc721cc](https://github.com/latticexyz/mud/commit/fc721cc564b20150c3b13883cb3edb773f48e312))
- **@mud/utils:** add keccak256 hash function that accepts string inputs ([ca1a4e0](https://github.com/latticexyz/mud/commit/ca1a4e0cc7452724e703a6530c2e56112c307b66))
- **@mud/utils:** add stretch rxjs operator to add a minimum delay between events in a rxjs stream ([3a1673f](https://github.com/latticexyz/mud/commit/3a1673f5fba548f94afd5580a7e32007a6edd57f))
- **ri-client:** add client reference implementation ([10a33cb](https://github.com/latticexyz/mud/commit/10a33cba983fb56e23af3d1baf68ceafb5325503))
- **ri-contracts:** add contracts reference implementation ([8709568](https://github.com/latticexyz/mud/commit/87095681dcde69b63063ab9ca08587d801f66b7b))
- **ri-scripting:** add light client to send tx at scale, add scripts for stresstest 1 ([903b25c](https://github.com/latticexyz/mud/commit/903b25c3742e5dcc60cbdd54a44b1632c3e4e41d))

### Performance Improvements

- **@mud/network:** add initial sync in stages ([d0c026a](https://github.com/latticexyz/mud/commit/d0c026a51bd8570c00517f8502485465d58bc5bb))
- **@mud/network:** move sync and processing of chain events to a webworker ([dad52ea](https://github.com/latticexyz/mud/commit/dad52eaad4a4d8e67582bde8130455159173f609))
- **@mud/solecs:** add MapSet.sol to improve solecs Component performance (reduce gas) ([678c7ac](https://github.com/latticexyz/mud/commit/678c7aca0db785e2c7df3ab6124c674dac1279ca))
- **ri-client:** throttle ECS event processing to 12000 per second ([88726ec](https://github.com/latticexyz/mud/commit/88726ec559ff5707b84f2eae1d570510fb3ae358))
- **ri-client:** use json rpc provider to send transactions and load block events ([2455aeb](https://github.com/latticexyz/mud/commit/2455aebca5c021c5b9dfa9227be85d2497eb5df9))
