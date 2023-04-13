# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Bug Fixes

- **cli:** account for getRecord's trimming ([#574](https://github.com/latticexyz/mud/issues/574)) ([9c5317a](https://github.com/latticexyz/mud/commit/9c5317afb2c4a9ac2fbaca424f90f30575dba671))
- **cli:** add back in resolveTableId export for use with mudConfig ([#518](https://github.com/latticexyz/mud/issues/518)) ([4906d77](https://github.com/latticexyz/mud/commit/4906d771645f9311b74b326ce551336a63e65eb9))
- **cli:** handle static arrays in worldgen ([#566](https://github.com/latticexyz/mud/issues/566)) ([b6a09f2](https://github.com/latticexyz/mud/commit/b6a09f222db8fc6d32800671ba238bc1771eb917))
- **cli:** remove node-dependent exports from base module ([#517](https://github.com/latticexyz/mud/issues/517)) ([abb34a6](https://github.com/latticexyz/mud/commit/abb34a63ffff0c0f7547c0c9ccf8133490ae1756))
- **cli:** use esbuild to load mud config ([#565](https://github.com/latticexyz/mud/issues/565)) ([18a8c42](https://github.com/latticexyz/mud/commit/18a8c42aa26ce54ac1a1bf4ba35de249b7f55979))
- **cli:** use fileSelector in worldgen ([#502](https://github.com/latticexyz/mud/issues/502)) ([fa021ed](https://github.com/latticexyz/mud/commit/fa021ed64800b533bc8995888edbc095e8e112dc))
- **cli:** wait for tx confirmation on deploy txs ([#606](https://github.com/latticexyz/mud/issues/606)) ([b92be71](https://github.com/latticexyz/mud/commit/b92be71e944ce4547193375261ec99649321b17a))
- **network:** fall back to RPC sync if MODE is not available ([#555](https://github.com/latticexyz/mud/issues/555)) ([4de4b6d](https://github.com/latticexyz/mud/commit/4de4b6d5ab4f8b27873af6d298ba3e6e1c1fd02f))
- **network:** fix mode decoding ([#562](https://github.com/latticexyz/mud/issues/562)) ([fb82313](https://github.com/latticexyz/mud/commit/fb823131fc8f7bcbdcbfa57de59a8a5dbca2f8b6))
- **network:** handle singleton/empty keys ([#541](https://github.com/latticexyz/mud/issues/541)) ([1e0ddb9](https://github.com/latticexyz/mud/commit/1e0ddb9adaf2376ee6b578e3fb1d1eb0b3e22206))
- **network:** skip sync from cache in dev mode ([#521](https://github.com/latticexyz/mud/issues/521)) ([818c1e2](https://github.com/latticexyz/mud/commit/818c1e2e6e7acb45f4d65d47f5395cb2d3811a57))
- **recs,cli:** fix bigint in recs and tsgen ([#563](https://github.com/latticexyz/mud/issues/563)) ([29fefae](https://github.com/latticexyz/mud/commit/29fefae43d96b107a66b9fd365b566cb8c466f8b))
- **recs:** overridden component update stream should return the overridden component ([#544](https://github.com/latticexyz/mud/issues/544)) ([9af097d](https://github.com/latticexyz/mud/commit/9af097de7914d0c43b7d65ca6271260439bc6bc4))
- **std-client:** export getBurnerWallet ([#547](https://github.com/latticexyz/mud/issues/547)) ([5b5a71a](https://github.com/latticexyz/mud/commit/5b5a71ad5b49c2dfb736832de42f879f8437b1be))
- **world:** allow world to access own functions via external calls ([#609](https://github.com/latticexyz/mud/issues/609)) ([98047f7](https://github.com/latticexyz/mud/commit/98047f7779bf60c3758967bd82f5c191a882eeb8))
- **world:** give World contract access to root namespace ([#575](https://github.com/latticexyz/mud/issues/575)) ([cbef50d](https://github.com/latticexyz/mud/commit/cbef50d07e65802dc49baeb26065d9a61ae59228))

### Features

- add support for key schemas ([#480](https://github.com/latticexyz/mud/issues/480)) ([37aec2e](https://github.com/latticexyz/mud/commit/37aec2e0a8adf378035fa5b54d752cc6888378d2))
- align git dep versions ([#577](https://github.com/latticexyz/mud/issues/577)) ([2b5fb5e](https://github.com/latticexyz/mud/commit/2b5fb5e94ad3e7e1134608121fec6c7b6a64d539))
- **cli/recs/std-client:** add ts definitions generator ([#536](https://github.com/latticexyz/mud/issues/536)) ([dd1efa6](https://github.com/latticexyz/mud/commit/dd1efa6a1ebd2b3c62080d1b191633d7b0072916))
- **cli:** add `mud test-v2` command ([#554](https://github.com/latticexyz/mud/issues/554)) ([d6be8b0](https://github.com/latticexyz/mud/commit/d6be8b08d0eeae3b10eb9e7bffb6d4dd2fc58aa0))
- **cli:** add `set-version` to upgrade all MUD dependencies in a project ([#527](https://github.com/latticexyz/mud/issues/527)) ([89731a6](https://github.com/latticexyz/mud/commit/89731a60e6a5643992ceb6996ed9d9894541fc72))
- **cli:** add encode function to all tables ([#498](https://github.com/latticexyz/mud/issues/498)) ([564604c](https://github.com/latticexyz/mud/commit/564604c0c03d675e007d176ec735d8fb76976771))
- **cli:** add module config to CLI ([#494](https://github.com/latticexyz/mud/issues/494)) ([263c828](https://github.com/latticexyz/mud/commit/263c828d3eb6f43d5e635c28026f4a68fbf7a19b))
- **cli:** add mud2 cli entrypoint with only v2 commands ([#567](https://github.com/latticexyz/mud/issues/567)) ([785a324](https://github.com/latticexyz/mud/commit/785a324920c11e24399c5edf575a9099ee4077b6))
- **cli:** add registerFunctionSelectors to deploy cli ([#501](https://github.com/latticexyz/mud/issues/501)) ([de3d459](https://github.com/latticexyz/mud/commit/de3d459c4c5817be8c947acb0131281f69b9133f))
- **cli:** add worldgen ([#496](https://github.com/latticexyz/mud/issues/496)) ([e84c0c8](https://github.com/latticexyz/mud/commit/e84c0c8dbb42b94d5ac096ef7916665f510b5c23))
- **cli:** allow customization of IWorld interface name via mud config, change `world/IWorld` to `world/IBaseWorld` ([#545](https://github.com/latticexyz/mud/issues/545)) ([38b355c](https://github.com/latticexyz/mud/commit/38b355c562a1e5c020deb6553a000a4d34d5fd86))
- **cli:** allow passing world address and src dir to deploy cli ([#586](https://github.com/latticexyz/mud/issues/586)) ([4b532be](https://github.com/latticexyz/mud/commit/4b532bee7fb0445ed624bd456b97e86a8f41e665))
- **cli:** allow static arrays as abi types in store config and tablegen ([#509](https://github.com/latticexyz/mud/issues/509)) ([588d037](https://github.com/latticexyz/mud/commit/588d0370d4c7d13667ff784ecb170edf59aa119e))
- **cli:** improve store config typehints, prepare for static array support ([#508](https://github.com/latticexyz/mud/issues/508)) ([abb5eb2](https://github.com/latticexyz/mud/commit/abb5eb2a111f5f75a4211692e8fede9afd6b2aee))
- **cli:** improve storeArgument, refactor cli ([#500](https://github.com/latticexyz/mud/issues/500)) ([bb68670](https://github.com/latticexyz/mud/commit/bb686702da75401d9ea4a8c8effcf3a15fa53b49))
- **cli:** include stateMutability in worldgen ([#571](https://github.com/latticexyz/mud/issues/571)) ([3a91292](https://github.com/latticexyz/mud/commit/3a91292dffd93a4e40725fac0a4255daab450442))
- **cli:** namespace deploy output by chain id ([#516](https://github.com/latticexyz/mud/issues/516)) ([7687349](https://github.com/latticexyz/mud/commit/768734967d5b8feaa06bb63d49feecce4c6fe3ee))
- **cli:** rename deploymentInfoDirectory to deploysDirectory, default to ./deploys ([#519](https://github.com/latticexyz/mud/issues/519)) ([1dba0d3](https://github.com/latticexyz/mud/commit/1dba0d370ad5e23d20e93d92b5e2d477a194248f))
- **cli:** set storeArgument to true by default ([#553](https://github.com/latticexyz/mud/issues/553)) ([cb1ecbc](https://github.com/latticexyz/mud/commit/cb1ecbcd036ead1b1ba0b717c7531d15beaeb106))
- **cli:** use a central codegen dir for tablegen and worldgen ([#585](https://github.com/latticexyz/mud/issues/585)) ([7500b11](https://github.com/latticexyz/mud/commit/7500b119d727a7155fa1033b2fc3ca729a51d033))
- **cli:** use abi types in store config ([#507](https://github.com/latticexyz/mud/issues/507)) ([12a739f](https://github.com/latticexyz/mud/commit/12a739f953d0929f7ffc8657fa22bc9e68201d75))
- **cli:** use json for gas report output ([#607](https://github.com/latticexyz/mud/issues/607)) ([bea12ca](https://github.com/latticexyz/mud/commit/bea12cac16a2e0cdbb9623571cf0b02a5ed969a2))
- **config:** create config package ([#589](https://github.com/latticexyz/mud/issues/589)) ([d2a23a6](https://github.com/latticexyz/mud/commit/d2a23a6162611353f4930aeadbd8fff2f1c3874c))
- **config:** separate config from cli ([#600](https://github.com/latticexyz/mud/issues/600)) ([cd224a5](https://github.com/latticexyz/mud/commit/cd224a5244ee55316d4b95a21007a8076adefe6e))
- **create-mud:** use pnpm in templates, move to root so they can be installed/run ([#599](https://github.com/latticexyz/mud/issues/599)) ([010740d](https://github.com/latticexyz/mud/commit/010740d09d40d4ff6d95538d498a513fbb65ca45))
- mode mvp ([#492](https://github.com/latticexyz/mud/issues/492)) ([08a7baf](https://github.com/latticexyz/mud/commit/08a7baf760f227f2f513ed7da2078e0a41b1e928))
- **network,recs,std-client:** support StoreSetField before StoreSetRecord ([#581](https://github.com/latticexyz/mud/issues/581)) ([f259f90](https://github.com/latticexyz/mud/commit/f259f90e1c561163a6675f4ec51b1659681d880b)), closes [#479](https://github.com/latticexyz/mud/issues/479) [#523](https://github.com/latticexyz/mud/issues/523)
- **network:** add fastTxExecute util ([#543](https://github.com/latticexyz/mud/issues/543)) ([f05a70a](https://github.com/latticexyz/mud/commit/f05a70a2e4be077af44c6d6a0b9c8da8d0c18bc5))
- **network:** add option to sync in main thread instead of worker ([#522](https://github.com/latticexyz/mud/issues/522)) ([4e8e7d7](https://github.com/latticexyz/mud/commit/4e8e7d774c574de5d08c03f02ef1811bade2ce7c))
- **network:** integrate initial sync from MODE ([#493](https://github.com/latticexyz/mud/issues/493)) ([7d06c1b](https://github.com/latticexyz/mud/commit/7d06c1b5cf00df627000c907e78f60d3cd2415cd))
- **schema-type:** add SchemaType -> primitive map, rearrange files ([#488](https://github.com/latticexyz/mud/issues/488)) ([b1bf876](https://github.com/latticexyz/mud/commit/b1bf876eee91d783bbd050c1361bb3af1f651e66))
- **std-client:** add getBurnerWallet util ([#546](https://github.com/latticexyz/mud/issues/546)) ([f427b50](https://github.com/latticexyz/mud/commit/f427b50a01457550624eed280d73c69141deaa3d))
- **std-client:** move v2 setup to its own function/file ([#526](https://github.com/latticexyz/mud/issues/526)) ([ef5b4c2](https://github.com/latticexyz/mud/commit/ef5b4c2ceedc74b94a76f3ed47748fc24028fdb4))
- **store:** add metadata to the schema table ([#550](https://github.com/latticexyz/mud/issues/550)) ([55ab704](https://github.com/latticexyz/mud/commit/55ab704c36a8ba5fd021cc80abb32b3f69e97b73))
- use IErrors in IStore and IWorldCore ([#573](https://github.com/latticexyz/mud/issues/573)) ([4f9ed7b](https://github.com/latticexyz/mud/commit/4f9ed7ba22ea978623b6d54e9731081580c2ad8f))
- use viem when creating burner wallet ([#576](https://github.com/latticexyz/mud/issues/576)) ([d5d22e0](https://github.com/latticexyz/mud/commit/d5d22e0b855cc9a606aa6e1380449a0840ea7343))
- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))
- **world,store:** add updateInField ([#525](https://github.com/latticexyz/mud/issues/525)) ([0ac76fd](https://github.com/latticexyz/mud/commit/0ac76fd57484f54860157b79678b8b9eb7a86997))
- **world:** add naive ReverseMappingHook/Module ([#487](https://github.com/latticexyz/mud/issues/487)) ([36aaaef](https://github.com/latticexyz/mud/commit/36aaaef3a69914b962a3ef0847aa144134e89d28))
- **world:** add support for modules, add RegistrationModule, add CoreModule ([#482](https://github.com/latticexyz/mud/issues/482)) ([624cbbc](https://github.com/latticexyz/mud/commit/624cbbc6722823e83594f3df38d72682a1cecd99))
- **world:** add UniqueEntityModule ([#552](https://github.com/latticexyz/mud/issues/552)) ([983e26a](https://github.com/latticexyz/mud/commit/983e26a0ee0c0521e99d09dd25ebb9937e7c4ded))
- **world:** allow payable systems ([#568](https://github.com/latticexyz/mud/issues/568)) ([b63aca8](https://github.com/latticexyz/mud/commit/b63aca8a6705b3507ccbb1606734c0a0058522a5))
- **world:** allow registration of function selectors in the World, split out RegisterSystem from World ([#481](https://github.com/latticexyz/mud/issues/481)) ([ba0166f](https://github.com/latticexyz/mud/commit/ba0166fb6cd7de63ddc6f4f500ff90c05da67b09))
- **world:** index first key for KeysWithValueModule on tables with composite keys ([#569](https://github.com/latticexyz/mud/issues/569)) ([bcba109](https://github.com/latticexyz/mud/commit/bcba1093c1221f9964632a43cc8fa1a9cb1963d1))
- **world:** ReverseMapping: infer target table id from source table id, add getKeysWithValue util ([#490](https://github.com/latticexyz/mud/issues/490)) ([f69e3dc](https://github.com/latticexyz/mud/commit/f69e3dce1b8e605f8fc6689fc5b9722114860a49))
- **world:** simplify access control to namespaces instead of routes ([#467](https://github.com/latticexyz/mud/issues/467)) ([945f2ef](https://github.com/latticexyz/mud/commit/945f2ef4a09c2fd1f9c4bb0418a1569fc31e0776))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

### Bug Fixes

- **cli:** add missing await ([#475](https://github.com/latticexyz/mud/issues/475)) ([efb5d76](https://github.com/latticexyz/mud/commit/efb5d76303093764c3bb8bd2d2a149bde0f4eb29))
- **cli:** add missing await to tablegen, fix formatting ([#472](https://github.com/latticexyz/mud/issues/472)) ([4313c27](https://github.com/latticexyz/mud/commit/4313c277b10c0334716e5c3728ffeaef643c1e6b))
- **cli:** avoid fs usage in utils, create deployment output directory if it doesn't exist ([#471](https://github.com/latticexyz/mud/issues/471)) ([cc8aa13](https://github.com/latticexyz/mud/commit/cc8aa132885e02e6db5658b19e82cc222676d724))
- **services:** fix protobuf imports ([#477](https://github.com/latticexyz/mud/issues/477)) ([3eda547](https://github.com/latticexyz/mud/commit/3eda547b6799b9899a14d48d022f7ec6460308e0))
- **world:** fix schema order ([#464](https://github.com/latticexyz/mud/issues/464)) ([3d137dd](https://github.com/latticexyz/mud/commit/3d137dd5371fe4670458bdc7ce20c2e40cbe24ae))

### Features

- add pushToField to Store and World ([#434](https://github.com/latticexyz/mud/issues/434)) ([b665efc](https://github.com/latticexyz/mud/commit/b665efcb407992779c93a400199dee8ffdc03cb7))
- **cli:** add setMetadata to autogen of table libraries ([#466](https://github.com/latticexyz/mud/issues/466)) ([1e129fe](https://github.com/latticexyz/mud/commit/1e129fe9ced354e838d3d9afc9839aba82fbf210))
- **cli:** add v2 deployment script ([#450](https://github.com/latticexyz/mud/issues/450)) ([1db37a5](https://github.com/latticexyz/mud/commit/1db37a5c6b736fdc5f806653b78f76b02239f2bb))
- **cli:** user types and route/path separation ([#454](https://github.com/latticexyz/mud/issues/454)) ([758bf03](https://github.com/latticexyz/mud/commit/758bf0388c9e282c58b2890cadb4a59e00978d26))
- **react:** option for useEntityQuery to re-render on value changes ([#460](https://github.com/latticexyz/mud/issues/460)) ([6b90b85](https://github.com/latticexyz/mud/commit/6b90b85febe00ff0a2c9a3c4642d0197b5107e35))

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

### Bug Fixes

- **ecs-browser:** fix some errors in ecs-browser ([#420](https://github.com/latticexyz/mud/issues/420)) ([2a7ce21](https://github.com/latticexyz/mud/commit/2a7ce210553b2b9a6b2dffddac069be24802645f))

### Features

- add StoreMetadata table for table name and field names to Store and World ([#428](https://github.com/latticexyz/mud/issues/428)) ([ae39ace](https://github.com/latticexyz/mud/commit/ae39acec12e3263bcb9a8cd4f0a4db5d98b96333))
- **cli:** reorganize internal structure and add exports for all utilities ([#451](https://github.com/latticexyz/mud/issues/451)) ([e683904](https://github.com/latticexyz/mud/commit/e683904f8b5dcd23b69aef25275a0b3c8c3f9bb0))
- **phaserx:** tag native phaser game objects with object pool id ([#453](https://github.com/latticexyz/mud/issues/453)) ([27ac5d3](https://github.com/latticexyz/mud/commit/27ac5d3529ce91e2a3aa3e2aa675e54dba453bbd))
- v2 - add store, world and schema-type, cli table code generation ([#422](https://github.com/latticexyz/mud/issues/422)) ([cb731e0](https://github.com/latticexyz/mud/commit/cb731e0937e614bb316e6bc824813799559956c8))

### BREAKING CHANGES

- This commit removes the deprecated `mud deploy` CLI command. Use `mud deploy-contracts` instead.

# [1.39.0](https://github.com/latticexyz/mud/compare/v1.38.0...v1.39.0) (2023-02-22)

### Features

- **create-mud:** default to latest mud version ([#432](https://github.com/latticexyz/mud/issues/432)) ([5a38ad6](https://github.com/latticexyz/mud/commit/5a38ad6b96058883518427fe87ad8f85fb266366))

# [1.38.0](https://github.com/latticexyz/mud/compare/v1.37.1...v1.38.0) (2023-02-22)

### Bug Fixes

- **create-mud:** small linting/type fixes for templates ([#425](https://github.com/latticexyz/mud/issues/425)) ([1f2598c](https://github.com/latticexyz/mud/commit/1f2598cff40cd9f5059b553b9291ffd2c61bacdd))

### Features

- **cli:** deprecate create command ([#424](https://github.com/latticexyz/mud/issues/424)) ([292119f](https://github.com/latticexyz/mud/commit/292119f4c0c40cbd3ad688ee567f4c05d957af7c))
- **cli:** log client world URL ([#426](https://github.com/latticexyz/mud/issues/426)) ([f257467](https://github.com/latticexyz/mud/commit/f25746756ab4e93ef7a477b2b2c4948206f38f69))

## [1.37.1](https://github.com/latticexyz/mud/compare/v1.37.0...v1.37.1) (2023-02-17)

**Note:** Version bump only for package mud

# [1.37.0](https://github.com/latticexyz/mud/compare/v1.36.1...v1.37.0) (2023-02-16)

### Bug Fixes

- package entry points, peer dep versions ([#409](https://github.com/latticexyz/mud/issues/409)) ([66a7fd6](https://github.com/latticexyz/mud/commit/66a7fd6f74620ce02c60e3d55701d4740cc65251))

### Features

- **create-mud:** update mud versions ([#407](https://github.com/latticexyz/mud/issues/407)) ([96dfef9](https://github.com/latticexyz/mud/commit/96dfef992f25714963792137043639c0b67c903f))

### Reverts

- Revert "chore(release): publish v1.37.0" ([c934f53](https://github.com/latticexyz/mud/commit/c934f5388c1e56f2fe6390fdda30f5b9b1ea1c20))

## [1.36.1](https://github.com/latticexyz/mud/compare/v1.36.0...v1.36.1) (2023-02-16)

**Note:** Version bump only for package mud

# [1.36.0](https://github.com/latticexyz/mud/compare/v1.35.0...v1.36.0) (2023-02-16)

### Bug Fixes

- **create-mud:** attempt to fix create-mud build/install issues ([#406](https://github.com/latticexyz/mud/issues/406)) ([ea53acc](https://github.com/latticexyz/mud/commit/ea53accaa684c42982bb1cac4ac1fcefd07d1603))

### Features

- **cli:** use forge config for paths to src, test, out ([#392](https://github.com/latticexyz/mud/issues/392)) ([01217d3](https://github.com/latticexyz/mud/commit/01217d3b1f39a0f0cd1b1b5c45750a65928ea02f))

# [1.35.0](https://github.com/latticexyz/mud/compare/v1.34.0...v1.35.0) (2023-02-15)

### Bug Fixes

- **cli:** exit if generateDeploy fails in deploy-contracts setup ([#377](https://github.com/latticexyz/mud/issues/377)) ([71dd7f0](https://github.com/latticexyz/mud/commit/71dd7f083b9dccd14f646ea0bdbfd3a9028d4ed5))
- **cli:** pass reuseComponents arg in deploy command ([#356](https://github.com/latticexyz/mud/issues/356)) ([8e31984](https://github.com/latticexyz/mud/commit/8e31984e0f6b91316c18bf773233a0e5e1feb31d))
- **cli:** use nodejs grpc transport ([#374](https://github.com/latticexyz/mud/issues/374)) ([4c9ca7d](https://github.com/latticexyz/mud/commit/4c9ca7dcd756732be817f579fc24092bd2fd7aae))
- **network:** add explicit return type to createFaucetService ([#399](https://github.com/latticexyz/mud/issues/399)) ([cae82e5](https://github.com/latticexyz/mud/commit/cae82e5781931f86d0bc53eb05306197fab3d7aa))
- **network:** use current block number while waiting for new blocks ([#368](https://github.com/latticexyz/mud/issues/368)) ([09b77a7](https://github.com/latticexyz/mud/commit/09b77a7e27d2056a30f9b9c41046b7d6eec8dda7))
- **solecs:** make OwnableWritable overridable ([#370](https://github.com/latticexyz/mud/issues/370)) ([49d520e](https://github.com/latticexyz/mud/commit/49d520e643aefe954a84fdff5d6b742afd0cf010))

### Features

- **cli:** add gas-report command ([#365](https://github.com/latticexyz/mud/issues/365)) ([c2a5209](https://github.com/latticexyz/mud/commit/c2a520970d2897efdfda36df4bab0fc6988c346b))
- **cli:** add initialization libs to deploy ([#361](https://github.com/latticexyz/mud/issues/361)) ([3999ca0](https://github.com/latticexyz/mud/commit/3999ca007c93a135692cdfe21ab263d7ab947c9c))
- **cli:** allow initializers to utilize SystemStorage ([#371](https://github.com/latticexyz/mud/issues/371)) ([b8ba018](https://github.com/latticexyz/mud/commit/b8ba018a1abccd4fdea82a3508cb0f39d8794280))
- **create-mud:** add create-mud package ([#336](https://github.com/latticexyz/mud/issues/336)) ([e85c124](https://github.com/latticexyz/mud/commit/e85c1244bf63ccd0a287849dd33fa685d95ea081))
- update forge-std, use some new features in cli ([#311](https://github.com/latticexyz/mud/issues/311)) ([43ad118](https://github.com/latticexyz/mud/commit/43ad11837ae280509be92737e8f86d749d4d48d8))

# [1.34.0](https://github.com/latticexyz/mud/compare/v1.33.1...v1.34.0) (2023-01-29)

### Bug Fixes

- **cli:** round gas price to nearest integer ([#348](https://github.com/latticexyz/mud/issues/348)) ([ce07174](https://github.com/latticexyz/mud/commit/ce071747eb33ca9feceb0618af627ff845d2b1b8))
- **network:** throw errors from txQueue calls ([#351](https://github.com/latticexyz/mud/issues/351)) ([a811ff7](https://github.com/latticexyz/mud/commit/a811ff76e500bbc3e983f32c13877bdee855113d)), closes [#315](https://github.com/latticexyz/mud/issues/315)
- **phaserx:** reset game object masks when resetting embodied entity ([#349](https://github.com/latticexyz/mud/issues/349)) ([2153f69](https://github.com/latticexyz/mud/commit/2153f690a3df2277d5a23100715dacda66459684))

### Features

- **network:** add support for external wallets (eg MetaMask) ([#256](https://github.com/latticexyz/mud/issues/256)) ([bf0b5cf](https://github.com/latticexyz/mud/commit/bf0b5cff5f70903ef8b43a46ad07b649946b21a9))
- **solecs:** add deterministic storage location for systems, add storage access util ([#264](https://github.com/latticexyz/mud/issues/264)) ([f18c398](https://github.com/latticexyz/mud/commit/f18c39831f5d5ab0186529eb2cfaee4991570e6f))

## [1.33.1](https://github.com/latticexyz/mud/compare/v1.33.0...v1.33.1) (2023-01-12)

**Note:** Version bump only for package mud

# [1.33.0](https://github.com/latticexyz/mud/compare/v1.32.0...v1.33.0) (2023-01-12)

### Bug Fixes

- **cli:** do not copy System test ABIs during build 🧱 ([#312](https://github.com/latticexyz/mud/issues/312)) ([660e508](https://github.com/latticexyz/mud/commit/660e5084076cfe4b86c371fb7fcdb1c68407c4ab))
- **solecs:** use \_setOwner in Ownable constructor ([#338](https://github.com/latticexyz/mud/issues/338)) ([851a3e6](https://github.com/latticexyz/mud/commit/851a3e60d226f1dec856f1f89e2d55bfe9c1ac8c))

### Features

- **cli:** add deploy option to specify whether dev flag should be appended to client url ([#313](https://github.com/latticexyz/mud/issues/313)) ([d3de8d2](https://github.com/latticexyz/mud/commit/d3de8d2386a72efd4c3d7fa857e0e51262fab0ee))
- **react:** add react package ([#294](https://github.com/latticexyz/mud/issues/294)) ([f5ee290](https://github.com/latticexyz/mud/commit/f5ee290e776276b2b0dd273705694df04a85f400))
- **std-contracts:** add SystemCallbackComponent ([#303](https://github.com/latticexyz/mud/issues/303)) ([7b3a859](https://github.com/latticexyz/mud/commit/7b3a859b8a776e66183baef900fad6f40b1529cb))

### Reverts

- Revert "feat: bump devnode gas limit to 100m (#289)" (#302) ([34c9d27](https://github.com/latticexyz/mud/commit/34c9d2771a9b7535d9dd5d78b15f12f3a01ca187)), closes [#289](https://github.com/latticexyz/mud/issues/289) [#302](https://github.com/latticexyz/mud/issues/302)

# [1.32.0](https://github.com/latticexyz/mud/compare/v1.31.3...v1.32.0) (2023-01-06)

### Bug Fixes

- update tween references after phaser bump ([#297](https://github.com/latticexyz/mud/issues/297)) ([9d6ed01](https://github.com/latticexyz/mud/commit/9d6ed0115d977a1a9678c23d42c4daaf3a9b8947))

### Features

- **ecs-browser:** replace react syntax highlighter with shiki and bundler with tsup ([#262](https://github.com/latticexyz/mud/issues/262)) ([915506d](https://github.com/latticexyz/mud/commit/915506d7e7ca0b5a68afb646388bb9d4bb689879))

## [1.31.3](https://github.com/latticexyz/mud/compare/v1.31.2...v1.31.3) (2022-12-16)

### Bug Fixes

- **cli:** better logs, more resilience, better gas price mgmt ([#300](https://github.com/latticexyz/mud/issues/300)) ([26c62e6](https://github.com/latticexyz/mud/commit/26c62e6c16738cbbd83dc5d2dacf8090c9beb102))

## [1.31.2](https://github.com/latticexyz/mud/compare/v1.31.1...v1.31.2) (2022-12-15)

### Bug Fixes

- **std-client:** allow default components to be passed in to setupMUDNetwork ([#299](https://github.com/latticexyz/mud/issues/299)) ([5d043ee](https://github.com/latticexyz/mud/commit/5d043eeb80936ef716ed92972111a9273b63511c))

## [1.31.1](https://github.com/latticexyz/mud/compare/v1.31.0...v1.31.1) (2022-12-15)

### Bug Fixes

- cli issue with circular dependencies ([#291](https://github.com/latticexyz/mud/issues/291)) ([bbc182f](https://github.com/latticexyz/mud/commit/bbc182fd36b20f69737fd0d337ad0d46332c7543))
- **cli:** catch error when attempting to invalid file ([#282](https://github.com/latticexyz/mud/issues/282)) ([add01a8](https://github.com/latticexyz/mud/commit/add01a8123495feaa194cf4624c2a02c4f24f1e2))
- **cli:** reset LibDeploy.sol using original/cached contents ([#292](https://github.com/latticexyz/mud/issues/292)) ([6e7a8b9](https://github.com/latticexyz/mud/commit/6e7a8b93cf89018444c58c69c785a658d59a49d4))
- new entities should be included in overrides ([#290](https://github.com/latticexyz/mud/issues/290)) ([878ee2a](https://github.com/latticexyz/mud/commit/878ee2a5718d73221686dfe7de1c31a0f16347d7))
- **std-contracts:** add virtual to MudTest setUp ([#298](https://github.com/latticexyz/mud/issues/298)) ([942cfcd](https://github.com/latticexyz/mud/commit/942cfcdd41ea961c32478764e7c4f33a1b6ca16e))

# [1.31.0](https://github.com/latticexyz/mud/compare/v1.30.1...v1.31.0) (2022-12-14)

### Bug Fixes

- add LoadingState component from SyncWorker ([#288](https://github.com/latticexyz/mud/issues/288)) ([2026abc](https://github.com/latticexyz/mud/commit/2026abc43b6104ca231b3bb6c0be3c19c87a7624))
- **cli:** mud trace bug for non-local networks ([#276](https://github.com/latticexyz/mud/issues/276)) ([3f6abeb](https://github.com/latticexyz/mud/commit/3f6abeb6dfc4ca090838c72d5c69c1215c1ed671))
- **cli:** replace LibDeploy.sol content with stub ([275824a](https://github.com/latticexyz/mud/commit/275824a28814f856adf5daa3332957edbc80b1aa))
- use interfaces in LibDeploy ([#278](https://github.com/latticexyz/mud/issues/278)) ([6d01082](https://github.com/latticexyz/mud/commit/6d01082f8119c67fcfdb2351aa98a3d7efa0989f))

### Features

- bump devnode gas limit to 100m ([#289](https://github.com/latticexyz/mud/issues/289)) ([a02e44b](https://github.com/latticexyz/mud/commit/a02e44bb9e3c2ee6b8aaea7b080cd35820bf1de1))
- **services:** twitter verification / linking behind a flag ([#274](https://github.com/latticexyz/mud/issues/274)) ([60d4ae8](https://github.com/latticexyz/mud/commit/60d4ae853dca2485f37a39537e63c4eae72432da))
- **solecs:** add world to IComponent definition ([#284](https://github.com/latticexyz/mud/issues/284)) ([881e4ea](https://github.com/latticexyz/mud/commit/881e4ea9e2e6aaa08abea3743c1449e02b9e12ae))
- **std-client:** add more granular relationship utilities ⏳ ([#283](https://github.com/latticexyz/mud/issues/283)) ([f094624](https://github.com/latticexyz/mud/commit/f094624cc1a6a5b2642917fab37f7f1410b4210d))

## [1.30.1](https://github.com/latticexyz/mud/compare/v1.30.0...v1.30.1) (2022-12-02)

**Note:** Version bump only for package mud

# [1.30.0](https://github.com/latticexyz/mud/compare/v1.29.0...v1.30.0) (2022-12-02)

### Features

- **cli:** hot system replacement, new commands (deploy-contracts, codegen-libdeploy, devnode, types, test, create) ([#277](https://github.com/latticexyz/mud/issues/277)) ([8e32f98](https://github.com/latticexyz/mud/commit/8e32f983208c37839bc3e347058dbc7e49b6247e))

# [1.29.0](https://github.com/latticexyz/mud/compare/v1.28.1...v1.29.0) (2022-11-29)

### Bug Fixes

- allow overriding preset components, replace Owned interface with IERC173, fix IComponent interface ([#239](https://github.com/latticexyz/mud/issues/239)) ([ae3983b](https://github.com/latticexyz/mud/commit/ae3983b047271ebcf96506f8a6cb0458deb602e7))

### Features

- **cli:** add faucet cli ([#271](https://github.com/latticexyz/mud/issues/271)) ([a33f1ce](https://github.com/latticexyz/mud/commit/a33f1ce97a13039407c5b786725b1b8efd3faeb6))
- **cli:** add mud types command for TypeChain type generation ([#259](https://github.com/latticexyz/mud/issues/259)) ([4303b40](https://github.com/latticexyz/mud/commit/4303b40b887961cbece6a004c55e0ce6edb65a18))
- **solecs:** add util to split up bitpacked data ([#247](https://github.com/latticexyz/mud/issues/247)) ([a7f73b0](https://github.com/latticexyz/mud/commit/a7f73b01e2f0387927e30a4e7b0846a69b3c0ce0))
- **std-contracts:** basic gas metrics for mud components ([#255](https://github.com/latticexyz/mud/issues/255)) ([2aeb4a6](https://github.com/latticexyz/mud/commit/2aeb4a65343de8bd026afcfa4b3b043c90662683))

## [1.28.1](https://github.com/latticexyz/mud/compare/v1.28.0...v1.28.1) (2022-11-24)

### Bug Fixes

- recalculate world view on phaser resize ([#263](https://github.com/latticexyz/mud/issues/263)) ([7a01b91](https://github.com/latticexyz/mud/commit/7a01b914cdba4691a697b08873abcc64936b991c))
- typescript errors ([#253](https://github.com/latticexyz/mud/issues/253)) ([83e0c7a](https://github.com/latticexyz/mud/commit/83e0c7a1eda900d254a73115446c4ce38b531645))

# [1.28.0](https://github.com/latticexyz/mud/compare/v1.27.1...v1.28.0) (2022-11-20)

### Features

- **network:** system call stream available in streaming service ([0244eb8](https://github.com/latticexyz/mud/commit/0244eb8d3ec1a7798136cf4ddefbd766cb830b8c)), closes [#254](https://github.com/latticexyz/mud/issues/254)

# [1.27.0](https://github.com/latticexyz/mud/compare/v1.26.0...v1.27.0) (2022-11-15)

### Bug Fixes

- **network:** disable browser cache in dev mode ([#213](https://github.com/latticexyz/mud/issues/213)) ([ba9e6bc](https://github.com/latticexyz/mud/commit/ba9e6bcaa869d48ce4e63c85e4f8c3b0c1d986b0))
- **phaserx:** scale zoom delta with pinch speed ([#242](https://github.com/latticexyz/mud/issues/242)) ([e939ed2](https://github.com/latticexyz/mud/commit/e939ed20d69145111aed1544be7f7cac3989ef12))
- **solecs:** restrict write access to Set and MapSet to owner ([#244](https://github.com/latticexyz/mud/issues/244)) ([f17a6d7](https://github.com/latticexyz/mud/commit/f17a6d7d3f533c385f7033835f0af4e13577776b))

### Code Refactoring

- **ecs-browser:** make dev components optional, remove unnecessary dependencies ([#235](https://github.com/latticexyz/mud/issues/235)) ([868ae02](https://github.com/latticexyz/mud/commit/868ae02d3707238403156d4457aef683da43f5bf)), closes [#231](https://github.com/latticexyz/mud/issues/231)

### BREAKING CHANGES

- **ecs-browser:** changes how props are handled, no longer are entities or other devComponent props
  required, these are inferred or set as optional and the handling is conditonal now

- Update packages/ecs-browser/src/ComponentEditor.tsx

Co-authored-by: alvarius <89248902+alvrs@users.noreply.github.com>

- Update packages/ecs-browser/src/ComponentEditor.tsx

Co-authored-by: alvarius <89248902+alvrs@users.noreply.github.com>

- feat(ecs-browser): migrate browser dev components to own function

Move creation of the dev components needed for the Browser to be created outside of the Browser for
easier hooking into

- fix(ecs-browser): remove unused import

- fix(ecs-browser): fix from Kooshaba

Co-authored-by: alvarius <89248902+alvrs@users.noreply.github.com>

# [1.26.0](https://github.com/latticexyz/mud/compare/v1.25.1...v1.26.0) (2022-11-07)

### Bug Fixes

- **phaserx:** avoid creating tilemap chunks if tilemap is not visible ([#241](https://github.com/latticexyz/mud/issues/241)) ([641e2c4](https://github.com/latticexyz/mud/commit/641e2c498967af1ece9ce8c1213d39725c489a11))

### Features

- **relay:** check message data doesn't exceed a configurable limit ([#195](https://github.com/latticexyz/mud/issues/195)) ([4e35ed3](https://github.com/latticexyz/mud/commit/4e35ed35eacbc68193d3fd561f085380294393e7))
- **services:** admin endpoint on faucet ([#238](https://github.com/latticexyz/mud/issues/238)) ([282fd69](https://github.com/latticexyz/mud/commit/282fd695aafe493e692629cf74af764c8293a238))

## [1.25.1](https://github.com/latticexyz/mud/compare/v1.25.0...v1.25.1) (2022-11-03)

**Note:** Version bump only for package mud

# [1.25.0](https://github.com/latticexyz/mud/compare/v1.24.1...v1.25.0) (2022-11-03)

### Bug Fixes

- add license ([af8eaa3](https://github.com/latticexyz/mud/commit/af8eaa3571b6ebb88f65016673483c8585d646f4))
- remove global install of cli ([653281e](https://github.com/latticexyz/mud/commit/653281e3e502b59f5ecdc752c83b3fb5e3449855))

### Features

- **network,std-client:** add support for SystemCall events in default MUD network setup ([#232](https://github.com/latticexyz/mud/issues/232)) ([93d947b](https://github.com/latticexyz/mud/commit/93d947b24bd641d8b6105f0d5ac308944903c26b))
- **network:** export createBlockNumberStream ([#230](https://github.com/latticexyz/mud/issues/230)) ([c227e5d](https://github.com/latticexyz/mud/commit/c227e5df39dd9ca81652af142f2b07f1b64b3629))
- **solecs:** allow overriding Component logic, better inheritance ([#229](https://github.com/latticexyz/mud/issues/229)) ([d4f5a4b](https://github.com/latticexyz/mud/commit/d4f5a4be482d249e1a417cbc1c91a4eb27233952))
- **std-client:** export missing types ([aefba08](https://github.com/latticexyz/mud/commit/aefba0864f75ff4378b614796a03a87b2803b431))
- working deploy script from mud basics ([#218](https://github.com/latticexyz/mud/issues/218)) ([fd1c61b](https://github.com/latticexyz/mud/commit/fd1c61bd3525bbeedc70dd0dc384936b583a7340))

## [1.24.1](https://github.com/latticexyz/mud/compare/v1.24.0...v1.24.1) (2022-10-29)

### Bug Fixes

- **std-contracts:** use assembly for delegation in UpgradableSystem ([#228](https://github.com/latticexyz/mud/issues/228)) ([1fa46fd](https://github.com/latticexyz/mud/commit/1fa46fd37da706e4c559a7b7d02ffa1b1bacc1bc))

# [1.24.0](https://github.com/latticexyz/mud/compare/v1.23.1...v1.24.0) (2022-10-28)

### Features

- v2 endpoint for pruned snapshot that returns entities as raw bytes ([#215](https://github.com/latticexyz/mud/issues/215)) ([28cce1e](https://github.com/latticexyz/mud/commit/28cce1e8a1240d72363fe786704e7fe976f7c995))

## [1.23.1](https://github.com/latticexyz/mud/compare/v1.23.0...v1.23.1) (2022-10-28)

### Bug Fixes

- avoid early return for unknown components ([#226](https://github.com/latticexyz/mud/issues/226)) ([bb8684f](https://github.com/latticexyz/mud/commit/bb8684f6390591c2e6e4d07e364cab204c04805c))

# [1.23.0](https://github.com/latticexyz/mud/compare/v1.22.0...v1.23.0) (2022-10-26)

### Features

- add UpgradableSystem ([#225](https://github.com/latticexyz/mud/issues/225)) ([8229633](https://github.com/latticexyz/mud/commit/822963305af2af0a7409282f815fc6a1dd3ca2b2))

# [1.22.0](https://github.com/latticexyz/mud/compare/v1.21.0...v1.22.0) (2022-10-26)

### Features

- **network:** expose method to register new system contracts on the client ([#224](https://github.com/latticexyz/mud/issues/224)) ([4583767](https://github.com/latticexyz/mud/commit/45837676ebe776f1e752affb7ea1dadf44e451f2))
- **network:** simplify calling untyped systems ([#223](https://github.com/latticexyz/mud/issues/223)) ([94e4788](https://github.com/latticexyz/mud/commit/94e4788174b019d3f57df98f3a291d0498d1f17c))

# [1.21.0](https://github.com/latticexyz/mud/compare/v1.20.0...v1.21.0) (2022-10-26)

### Bug Fixes

- **solecs:** remove console import from MapSet ([#216](https://github.com/latticexyz/mud/issues/216)) ([b3116b3](https://github.com/latticexyz/mud/commit/b3116b39912638f980eaccd2e2d25227d0917874))

### Features

- **network:** send ack between main thread and sync worker ([#220](https://github.com/latticexyz/mud/issues/220)) ([e06978a](https://github.com/latticexyz/mud/commit/e06978aafc37a0992ca0d7cb58a97da0a5295781))

# [1.20.0](https://github.com/latticexyz/mud/compare/v1.19.0...v1.20.0) (2022-10-22)

### Features

- **recs:** add util to clear cache of local cache component ([#217](https://github.com/latticexyz/mud/issues/217)) ([30a5868](https://github.com/latticexyz/mud/commit/30a5868f86a0d9e7a8de92f79c286841125f8ca7))

# [1.19.0](https://github.com/latticexyz/mud/compare/v1.18.0...v1.19.0) (2022-10-21)

### Bug Fixes

- checksum address / value when pruning snapshot ([#214](https://github.com/latticexyz/mud/issues/214)) ([64fd178](https://github.com/latticexyz/mud/commit/64fd178358ac05bb032cfd8cc1a1b87effa769ad))

### Features

- **network:** only create encoders if asked for it ([c5af08c](https://github.com/latticexyz/mud/commit/c5af08c7a0aa26ccc6e7085b1539ad4f271d4a41))

# [1.18.0](https://github.com/latticexyz/mud/compare/v1.17.0...v1.18.0) (2022-10-21)

### Bug Fixes

- **ecs-browser:** remove component on contract from ecs-browser ([#205](https://github.com/latticexyz/mud/issues/205)) ([f08c6d1](https://github.com/latticexyz/mud/commit/f08c6d17af7201c81dff40d0a007a201f2b3bd00))

### Features

- service stabilizations, send ecs tx on drip, new pruned snapshot endpoint ([#204](https://github.com/latticexyz/mud/issues/204)) ([d0de185](https://github.com/latticexyz/mud/commit/d0de185ca7fa2418064706928853e5cd691bdde9))
- **solecs:** add payable system interface ([#206](https://github.com/latticexyz/mud/issues/206)) ([a436d9e](https://github.com/latticexyz/mud/commit/a436d9e7795b42f81192fc12e11362006a074d24))
- **utils:** add more general euclidiean distance util ([687f840](https://github.com/latticexyz/mud/commit/687f8405bb8cfe8312d0527dc2985d27e11632a6))

# [1.17.0](https://github.com/latticexyz/mud/compare/v1.16.0...v1.17.0) (2022-10-19)

### Features

- allow specific snapshot chunk ratio ([#212](https://github.com/latticexyz/mud/issues/212)) ([827d972](https://github.com/latticexyz/mud/commit/827d972ac9ca11918520b5f040045dfb4cca1552))

# [1.16.0](https://github.com/latticexyz/mud/compare/v1.15.0...v1.16.0) (2022-10-19)

### Features

- **network:** expose more sync settings ([#211](https://github.com/latticexyz/mud/issues/211)) ([48987f1](https://github.com/latticexyz/mud/commit/48987f1c37af9a82a7f92da6f3c8247ece4a750f))

# [1.15.0](https://github.com/latticexyz/mud/compare/v1.14.2...v1.15.0) (2022-10-18)

### Features

- **network): expose relay ping method, feat(std-client:** add tx hash to action component ([#209](https://github.com/latticexyz/mud/issues/209)) ([3e0b4a7](https://github.com/latticexyz/mud/commit/3e0b4a75ec93605f8dc6f561b140ccc9d9722566))

## [1.14.2](https://github.com/latticexyz/mud/compare/v1.14.1...v1.14.2) (2022-10-18)

**Note:** Version bump only for package mud

## [1.14.1](https://github.com/latticexyz/mud/compare/v1.14.0...v1.14.1) (2022-10-18)

**Note:** Version bump only for package mud

# [1.14.0](https://github.com/latticexyz/mud/compare/v1.13.0...v1.14.0) (2022-10-18)

### Features

- expose registerComponent method from setupMUDNetwork ([#207](https://github.com/latticexyz/mud/issues/207)) ([4b078bd](https://github.com/latticexyz/mud/commit/4b078bd93c14dfbb1b06c5ca8bc92dee2e8dcfea))
- **mud.dev:** add video content ([ffca85e](https://github.com/latticexyz/mud/commit/ffca85e732cd8d607ad8e2869c64e52e43073186))

# [1.13.0](https://github.com/latticexyz/mud/compare/v1.12.0...v1.13.0) (2022-10-15)

### Features

- **network:** expose SystemsRegistry and ComponentsRegistry from setupMUDNetwork ([373d62b](https://github.com/latticexyz/mud/commit/373d62bb5e17083e9c348e74c5bc84dd6149ce69))

# [1.12.0](https://github.com/latticexyz/mud/compare/v1.11.0...v1.12.0) (2022-10-12)

### Bug Fixes

- **std-contracts:** fix name of Uint32Component ([#201](https://github.com/latticexyz/mud/issues/201)) ([82600e2](https://github.com/latticexyz/mud/commit/82600e24a71d48baa4956294b09de567eae33e48))

### Features

- fail without error on certain checks and other improvements ([#202](https://github.com/latticexyz/mud/issues/202)) ([f5d565e](https://github.com/latticexyz/mud/commit/f5d565e8c3b1dbd7a1c80a63b4365ce09354c6cf))

# [1.11.0](https://github.com/latticexyz/mud/compare/v1.10.0...v1.11.0) (2022-10-11)

### Features

- add BareComponent ([#200](https://github.com/latticexyz/mud/issues/200)) ([780d62c](https://github.com/latticexyz/mud/commit/780d62c716fdda67373f031dc1e0b3155e77b562))
- **relay:** check account balance is greater than a configured amount ([#194](https://github.com/latticexyz/mud/issues/194)) ([1cbbd5b](https://github.com/latticexyz/mud/commit/1cbbd5b3a000dff7998a970d93b2b80af44eba80))

# [1.10.0](https://github.com/latticexyz/mud/compare/v1.9.0...v1.10.0) (2022-10-11)

### Features

- **ecs-browser:** add support for modifying boolean values ([1dba52e](https://github.com/latticexyz/mud/commit/1dba52e6f50947786328ff37bb4a2b9c9b3fb877))

# [1.9.0](https://github.com/latticexyz/mud/compare/v1.8.0...v1.9.0) (2022-10-11)

### Bug Fixes

- **solecs): only allow components to register their own updates, feat(std-client:** add support for multiple overrides per component per action ([#199](https://github.com/latticexyz/mud/issues/199)) ([d8dd63e](https://github.com/latticexyz/mud/commit/d8dd63e8055c603d5df41ad47765a286d800c529))

### Features

- **network:** fall back to rpc if stream service errors ([#190](https://github.com/latticexyz/mud/issues/190)) ([414e777](https://github.com/latticexyz/mud/commit/414e77799259cdb28bf92c1ef603608d0bdb05fd))
- **services:** grpc prometheus metrics ([#196](https://github.com/latticexyz/mud/issues/196)) ([33e8959](https://github.com/latticexyz/mud/commit/33e895988d1d17658709a9bf8c748a50283e0252))

# [1.8.0](https://github.com/latticexyz/mud/compare/v1.7.1...v1.8.0) (2022-10-07)

### Bug Fixes

- **network:** use websocket to subscribe to relayer messages ([8218249](https://github.com/latticexyz/mud/commit/8218249a228a6b3acd52776b653688aa8d73e9a9))
- **relay:** open stream grpc endpoint not properly closing ([#187](https://github.com/latticexyz/mud/issues/187)) ([1db4a7d](https://github.com/latticexyz/mud/commit/1db4a7dd8fbc9220a75b6b3f6fb8d9b91d5cd605))

### Features

- connected relayer clients ([#188](https://github.com/latticexyz/mud/issues/188)) ([dc3fcdf](https://github.com/latticexyz/mud/commit/dc3fcdf7a02f3cced981ca933faf145c38b43fe0))
- **network:** expose connectedAddressChecksum ([#189](https://github.com/latticexyz/mud/issues/189)) ([e39d245](https://github.com/latticexyz/mud/commit/e39d245f62e5edf91896a39bb52c993df814ffb6))
- wss for stream service ([#186](https://github.com/latticexyz/mud/issues/186)) ([d4511ac](https://github.com/latticexyz/mud/commit/d4511acb1805ddacc71f83cdd9dc7858bd07aee1))

## [1.7.1](https://github.com/latticexyz/mud/compare/v1.7.0...v1.7.1) (2022-10-06)

**Note:** Version bump only for package mud

# [1.7.0](https://github.com/latticexyz/mud/compare/v1.6.0...v1.7.0) (2022-10-06)

### Bug Fixes

- **ecs-browser:** do not early return for entity 0 ([bf36cc0](https://github.com/latticexyz/mud/commit/bf36cc0288449f0f7dce72e35a49b6c6f6a8fa2b))
- **relay:** proper interval rate limiting and flag to control account balance check ([#181](https://github.com/latticexyz/mud/issues/181)) ([e84ae44](https://github.com/latticexyz/mud/commit/e84ae445962d5f3e432cfb4a7229a813eb47b681))

### Features

- add utils to normalize hex ids ([#185](https://github.com/latticexyz/mud/issues/185)) ([170e963](https://github.com/latticexyz/mud/commit/170e963eebce61b27d1b999f8afd8c8e176a739c))
- general service improvements ([#179](https://github.com/latticexyz/mud/issues/179)) ([e0dac83](https://github.com/latticexyz/mud/commit/e0dac83df6c4ab56c2db583e8d3d1d2541d1cd72))
- **services:** service-side changes for health probes ([#183](https://github.com/latticexyz/mud/issues/183)) ([da4cf91](https://github.com/latticexyz/mud/commit/da4cf914527ba7c09588d7dd1ac8836bd4378534))
- **soleces:** expose component functions set and remove internally without onlyWriter permissions ([#182](https://github.com/latticexyz/mud/issues/182)) ([662936b](https://github.com/latticexyz/mud/commit/662936bdeee38ac0da735c987413816b14b0218d))

# [1.6.0](https://github.com/latticexyz/mud/compare/v1.5.1...v1.6.0) (2022-10-04)

### Bug Fixes

- make OverridableComponent conform with Component type ([#180](https://github.com/latticexyz/mud/issues/180)) ([c9d2c31](https://github.com/latticexyz/mud/commit/c9d2c311aa1c86d9bcabdf67eee598c264618ad0))

### Features

- flag for sig verification, rate limiting of push, and check for balance when relaying ([#175](https://github.com/latticexyz/mud/issues/175)) ([0271ac9](https://github.com/latticexyz/mud/commit/0271ac9eb17fc1353e58ed11f6f6064e50956762))

## [1.5.1](https://github.com/latticexyz/mud/compare/v1.5.0...v1.5.1) (2022-10-03)

**Note:** Version bump only for package mud

# [1.5.0](https://github.com/latticexyz/mud/compare/v1.4.1...v1.5.0) (2022-10-03)

### Features

- add a stream rpc for message push ([#174](https://github.com/latticexyz/mud/issues/174)) ([e0aa956](https://github.com/latticexyz/mud/commit/e0aa956ac871064ecde87a07394525ca69e7f17d))
- faucet re-drip after tweet, rpc to get time until next drip ([#173](https://github.com/latticexyz/mud/issues/173)) ([27b08fc](https://github.com/latticexyz/mud/commit/27b08fc99f278cd01e4c91f6f63387271bae3ced))

## [1.4.1](https://github.com/latticexyz/mud/compare/v1.4.0...v1.4.1) (2022-10-03)

**Note:** Version bump only for package mud

# [1.4.0](https://github.com/latticexyz/mud/compare/v1.3.0...v1.4.0) (2022-10-03)

### Features

- add signature verification for all client actions via relay service ([#167](https://github.com/latticexyz/mud/issues/167)) ([7920d6e](https://github.com/latticexyz/mud/commit/7920d6eec20f3a669cb3a1a9e39cd822e421961a))
- faucet improvements ([#168](https://github.com/latticexyz/mud/issues/168)) ([29d0b91](https://github.com/latticexyz/mud/commit/29d0b91bca63324cc56854c710f1e7f779b4e553))
- **network:** add util for creating faucet service ([#171](https://github.com/latticexyz/mud/issues/171)) ([9f50d9c](https://github.com/latticexyz/mud/commit/9f50d9c3ae31132507c19bce7d3d5c8df7684cad))
- **network:** expose mappings and ecsEvent$ from setupMUDNetwork ([44a8676](https://github.com/latticexyz/mud/commit/44a8676a8d22e73276fd02a459d35270b1b4da9e))

# [1.3.0](https://github.com/latticexyz/mud/compare/v1.2.0...v1.3.0) (2022-09-30)

### Bug Fixes

- **network:** remove failed actions from the queue ([b27b958](https://github.com/latticexyz/mud/commit/b27b958aefc72eb8e35f72fc5108578dfb0f3b74))
- **recs:** change internal query behavior to match previous version ([47b8834](https://github.com/latticexyz/mud/commit/47b8834ce8d88f4b79febbfe94dbfb79def6d2b8))
- **std-client:** add stream service config to createMUDNetwork ([98b0861](https://github.com/latticexyz/mud/commit/98b0861cf059cfd291ea42d3a969a9e72be3d034))

### Features

- **recs:** add local cache component ([#169](https://github.com/latticexyz/mud/issues/169)) ([09058f6](https://github.com/latticexyz/mud/commit/09058f69a7d6d743afefc80da2c06020ff3d1a56))
- **recs:** allow multiple subscribers per query update$ ([6d13531](https://github.com/latticexyz/mud/commit/6d135314225f211814272e325fa8ab89952241ab))

# [1.2.0](https://github.com/latticexyz/mud/compare/v1.1.0...v1.2.0) (2022-09-29)

### Bug Fixes

- **network:** check event type instead of just value before decoding ([#166](https://github.com/latticexyz/mud/issues/166)) ([f4dedd9](https://github.com/latticexyz/mud/commit/f4dedd9005a110b2548f5b372f5a53abe06aacbf))

### Features

- **network:** increase network performance by reducing unnecessary rpc calls ([#165](https://github.com/latticexyz/mud/issues/165)) ([195b710](https://github.com/latticexyz/mud/commit/195b71019b2be623d99f7a90c93a661cdb743a87))

# [1.1.0](https://github.com/latticexyz/mud/compare/v1.0.0...v1.1.0) (2022-09-28)

### Features

- add createRelayService, add utils to work with Uint8Arrays ([#164](https://github.com/latticexyz/mud/issues/164)) ([b02992b](https://github.com/latticexyz/mud/commit/b02992b73393740d7510b1f9d3d9e6ea0030f462))
- basic faucet service implementation ([#163](https://github.com/latticexyz/mud/issues/163)) ([3217176](https://github.com/latticexyz/mud/commit/3217176e65a66be581c1ab705eb9123cb2a812f9))
- **ecs-browser:** make nameComponent and spawnPrototypeAt optional ([7822d53](https://github.com/latticexyz/mud/commit/7822d53f03862a146b2a58aac3a024b2b274d614))
- initial implementation of ecs relay service ([#157](https://github.com/latticexyz/mud/issues/157)) ([140aec3](https://github.com/latticexyz/mud/commit/140aec3e92269f8c79fe0ef5e6639ca0ff056282))

# [1.0.0](https://github.com/latticexyz/mud/compare/v0.16.4...v1.0.0) (2022-09-27)

**Note:** Version bump only for package mud

## [0.16.4](https://github.com/latticexyz/mud/compare/v0.16.3...v0.16.4) (2022-09-26)

### Bug Fixes

- **network:** cancel tx request if gas estimation failed ([565b37f](https://github.com/latticexyz/mud/commit/565b37f5a7408c06e2fd5fdab2f42d69f8db6610))

## [0.16.3](https://github.com/latticexyz/mud/compare/v0.16.2...v0.16.3) (2022-09-26)

### Bug Fixes

- do gas estimation right before sending tx to avoid invalid gas estimations ([f251642](https://github.com/latticexyz/mud/commit/f25164268834390d35637b7aea84998cf88e16ae))

## [0.16.2](https://github.com/latticexyz/mud/compare/v0.16.1...v0.16.2) (2022-09-26)

**Note:** Version bump only for package mud

## [0.16.1](https://github.com/latticexyz/mud/compare/v0.16.0...v0.16.1) (2022-09-26)

**Note:** Version bump only for package mud

# [0.16.0](https://github.com/latticexyz/mud/compare/v0.15.1...v0.16.0) (2022-09-26)

### Bug Fixes

- **std-client:** add generic type to waitForComponentValueIn ([f1641d4](https://github.com/latticexyz/mud/commit/f1641d4a69a5479252a5cc01186a2fdc202eb45e))

### Features

- **network:** add system call stream ([#162](https://github.com/latticexyz/mud/issues/162)) ([5caef57](https://github.com/latticexyz/mud/commit/5caef57165ed1a927dc8631a361189abfd54ea7a))
- **recs:** add support for custom type in component ([#158](https://github.com/latticexyz/mud/issues/158)) ([fdc781d](https://github.com/latticexyz/mud/commit/fdc781d851147f2a98cbe95e89789a3c0ee226ca))
- **std-contracts:** add FunctionComponent ([#161](https://github.com/latticexyz/mud/issues/161)) ([d720277](https://github.com/latticexyz/mud/commit/d7202774a5a068a99b88a63cb18100482dc18cb8))
- **utils:** add keccak256Coord ([#160](https://github.com/latticexyz/mud/issues/160)) ([1734cdb](https://github.com/latticexyz/mud/commit/1734cdb02743d209a8f9c245bf42a1b750403a60))

## [0.15.1](https://github.com/latticexyz/mud/compare/v0.15.0...v0.15.1) (2022-09-23)

**Note:** Version bump only for package mud

# [0.15.0](https://github.com/latticexyz/mud/compare/v0.14.2...v0.15.0) (2022-09-21)

### Features

- add keccak256Coord ([d0d4500](https://github.com/latticexyz/mud/commit/d0d450075f2afba3f94fda368ce0f6854113f714))

## [0.14.2](https://github.com/latticexyz/mud/compare/v0.14.1...v0.14.2) (2022-09-21)

**Note:** Version bump only for package mud

## [0.14.1](https://github.com/latticexyz/mud/compare/v0.14.0...v0.14.1) (2022-09-21)

### Bug Fixes

- **network:** initial sync ([#156](https://github.com/latticexyz/mud/issues/156)) ([6116585](https://github.com/latticexyz/mud/commit/611658584ffd52c63f837f239d888aa55959320e))

# [0.14.0](https://github.com/latticexyz/mud/compare/v0.13.0...v0.14.0) (2022-09-20)

### Bug Fixes

- phaser input click$ stream ([#152](https://github.com/latticexyz/mud/issues/152)) ([a7e1cfe](https://github.com/latticexyz/mud/commit/a7e1cfe5f0282b3a244ad224e907ae51e0cc5ce0))
- **phaserx:** distinguish left and right click in click$ stream ([#155](https://github.com/latticexyz/mud/issues/155)) ([004753d](https://github.com/latticexyz/mud/commit/004753d9261a11ca2fcfad6b25c003af59b1e997))
- **std-client:** remove references to old phaser version ([#153](https://github.com/latticexyz/mud/issues/153)) ([c691c6e](https://github.com/latticexyz/mud/commit/c691c6e9288a375dae68cf2969ef42a2a33189fc))

### Features

- **std-client:** add setupContracts ([#154](https://github.com/latticexyz/mud/issues/154)) ([be86d24](https://github.com/latticexyz/mud/commit/be86d243ff3d7efae7225933066246f2747ea759))

# [0.13.0](https://github.com/latticexyz/mud/compare/v0.12.0...v0.13.0) (2022-09-19)

### Features

- various tweaks for mudwar ([#151](https://github.com/latticexyz/mud/issues/151)) ([53bc3cc](https://github.com/latticexyz/mud/commit/53bc3cc4405c7916821d219963e592e09b51db2a))

# [0.12.0](https://github.com/latticexyz/mud/compare/v0.11.1...v0.12.0) (2022-09-16)

### Features

- **cli:** forge bulk upload ecs state script ([#142](https://github.com/latticexyz/mud/issues/142)) ([bbd6e1f](https://github.com/latticexyz/mud/commit/bbd6e1f4be18dcae94addc65849136ad01d1ba2a))

## [0.11.1](https://github.com/latticexyz/mud/compare/v0.11.0...v0.11.1) (2022-09-15)

### Bug Fixes

- do not run prepack multiple times when publishing ([4f6f4c3](https://github.com/latticexyz/mud/commit/4f6f4c35a53c105951b32a071e47a748b2502cda))

# [0.11.0](https://github.com/latticexyz/mud/compare/v0.10.0...v0.11.0) (2022-09-15)

### Features

- add more granularity to initial sync state report ([#146](https://github.com/latticexyz/mud/issues/146)) ([d4ba338](https://github.com/latticexyz/mud/commit/d4ba338a50048c2d5180ce4f917d94f5b0893935))

# [0.10.0](https://github.com/latticexyz/mud/compare/v0.9.0...v0.10.0) (2022-09-14)

### Features

- add chunk snapshot and stream service ([#139](https://github.com/latticexyz/mud/issues/139)) ([8c9d4b3](https://github.com/latticexyz/mud/commit/8c9d4b30ed70470ca8770565b6472359e0e0f2bc))
- matching Perlin noise implementations in Solidity and AssemblyScript ([#145](https://github.com/latticexyz/mud/issues/145)) ([29094c4](https://github.com/latticexyz/mud/commit/29094c4b0c3eeeacd3af690310c7de93a0c45e14))

# [0.9.0](https://github.com/latticexyz/mud/compare/v0.8.1...v0.9.0) (2022-09-13)

### Bug Fixes

- **network:** align hex entity id formatting ([#140](https://github.com/latticexyz/mud/issues/140)) ([93b1bd6](https://github.com/latticexyz/mud/commit/93b1bd6688780dc185a1c7e353954e2c5c85f648))

### Features

- **network:** add loading state component update stream to SyncWorker ([#141](https://github.com/latticexyz/mud/issues/141)) ([824c4f3](https://github.com/latticexyz/mud/commit/824c4f366775be1f0e636b3781c743333421b679))

### BREAKING CHANGES

- **network:** The loading state component is attached to the entity with id 0x060D (GodID). The
  std-client package previously exported a different mudwar specific GodID, which has been replaced
  with the 0x060D GodID exported by the network package.

- test(network): add test for LoadingState and fix existing tests

## [0.8.1](https://github.com/latticexyz/mud/compare/v0.8.0...v0.8.1) (2022-08-22)

### Bug Fixes

- start from initialBlockNumber, build settings, fix github actions, and other minor additions ([#137](https://github.com/latticexyz/mud/issues/137)) ([08eab5c](https://github.com/latticexyz/mud/commit/08eab5c6b0d99a9ffa8a315e16454ecc9306f410))

# [0.8.0](https://github.com/latticexyz/mud/compare/v0.7.0...v0.8.0) (2022-08-22)

### Bug Fixes

- fix mud.dev build and improve responsiveness ([#134](https://github.com/latticexyz/mud/issues/134)) ([a3f2b24](https://github.com/latticexyz/mud/commit/a3f2b2438203697f1dd9f8710b15caa5cd83e40d))

### Features

- add codeowners file ([#132](https://github.com/latticexyz/mud/issues/132)) ([258c9e5](https://github.com/latticexyz/mud/commit/258c9e53d411f9062f525b1767dbe9243f5eeb71))
- add mud.dev ([#133](https://github.com/latticexyz/mud/issues/133)) ([302588c](https://github.com/latticexyz/mud/commit/302588cbbab2803396b894bc006d13e6ac943da9))
- integrate proto from services into network ([#131](https://github.com/latticexyz/mud/issues/131)) ([756fdb7](https://github.com/latticexyz/mud/commit/756fdb7cae6441e692088fd9cbbc8d9d327a70e0))

# [0.7.0](https://github.com/latticexyz/mud/compare/v0.6.0...v0.7.0) (2022-08-19)

### Features

- integrate mud services ([#130](https://github.com/latticexyz/mud/issues/130)) ([abe763c](https://github.com/latticexyz/mud/commit/abe763cc996b999c215498b780d1e35f95f4adb9))

# [0.6.0](https://github.com/latticexyz/mud/compare/v0.5.1...v0.6.0) (2022-08-15)

### Code Refactoring

- sync worker (+ integrated snapshot service) ([#125](https://github.com/latticexyz/mud/issues/125)) ([6173b59](https://github.com/latticexyz/mud/commit/6173b596713b0dad73d14288ece3ac66ca3972d3))

### BREAKING CHANGES

- sync worker update stream returns component id instead of component key

- test(network): add tests for sync utils and SyncWorker logic

- chore: remove logs and improve comments

- chore: add logs

Co-authored-by: andrii dobroshynski <24281657+andriidski@users.noreply.github.com>

## [0.5.1](https://github.com/latticexyz/mud/compare/v0.5.0...v0.5.1) (2022-08-05)

### Bug Fixes

- only render prototype creator if required components are provided ([#124](https://github.com/latticexyz/mud/issues/124)) ([d877b39](https://github.com/latticexyz/mud/commit/d877b39ceab44f3b6f0144e02575efba670b7e72))

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
- **network:** integrate snapshot service ([#24](https://github.com/latticexyz/mud/issues/24)) ([a146164](https://github.com/latticexyz/mud/commit/a146164e1ccab77b88499c213b21f60270ed714b))
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
