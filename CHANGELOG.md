# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.5.0](https://github.com/latticexyz/mud/compare/v0.4.3...v0.5.0) (2022-08-05)

### Bug Fixes

- better getComponentValueStrict error message, small std-client fixes ([#121](https://github.com/latticexyz/mud/issues/121)) ([5c78b82](https://github.com/latticexyz/mud/commit/5c78b82a88a9d50091bf3c4e65100eb3cb6230b2))
- CacheWorker ([#118](https://github.com/latticexyz/mud/issues/118)) ([bfe006e](https://github.com/latticexyz/mud/commit/bfe006e6adf064982a14d5dc1541d39b1b6016e2))
- optimism, cancel action if gas check fails, add noise utils, fix ecs-browser entry point ([#119](https://github.com/latticexyz/mud/issues/119)) ([f35d3c3](https://github.com/latticexyz/mud/commit/f35d3c3cc7fc9385a215dfda6762a2a825c9fd6d))
- **phaserx:** allow for multiple tweens on same objects by passing in… ([#122](https://github.com/latticexyz/mud/issues/122)) ([d129836](https://github.com/latticexyz/mud/commit/d129836aa2e46c1c8ef737e234bcea3a7c0c4628))

### Features

- **ecs-browser:** Allow spawning of prototypes at arbitrary locations ([#117](https://github.com/latticexyz/mud/issues/117)) ([b31bfcd](https://github.com/latticexyz/mud/commit/b31bfcdd800214908e669b021e4865a68efee795))
- logging library with support for topics/filters ([#123](https://github.com/latticexyz/mud/issues/123)) ([4eac3c6](https://github.com/latticexyz/mud/commit/4eac3c6f45cf300c683397d68e405001d31d8dda))
- **std-client:** add player getter utils for std client ([#120](https://github.com/latticexyz/mud/issues/120)) ([7a06f0b](https://github.com/latticexyz/mud/commit/7a06f0b90b56b916166a5ab2e5409209765352af))

## [0.4.3](https://github.com/latticexyz/mud/compare/v0.4.2...v0.4.3) (2022-07-30)

**Note:** Version bump only for package mud

## [0.4.2](https://github.com/latticexyz/mud/compare/v0.4.1...v0.4.2) (2022-07-29)

**Note:** Version bump only for package mud

## [0.4.1](https://github.com/latticexyz/mud/compare/v0.4.0...v0.4.1) (2022-07-29)

**Note:** Version bump only for package mud

# [0.4.0](https://github.com/latticexyz/mud/compare/v0.3.2...v0.4.0) (2022-07-29)

### Bug Fixes

- **cli:** extract encoded arguments from signature ([#116](https://github.com/latticexyz/mud/issues/116)) ([f630319](https://github.com/latticexyz/mud/commit/f6303194c5d7147a64542e43669fddebf3abad1a))
- **recs:** fix fragment types in system definitions ([#109](https://github.com/latticexyz/mud/issues/109)) ([c74f393](https://github.com/latticexyz/mud/commit/c74f393255af46336e9823b08a2aa7f366cad866))

### Features

- add 3d components ([d230339](https://github.com/latticexyz/mud/commit/d230339bdf3fbfaf4596de759a25fb616a7ab572))
- allow component overrides to be null ([f9baf44](https://github.com/latticexyz/mud/commit/f9baf446e3ddb346792b169bb0942b41c60ac9fb))
- **cli:** cli commands for better debugging ([#113](https://github.com/latticexyz/mud/issues/113)) ([80ae128](https://github.com/latticexyz/mud/commit/80ae128545533a929f272de7461bfa2575cc22fd))
- **network:** faster execution of multiple tx, better revert message logging ([#111](https://github.com/latticexyz/mud/issues/111)) ([bee34dc](https://github.com/latticexyz/mud/commit/bee34dc38194bd54d02cfb7f763025359b49fb05))
- **phaser:** expose set cursor function in phaser input ([#110](https://github.com/latticexyz/mud/issues/110)) ([e377bb0](https://github.com/latticexyz/mud/commit/e377bb0b827a41c32b19f26f03b0bdc8861ff1de))
- **phaserx:** allow running phaser in headless mode for unit testing in jest ([#112](https://github.com/latticexyz/mud/issues/112)) ([22bc4d8](https://github.com/latticexyz/mud/commit/22bc4d8812a69d35f73cc1d0e34064ec6cab2a0e))

## [0.3.2](https://github.com/latticexyz/mud/compare/v0.3.1...v0.3.2) (2022-07-26)

**Note:** Version bump only for package mud

## [0.3.1](https://github.com/latticexyz/mud/compare/v0.3.0...v0.3.1) (2022-07-26)

**Note:** Version bump only for package mud

# [0.3.0](https://github.com/latticexyz/mud/compare/v0.2.0...v0.3.0) (2022-07-26)

### Bug Fixes

- fix deploying to hardhat using forge, check for existing persona in launcher ([#56](https://github.com/latticexyz/mud/issues/56)) ([a0f954b](https://github.com/latticexyz/mud/commit/a0f954b852a01467d84087ace67bfd3065409cf3))
- **ri:** add MoveFacet to deploy script ([#55](https://github.com/latticexyz/mud/issues/55)) ([ee381e1](https://github.com/latticexyz/mud/commit/ee381e1f1a1dfe9ab7f7267fd7c1192ce66b0cfa))
- **std-contracts:** add openzeppelin to remappings to fix build ([5db32a8](https://github.com/latticexyz/mud/commit/5db32a80ecbe9c1b66517fc671beb34062296814))
- use hardhat as node (better logs) and make hardhat compatible with forge ([#54](https://github.com/latticexyz/mud/issues/54)) ([45a5981](https://github.com/latticexyz/mud/commit/45a5981a07f330b222775c0ad797db677f9e8897))

### Features

- add componentComponent to store component to id mapping ([#60](https://github.com/latticexyz/mud/issues/60)) ([e9cb97b](https://github.com/latticexyz/mud/commit/e9cb97b07d8c9ea622efe7612d0646775f03e61a))
- mudwar prototype (nyc sprint 2) ([#59](https://github.com/latticexyz/mud/issues/59)) ([a3db20e](https://github.com/latticexyz/mud/commit/a3db20e14c641b8b456775ee191eca6f016d47f5)), closes [#58](https://github.com/latticexyz/mud/issues/58) [#61](https://github.com/latticexyz/mud/issues/61) [#64](https://github.com/latticexyz/mud/issues/64) [#62](https://github.com/latticexyz/mud/issues/62) [#66](https://github.com/latticexyz/mud/issues/66) [#69](https://github.com/latticexyz/mud/issues/69) [#72](https://github.com/latticexyz/mud/issues/72) [#73](https://github.com/latticexyz/mud/issues/73) [#74](https://github.com/latticexyz/mud/issues/74) [#76](https://github.com/latticexyz/mud/issues/76) [#75](https://github.com/latticexyz/mud/issues/75) [#77](https://github.com/latticexyz/mud/issues/77) [#78](https://github.com/latticexyz/mud/issues/78) [#79](https://github.com/latticexyz/mud/issues/79) [#80](https://github.com/latticexyz/mud/issues/80) [#82](https://github.com/latticexyz/mud/issues/82) [#86](https://github.com/latticexyz/mud/issues/86) [#83](https://github.com/latticexyz/mud/issues/83) [#81](https://github.com/latticexyz/mud/issues/81) [#85](https://github.com/latticexyz/mud/issues/85) [#84](https://github.com/latticexyz/mud/issues/84) [#87](https://github.com/latticexyz/mud/issues/87) [#91](https://github.com/latticexyz/mud/issues/91) [#88](https://github.com/latticexyz/mud/issues/88) [#90](https://github.com/latticexyz/mud/issues/90) [#92](https://github.com/latticexyz/mud/issues/92) [#93](https://github.com/latticexyz/mud/issues/93) [#89](https://github.com/latticexyz/mud/issues/89) [#94](https://github.com/latticexyz/mud/issues/94) [#95](https://github.com/latticexyz/mud/issues/95) [#98](https://github.com/latticexyz/mud/issues/98) [#100](https://github.com/latticexyz/mud/issues/100) [#97](https://github.com/latticexyz/mud/issues/97) [#101](https://github.com/latticexyz/mud/issues/101) [#105](https://github.com/latticexyz/mud/issues/105) [#106](https://github.com/latticexyz/mud/issues/106)
- new systems pattern ([#63](https://github.com/latticexyz/mud/issues/63)) ([fb6197b](https://github.com/latticexyz/mud/commit/fb6197b997eb7232e38ecfb9116ff256491dc38c))
- **script:** add bulk uploading map script with new ecs format ([#52](https://github.com/latticexyz/mud/issues/52)) ([1d93ed7](https://github.com/latticexyz/mud/commit/1d93ed76e24302fcc399193da497a42207990ca7))
- **solecs, std-contracts:** update the build scripts with additional jq delete statements to make the abi files cleaner ([#53](https://github.com/latticexyz/mud/issues/53)) ([198dfa5](https://github.com/latticexyz/mud/commit/198dfa56238178a6f0c64ea63b3e4d9c979d742b))

# [0.2.0](https://github.com/latticexyz/mud/compare/v0.1.8...v0.2.0) (2022-07-05)

### Bug Fixes

- **phaserx:** do not call preventDefault on keyboard events ([ac27fe2](https://github.com/latticexyz/mud/commit/ac27fe2891b8afa2a113d75dfa1625e3bddb8bf6))

### Features

- add webworker architecture for contract/client sync, add cache webworker ([#10](https://github.com/latticexyz/mud/issues/10)) ([4ef9f90](https://github.com/latticexyz/mud/commit/4ef9f909d1d3c10f6bea888b2c32b1d1df04185a)), closes [#14](https://github.com/latticexyz/mud/issues/14)
- **cli:** add vscode solidity config file to mud create projects ([064546a](https://github.com/latticexyz/mud/commit/064546ac7e161ba8dd82d5326c3f975a111596c3))
- component browser 📈 ([#16](https://github.com/latticexyz/mud/issues/16)) ([37af75e](https://github.com/latticexyz/mud/commit/37af75ecb11266e5877d04cb3224698605b87646))
- **contracts:** add function to set contract ecs state in bulk ([#23](https://github.com/latticexyz/mud/issues/23)) ([5bc8d2b](https://github.com/latticexyz/mud/commit/5bc8d2b6895afeec8680b820ed373c75c89e61f7))
- **contracts:** replace hardhat with foundry toolkit ([#51](https://github.com/latticexyz/mud/issues/51)) ([2c0e4a9](https://github.com/latticexyz/mud/commit/2c0e4a903e6d761941ec2f86f2dda9005520f020))
- **network:** integrate checkpoint service ([#24](https://github.com/latticexyz/mud/issues/24)) ([a146164](https://github.com/latticexyz/mud/commit/a146164e1ccab77b88499c213b21f60270ed714b))
- on-chain maps (nyc sprint 1) ([#38](https://github.com/latticexyz/mud/issues/38)) ([089c46d](https://github.com/latticexyz/mud/commit/089c46d7c0e112d1670e3bcd01a35f08ee21d593)), closes [#17](https://github.com/latticexyz/mud/issues/17) [#20](https://github.com/latticexyz/mud/issues/20) [#18](https://github.com/latticexyz/mud/issues/18) [#25](https://github.com/latticexyz/mud/issues/25) [#26](https://github.com/latticexyz/mud/issues/26) [#27](https://github.com/latticexyz/mud/issues/27) [#28](https://github.com/latticexyz/mud/issues/28) [#29](https://github.com/latticexyz/mud/issues/29) [#30](https://github.com/latticexyz/mud/issues/30) [#31](https://github.com/latticexyz/mud/issues/31) [#33](https://github.com/latticexyz/mud/issues/33) [#32](https://github.com/latticexyz/mud/issues/32) [#34](https://github.com/latticexyz/mud/issues/34) [#35](https://github.com/latticexyz/mud/issues/35) [#36](https://github.com/latticexyz/mud/issues/36) [#37](https://github.com/latticexyz/mud/issues/37) [#39](https://github.com/latticexyz/mud/issues/39) [#40](https://github.com/latticexyz/mud/issues/40) [#41](https://github.com/latticexyz/mud/issues/41) [#42](https://github.com/latticexyz/mud/issues/42) [#43](https://github.com/latticexyz/mud/issues/43) [#44](https://github.com/latticexyz/mud/issues/44) [#45](https://github.com/latticexyz/mud/issues/45) [#46](https://github.com/latticexyz/mud/issues/46) [#48](https://github.com/latticexyz/mud/issues/48) [#49](https://github.com/latticexyz/mud/issues/49) [#50](https://github.com/latticexyz/mud/issues/50)
- **recs:** add more granular type assertion function for introspecting Component schema types ([#8](https://github.com/latticexyz/mud/issues/8)) ([48331f9](https://github.com/latticexyz/mud/commit/48331f911eb9f6e39eb774a1aecf759f69729aa4))
- **recs:** add optional parameters to reaction and autorun systems ([451209f](https://github.com/latticexyz/mud/commit/451209f98c17e4b228d7a828662e4b72077fe55f))
- **recs:** expose raw schema on component ([69d9b89](https://github.com/latticexyz/mud/commit/69d9b8978b95a50091a896c123e1c47110e81803))
- **recs:** rewrite for performance improvements (without integrating in ri) ([#22](https://github.com/latticexyz/mud/issues/22)) ([887564d](https://github.com/latticexyz/mud/commit/887564dbe0fad4250b82fd29d144305f176e3b89))
- **ri-client:** pass requirement function result into updates function in ActionRequest ([#7](https://github.com/latticexyz/mud/issues/7)) ([bb60c5a](https://github.com/latticexyz/mud/commit/bb60c5ae7c0fd0d08ca0ee224b26ba73090767e1))
- **solecs:** create getUniqueEntityId function on World contract ([#4](https://github.com/latticexyz/mud/issues/4)) ([a06a9c5](https://github.com/latticexyz/mud/commit/a06a9c5ac1efb20eb61c459dabd00245d988de30))

### BREAKING CHANGES

- Components have to implement a getSchema() function

- feat(network): make Sync worker return a stream of ECS events (prev contract events)

- feat(ri-contracts): integrate solecs change (add getSchema to components)

- feat(ri-client): integrate network package changes

- feat(network): store ECS state in cache

- feat(network): load state from cache

- feat(utils): add more utils for iterables

- refactor(network): clean up

- feat(network): generalize component value decoder function, add tests

- fix(network): make it possible to subscribe to ecsStream from sync worker multiple times

- fix(network): start sync from provided initial block number

- feat(network): move storing ecs to indexDB to its own Cache worker

- feat(network): create separate cache for every World contract address

- fix(network): fix issues discovered during live review

- chore: remove unused import

- Update packages/network/src/createBlockNumberStream.ts

Co-authored-by: ludens <ludens@lattice.xyz>

- feat(network): add clock syncInterval as config parameter

- feat(utils): emit values through componentToStream and observableToStream only if non-null

- feat(network): add chain id to cache id, disable loading from cache on hardhat

- fix(contracts): change Position and EntityType schema to int32/uint32 to fit in js number

- docs(client): fix typos in comments

- fix(network): fix tests

- fix(scripting): integrate new network package into ri scripting

- fix(network): fix sending multiple requests for component schema if many events get reduced

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
