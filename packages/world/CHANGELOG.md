# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

### Bug Fixes

- **cli:** add missing await to tablegen, fix formatting ([#472](https://github.com/latticexyz/mud/issues/472)) ([4313c27](https://github.com/latticexyz/mud/commit/4313c277b10c0334716e5c3728ffeaef643c1e6b))
- **world:** fix schema order ([#464](https://github.com/latticexyz/mud/issues/464)) ([3d137dd](https://github.com/latticexyz/mud/commit/3d137dd5371fe4670458bdc7ce20c2e40cbe24ae))

### Features

- add pushToField to Store and World ([#434](https://github.com/latticexyz/mud/issues/434)) ([b665efc](https://github.com/latticexyz/mud/commit/b665efcb407992779c93a400199dee8ffdc03cb7))
- **cli:** add setMetadata to autogen of table libraries ([#466](https://github.com/latticexyz/mud/issues/466)) ([1e129fe](https://github.com/latticexyz/mud/commit/1e129fe9ced354e838d3d9afc9839aba82fbf210))
- **cli:** add v2 deployment script ([#450](https://github.com/latticexyz/mud/issues/450)) ([1db37a5](https://github.com/latticexyz/mud/commit/1db37a5c6b736fdc5f806653b78f76b02239f2bb))
- **cli:** user types and route/path separation ([#454](https://github.com/latticexyz/mud/issues/454)) ([758bf03](https://github.com/latticexyz/mud/commit/758bf0388c9e282c58b2890cadb4a59e00978d26))

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

### Features

- add StoreMetadata table for table name and field names to Store and World ([#428](https://github.com/latticexyz/mud/issues/428)) ([ae39ace](https://github.com/latticexyz/mud/commit/ae39acec12e3263bcb9a8cd4f0a4db5d98b96333))
- v2 - add store, world and schema-type, cli table code generation ([#422](https://github.com/latticexyz/mud/issues/422)) ([cb731e0](https://github.com/latticexyz/mud/commit/cb731e0937e614bb316e6bc824813799559956c8))

### BREAKING CHANGES

- This commit removes the deprecated `mud deploy` CLI command. Use `mud deploy-contracts` instead.
