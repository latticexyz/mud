# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.42.0](https://github.com/latticexyz/mud/compare/v1.41.0...v1.42.0) (2023-04-13)

### Features

- v2 event decoding ([#415](https://github.com/latticexyz/mud/issues/415)) ([374ed54](https://github.com/latticexyz/mud/commit/374ed542c3387a4ec2b36ab68ae534419aa58763))

# [1.41.0](https://github.com/latticexyz/mud/compare/v1.40.0...v1.41.0) (2023-03-09)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.40.0](https://github.com/latticexyz/mud/compare/v1.39.0...v1.40.0) (2023-03-03)

### Bug Fixes

- **ecs-browser:** fix some errors in ecs-browser ([#420](https://github.com/latticexyz/mud/issues/420)) ([2a7ce21](https://github.com/latticexyz/mud/commit/2a7ce210553b2b9a6b2dffddac069be24802645f))

# [1.39.0](https://github.com/latticexyz/mud/compare/v1.38.0...v1.39.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.38.0](https://github.com/latticexyz/mud/compare/v1.37.1...v1.38.0) (2023-02-22)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.37.1](https://github.com/latticexyz/mud/compare/v1.37.0...v1.37.1) (2023-02-17)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.37.0](https://github.com/latticexyz/mud/compare/v1.36.1...v1.37.0) (2023-02-16)

### Bug Fixes

- package entry points, peer dep versions ([#409](https://github.com/latticexyz/mud/issues/409)) ([66a7fd6](https://github.com/latticexyz/mud/commit/66a7fd6f74620ce02c60e3d55701d4740cc65251))

### Reverts

- Revert "chore(release): publish v1.37.0" ([c934f53](https://github.com/latticexyz/mud/commit/c934f5388c1e56f2fe6390fdda30f5b9b1ea1c20))

## [1.36.1](https://github.com/latticexyz/mud/compare/v1.36.0...v1.36.1) (2023-02-16)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.35.0](https://github.com/latticexyz/mud/compare/v1.34.0...v1.35.0) (2023-02-15)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.34.0](https://github.com/latticexyz/mud/compare/v1.33.1...v1.34.0) (2023-01-29)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.33.1](https://github.com/latticexyz/mud/compare/v1.33.0...v1.33.1) (2023-01-12)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.33.0](https://github.com/latticexyz/mud/compare/v1.32.0...v1.33.0) (2023-01-12)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.32.0](https://github.com/latticexyz/mud/compare/v1.31.3...v1.32.0) (2023-01-06)

### Features

- **ecs-browser:** replace react syntax highlighter with shiki and bundler with tsup ([#262](https://github.com/latticexyz/mud/issues/262)) ([915506d](https://github.com/latticexyz/mud/commit/915506d7e7ca0b5a68afb646388bb9d4bb689879))

## [1.31.3](https://github.com/latticexyz/mud/compare/v1.31.2...v1.31.3) (2022-12-16)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.31.2](https://github.com/latticexyz/mud/compare/v1.31.1...v1.31.2) (2022-12-15)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.31.1](https://github.com/latticexyz/mud/compare/v1.31.0...v1.31.1) (2022-12-15)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.31.0](https://github.com/latticexyz/mud/compare/v1.30.1...v1.31.0) (2022-12-14)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.30.1](https://github.com/latticexyz/mud/compare/v1.30.0...v1.30.1) (2022-12-02)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.30.0](https://github.com/latticexyz/mud/compare/v1.29.0...v1.30.0) (2022-12-02)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.29.0](https://github.com/latticexyz/mud/compare/v1.28.1...v1.29.0) (2022-11-29)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.28.1](https://github.com/latticexyz/mud/compare/v1.28.0...v1.28.1) (2022-11-24)

### Bug Fixes

- typescript errors ([#253](https://github.com/latticexyz/mud/issues/253)) ([83e0c7a](https://github.com/latticexyz/mud/commit/83e0c7a1eda900d254a73115446c4ce38b531645))

# [1.28.0](https://github.com/latticexyz/mud/compare/v1.27.1...v1.28.0) (2022-11-20)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.27.0](https://github.com/latticexyz/mud/compare/v1.26.0...v1.27.0) (2022-11-15)

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

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.25.1](https://github.com/latticexyz/mud/compare/v1.25.0...v1.25.1) (2022-11-03)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.25.0](https://github.com/latticexyz/mud/compare/v1.24.1...v1.25.0) (2022-11-03)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.24.1](https://github.com/latticexyz/mud/compare/v1.24.0...v1.24.1) (2022-10-29)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.24.0](https://github.com/latticexyz/mud/compare/v1.23.1...v1.24.0) (2022-10-28)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.23.1](https://github.com/latticexyz/mud/compare/v1.23.0...v1.23.1) (2022-10-28)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.23.0](https://github.com/latticexyz/mud/compare/v1.22.0...v1.23.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.22.0](https://github.com/latticexyz/mud/compare/v1.21.0...v1.22.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.21.0](https://github.com/latticexyz/mud/compare/v1.20.0...v1.21.0) (2022-10-26)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.20.0](https://github.com/latticexyz/mud/compare/v1.19.0...v1.20.0) (2022-10-22)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.19.0](https://github.com/latticexyz/mud/compare/v1.18.0...v1.19.0) (2022-10-21)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.18.0](https://github.com/latticexyz/mud/compare/v1.17.0...v1.18.0) (2022-10-21)

### Bug Fixes

- **ecs-browser:** remove component on contract from ecs-browser ([#205](https://github.com/latticexyz/mud/issues/205)) ([f08c6d1](https://github.com/latticexyz/mud/commit/f08c6d17af7201c81dff40d0a007a201f2b3bd00))

# [1.17.0](https://github.com/latticexyz/mud/compare/v1.16.0...v1.17.0) (2022-10-19)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.16.0](https://github.com/latticexyz/mud/compare/v1.15.0...v1.16.0) (2022-10-19)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.15.0](https://github.com/latticexyz/mud/compare/v1.14.2...v1.15.0) (2022-10-18)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.14.2](https://github.com/latticexyz/mud/compare/v1.14.1...v1.14.2) (2022-10-18)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.14.1](https://github.com/latticexyz/mud/compare/v1.14.0...v1.14.1) (2022-10-18)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.14.0](https://github.com/latticexyz/mud/compare/v1.13.0...v1.14.0) (2022-10-18)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.13.0](https://github.com/latticexyz/mud/compare/v1.12.0...v1.13.0) (2022-10-15)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.12.0](https://github.com/latticexyz/mud/compare/v1.11.0...v1.12.0) (2022-10-12)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.11.0](https://github.com/latticexyz/mud/compare/v1.10.0...v1.11.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.10.0](https://github.com/latticexyz/mud/compare/v1.9.0...v1.10.0) (2022-10-11)

### Features

- **ecs-browser:** add support for modifying boolean values ([1dba52e](https://github.com/latticexyz/mud/commit/1dba52e6f50947786328ff37bb4a2b9c9b3fb877))

# [1.9.0](https://github.com/latticexyz/mud/compare/v1.8.0...v1.9.0) (2022-10-11)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.8.0](https://github.com/latticexyz/mud/compare/v1.7.1...v1.8.0) (2022-10-07)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.7.1](https://github.com/latticexyz/mud/compare/v1.7.0...v1.7.1) (2022-10-06)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.7.0](https://github.com/latticexyz/mud/compare/v1.6.0...v1.7.0) (2022-10-06)

### Bug Fixes

- **ecs-browser:** do not early return for entity 0 ([bf36cc0](https://github.com/latticexyz/mud/commit/bf36cc0288449f0f7dce72e35a49b6c6f6a8fa2b))

# [1.6.0](https://github.com/latticexyz/mud/compare/v1.5.1...v1.6.0) (2022-10-04)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.5.1](https://github.com/latticexyz/mud/compare/v1.5.0...v1.5.1) (2022-10-03)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.5.0](https://github.com/latticexyz/mud/compare/v1.4.1...v1.5.0) (2022-10-03)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [1.4.1](https://github.com/latticexyz/mud/compare/v1.4.0...v1.4.1) (2022-10-03)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.4.0](https://github.com/latticexyz/mud/compare/v1.3.0...v1.4.0) (2022-10-03)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.3.0](https://github.com/latticexyz/mud/compare/v1.2.0...v1.3.0) (2022-09-30)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.2.0](https://github.com/latticexyz/mud/compare/v1.1.0...v1.2.0) (2022-09-29)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [1.1.0](https://github.com/latticexyz/mud/compare/v1.0.0...v1.1.0) (2022-09-28)

### Features

- **ecs-browser:** make nameComponent and spawnPrototypeAt optional ([7822d53](https://github.com/latticexyz/mud/commit/7822d53f03862a146b2a58aac3a024b2b274d614))

# [1.0.0](https://github.com/latticexyz/mud/compare/v0.16.4...v1.0.0) (2022-09-27)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.16.4](https://github.com/latticexyz/mud/compare/v0.16.3...v0.16.4) (2022-09-26)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.16.3](https://github.com/latticexyz/mud/compare/v0.16.2...v0.16.3) (2022-09-26)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.16.2](https://github.com/latticexyz/mud/compare/v0.16.1...v0.16.2) (2022-09-26)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.16.1](https://github.com/latticexyz/mud/compare/v0.16.0...v0.16.1) (2022-09-26)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [0.16.0](https://github.com/latticexyz/mud/compare/v0.15.1...v0.16.0) (2022-09-26)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.15.1](https://github.com/latticexyz/mud/compare/v0.15.0...v0.15.1) (2022-09-23)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [0.15.0](https://github.com/latticexyz/mud/compare/v0.14.2...v0.15.0) (2022-09-21)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.14.2](https://github.com/latticexyz/mud/compare/v0.14.1...v0.14.2) (2022-09-21)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.14.1](https://github.com/latticexyz/mud/compare/v0.14.0...v0.14.1) (2022-09-21)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [0.14.0](https://github.com/latticexyz/mud/compare/v0.13.0...v0.14.0) (2022-09-20)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [0.13.0](https://github.com/latticexyz/mud/compare/v0.12.0...v0.13.0) (2022-09-19)

### Features

- various tweaks for mudwar ([#151](https://github.com/latticexyz/mud/issues/151)) ([53bc3cc](https://github.com/latticexyz/mud/commit/53bc3cc4405c7916821d219963e592e09b51db2a))

# [0.12.0](https://github.com/latticexyz/mud/compare/v0.11.1...v0.12.0) (2022-09-16)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.11.1](https://github.com/latticexyz/mud/compare/v0.11.0...v0.11.1) (2022-09-15)

### Bug Fixes

- do not run prepack multiple times when publishing ([4f6f4c3](https://github.com/latticexyz/mud/commit/4f6f4c35a53c105951b32a071e47a748b2502cda))

# [0.11.0](https://github.com/latticexyz/mud/compare/v0.10.0...v0.11.0) (2022-09-15)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [0.10.0](https://github.com/latticexyz/mud/compare/v0.9.0...v0.10.0) (2022-09-14)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [0.9.0](https://github.com/latticexyz/mud/compare/v0.8.1...v0.9.0) (2022-09-13)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.8.1](https://github.com/latticexyz/mud/compare/v0.8.0...v0.8.1) (2022-08-22)

### Bug Fixes

- start from initialBlockNumber, build settings, fix github actions, and other minor additions ([#137](https://github.com/latticexyz/mud/issues/137)) ([08eab5c](https://github.com/latticexyz/mud/commit/08eab5c6b0d99a9ffa8a315e16454ecc9306f410))

# [0.8.0](https://github.com/latticexyz/mud/compare/v0.7.0...v0.8.0) (2022-08-22)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [0.7.0](https://github.com/latticexyz/mud/compare/v0.6.0...v0.7.0) (2022-08-19)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [0.6.0](https://github.com/latticexyz/mud/compare/v0.5.1...v0.6.0) (2022-08-15)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.5.1](https://github.com/latticexyz/mud/compare/v0.5.0...v0.5.1) (2022-08-05)

### Bug Fixes

- only render prototype creator if required components are provided ([#124](https://github.com/latticexyz/mud/issues/124)) ([d877b39](https://github.com/latticexyz/mud/commit/d877b39ceab44f3b6f0144e02575efba670b7e72))

# [0.5.0](https://github.com/latticexyz/mud/compare/v0.4.3...v0.5.0) (2022-08-05)

### Bug Fixes

- CacheWorker ([#118](https://github.com/latticexyz/mud/issues/118)) ([bfe006e](https://github.com/latticexyz/mud/commit/bfe006e6adf064982a14d5dc1541d39b1b6016e2))
- optimism, cancel action if gas check fails, add noise utils, fix ecs-browser entry point ([#119](https://github.com/latticexyz/mud/issues/119)) ([f35d3c3](https://github.com/latticexyz/mud/commit/f35d3c3cc7fc9385a215dfda6762a2a825c9fd6d))

### Features

- **ecs-browser:** Allow spawning of prototypes at arbitrary locations ([#117](https://github.com/latticexyz/mud/issues/117)) ([b31bfcd](https://github.com/latticexyz/mud/commit/b31bfcdd800214908e669b021e4865a68efee795))

## [0.4.3](https://github.com/latticexyz/mud/compare/v0.4.2...v0.4.3) (2022-07-30)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.4.2](https://github.com/latticexyz/mud/compare/v0.4.1...v0.4.2) (2022-07-29)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.4.1](https://github.com/latticexyz/mud/compare/v0.4.0...v0.4.1) (2022-07-29)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [0.4.0](https://github.com/latticexyz/mud/compare/v0.3.2...v0.4.0) (2022-07-29)

### Features

- add 3d components ([d230339](https://github.com/latticexyz/mud/commit/d230339bdf3fbfaf4596de759a25fb616a7ab572))

## [0.3.2](https://github.com/latticexyz/mud/compare/v0.3.1...v0.3.2) (2022-07-26)

**Note:** Version bump only for package @latticexyz/ecs-browser

## [0.3.1](https://github.com/latticexyz/mud/compare/v0.3.0...v0.3.1) (2022-07-26)

**Note:** Version bump only for package @latticexyz/ecs-browser

# [0.3.0](https://github.com/latticexyz/mud/compare/v0.2.0...v0.3.0) (2022-07-26)

### Features

- mudwar prototype (nyc sprint 2) ([#59](https://github.com/latticexyz/mud/issues/59)) ([a3db20e](https://github.com/latticexyz/mud/commit/a3db20e14c641b8b456775ee191eca6f016d47f5)), closes [#58](https://github.com/latticexyz/mud/issues/58) [#61](https://github.com/latticexyz/mud/issues/61) [#64](https://github.com/latticexyz/mud/issues/64) [#62](https://github.com/latticexyz/mud/issues/62) [#66](https://github.com/latticexyz/mud/issues/66) [#69](https://github.com/latticexyz/mud/issues/69) [#72](https://github.com/latticexyz/mud/issues/72) [#73](https://github.com/latticexyz/mud/issues/73) [#74](https://github.com/latticexyz/mud/issues/74) [#76](https://github.com/latticexyz/mud/issues/76) [#75](https://github.com/latticexyz/mud/issues/75) [#77](https://github.com/latticexyz/mud/issues/77) [#78](https://github.com/latticexyz/mud/issues/78) [#79](https://github.com/latticexyz/mud/issues/79) [#80](https://github.com/latticexyz/mud/issues/80) [#82](https://github.com/latticexyz/mud/issues/82) [#86](https://github.com/latticexyz/mud/issues/86) [#83](https://github.com/latticexyz/mud/issues/83) [#81](https://github.com/latticexyz/mud/issues/81) [#85](https://github.com/latticexyz/mud/issues/85) [#84](https://github.com/latticexyz/mud/issues/84) [#87](https://github.com/latticexyz/mud/issues/87) [#91](https://github.com/latticexyz/mud/issues/91) [#88](https://github.com/latticexyz/mud/issues/88) [#90](https://github.com/latticexyz/mud/issues/90) [#92](https://github.com/latticexyz/mud/issues/92) [#93](https://github.com/latticexyz/mud/issues/93) [#89](https://github.com/latticexyz/mud/issues/89) [#94](https://github.com/latticexyz/mud/issues/94) [#95](https://github.com/latticexyz/mud/issues/95) [#98](https://github.com/latticexyz/mud/issues/98) [#100](https://github.com/latticexyz/mud/issues/100) [#97](https://github.com/latticexyz/mud/issues/97) [#101](https://github.com/latticexyz/mud/issues/101) [#105](https://github.com/latticexyz/mud/issues/105) [#106](https://github.com/latticexyz/mud/issues/106)

# [0.2.0](https://github.com/latticexyz/mud/compare/v0.1.8...v0.2.0) (2022-07-05)

### Features

- component browser 📈 ([#16](https://github.com/latticexyz/mud/issues/16)) ([37af75e](https://github.com/latticexyz/mud/commit/37af75ecb11266e5877d04cb3224698605b87646))
- on-chain maps (nyc sprint 1) ([#38](https://github.com/latticexyz/mud/issues/38)) ([089c46d](https://github.com/latticexyz/mud/commit/089c46d7c0e112d1670e3bcd01a35f08ee21d593)), closes [#17](https://github.com/latticexyz/mud/issues/17) [#20](https://github.com/latticexyz/mud/issues/20) [#18](https://github.com/latticexyz/mud/issues/18) [#25](https://github.com/latticexyz/mud/issues/25) [#26](https://github.com/latticexyz/mud/issues/26) [#27](https://github.com/latticexyz/mud/issues/27) [#28](https://github.com/latticexyz/mud/issues/28) [#29](https://github.com/latticexyz/mud/issues/29) [#30](https://github.com/latticexyz/mud/issues/30) [#31](https://github.com/latticexyz/mud/issues/31) [#33](https://github.com/latticexyz/mud/issues/33) [#32](https://github.com/latticexyz/mud/issues/32) [#34](https://github.com/latticexyz/mud/issues/34) [#35](https://github.com/latticexyz/mud/issues/35) [#36](https://github.com/latticexyz/mud/issues/36) [#37](https://github.com/latticexyz/mud/issues/37) [#39](https://github.com/latticexyz/mud/issues/39) [#40](https://github.com/latticexyz/mud/issues/40) [#41](https://github.com/latticexyz/mud/issues/41) [#42](https://github.com/latticexyz/mud/issues/42) [#43](https://github.com/latticexyz/mud/issues/43) [#44](https://github.com/latticexyz/mud/issues/44) [#45](https://github.com/latticexyz/mud/issues/45) [#46](https://github.com/latticexyz/mud/issues/46) [#48](https://github.com/latticexyz/mud/issues/48) [#49](https://github.com/latticexyz/mud/issues/49) [#50](https://github.com/latticexyz/mud/issues/50)
