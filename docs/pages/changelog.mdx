## Version 2.2.24

Release date: Tue Sep 30 2025

### Patch changes

**[fix(explorer): validate sql queries (#3793)](https://github.com/latticexyz/mud/commit/6031ec8e7f3b47a789c4c31750f9cfe8c2ccfdf2)** (@latticexyz/explorer)

SQL queries in the tables viewer are now validated before execution, with errors highlighted and described directly in the editor.

**[fix(explorer): preserve sql query formatting (#3810)](https://github.com/latticexyz/mud/commit/1f509ee224cadd4254e7bbb7a268b519f65e4495)** (@latticexyz/explorer)

Formatting is now preserved when re-running SQL queries.

**[fix(explorer): disable caching for API routes (#3807)](https://github.com/latticexyz/mud/commit/bd97268cd2037f6372211e05367605636b1ee78e)** (@latticexyz/explorer)

Caching is now disabled for API routes.

**[feat(cli): save deployed contracts info (#3816)](https://github.com/latticexyz/mud/commit/0e49b51ba934438e49c7f098e78d6e3ddf7567fb)** (@latticexyz/cli, @latticexyz/common)

The `mud deploy` command now includes the addresses of all deployed contracts and libraries in the deployment file. Previously, it only included the world address.

The `mud test` command now includes an optional 'saveDeployment' flag to enable the deployment info from the test run to be saved to a file.

---

## Version 2.2.23

Release date: Mon Aug 25 2025

### Patch changes

**[feat(explorer): show explored world title (#3751)](https://github.com/latticexyz/mud/commit/9c9d8eab9fea5aeaf8f3ed8b2f13bd35add462b9)** (@latticexyz/explorer)

Address and name of verified worlds are now shown in the navigation tab.

**[feat(stash): add experimental support for indices and derived tables (#3787)](https://github.com/latticexyz/mud/commit/b84bcc6141e8fecb564eaecfc6e60c764d91bf39)** (@latticexyz/stash)

Added experimental support for indices and derived tables to Stash.

Derived tables are synchronously updated based on changes to source tables, enabling computed or reorganized views of existing data.

Indices are a special case of derived tables that mirror another table with a different key.
They provide a more ergonomic API for this common pattern and are automatically considered in the `Matches` query fragment to optimize lookups on large tables.

Example:

```ts
const stash = createStash();
const inputTable = defineTable({
  label: "input",
  schema: { field1: "uint32", field2: "address", field3: "string" },
  key: ["field1"],
});
registerTable({ stash, table: inputTable });
const indexTable = registerIndex({ stash, table: inputTable, key: ["field2", "field3"] });
```

**[feat(entrykit): non-blocking fee estimation (#3784)](https://github.com/latticexyz/mud/commit/7cd553a4588f2ddaeb4047393381cdd6ac91430f)** (@latticexyz/entrykit)

Fees for Redstone, Pyrope and Garnet are now cached for 10 seconds instead of fetched before every user operation.

**[fix(store-sync): block stream retry backoff (#3805)](https://github.com/latticexyz/mud/commit/84b8926b9c97fd6d0807aa5b84326fe9a698f264)** (@latticexyz/store-sync)

Fixed an issue where losing connection would get stuck in a retry loop.

**[feat(store-sync): include registered system functions in ABI (#3776)](https://github.com/latticexyz/mud/commit/a7ce36bd855c91c1a0e7a515c6ed7422ef59973d)** (@latticexyz/store-sync)

`getSystemAbis` will now include the ABIs of registered functions.

**[chore(explorer): input parameter names (#3785)](https://github.com/latticexyz/mud/commit/ba07cf09273fba0a246eaf341cdb4eec5328f120)** (@latticexyz/explorer)

Input parameter names are now displayed alongside method names in the "Interact" page.

**[fix(worldgen): correctly resolve remappings when going through the inheritance chain (#3791)](https://github.com/latticexyz/mud/commit/94cac741be24bb5743f2f36235cc3bb40012417a)** (@latticexyz/common, @latticexyz/world)

Correctly resolve remappings when going through the inheritance chain during worldgen.

**[feat(entrykit): id.place (#3781)](https://github.com/latticexyz/mud/commit/63fb9640350ff7d87d226fa827ad53e1e79f77e9)** (@latticexyz/entrykit)

Added experimental support for [id.place](https://id.place/) passkey-based wallets.

**[feat(explorer): abi search and filter (#3773)](https://github.com/latticexyz/mud/commit/e1c2958b99c9fe4c7189ab24938e0978ff85a75f)** (@latticexyz/explorer)

ABI in the "Decode" page can now be searched and filtered.

**[fix(world): support expectRevert and unusual nameless arguments in system libraries (#3680)](https://github.com/latticexyz/mud/commit/a8c404b4b10462f5f390a82f9e40ceb80bc5eb23)** (@latticexyz/store, @latticexyz/world-module-metadata, @latticexyz/world)

Support expectRevert and unusual nameless arguments in system libraries.

**[fix(explorer): read system functions (#3783)](https://github.com/latticexyz/mud/commit/c4447b1f597a2abb03b6fdb52e79d3fbdd05a948)** (@latticexyz/explorer)

Fixed calls to system view functions.

**[fix(store-sync): update watchLogs websocket api (#3788)](https://github.com/latticexyz/mud/commit/e76d72504e7ee51c76fa380bdc4a56f4815b7b59)** (@latticexyz/store-sync)

Updated usage of `ws.on` to `ws.addEventListener` for browser compatibility.

**[fix(explorer): handle invalid system abis (#3786)](https://github.com/latticexyz/mud/commit/e9e21c9f1f7d164af1b19f327d798ed2f2d0fd95)** (@latticexyz/store-sync)

Invalid registered system ABIs are now handled by displaying an empty ABI.

**[feat(entrykit): id.place (#3781)](https://github.com/latticexyz/mud/commit/63fb9640350ff7d87d226fa827ad53e1e79f77e9)** (@latticexyz/id.place)

Initial release of experimental passkey-based wallet provider.

**[chore: bump viem, wagmi, abitype (#3804)](https://github.com/latticexyz/mud/commit/cd0fa57c590233c5f099d6e469c46c6b51e2c46d)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/config, @latticexyz/dev-tools, @latticexyz/entrykit, @latticexyz/explorer, @latticexyz/faucet, @latticexyz/id.place, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/stash, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world, create-mud)

Bumped to viem v2.35.1, wagmi v2.16.5, abitype v1.0.9.

**[chore: bump forge-std (#3344)](https://github.com/latticexyz/mud/commit/b803eb1d495ce20f644a81c61473d0c33f9ecf54)** (@latticexyz/cli, @latticexyz/gas-report, @latticexyz/schema-type, @latticexyz/store, @latticexyz/world-module-callwithsignature, @latticexyz/world-module-erc20, @latticexyz/world-module-metadata, @latticexyz/world-modules, @latticexyz/world, create-mud)

Bumped forge-std version and removed ds-test dependency (not needed in current forge-std versions)

**[feat(worldgen): support inherited symbols in worldgen (#3790)](https://github.com/latticexyz/mud/commit/122945eb02d5d8b6475aec2e88f72340ea81f2d6)** (@latticexyz/common, @latticexyz/world)

Support using inherited symbols when generating System interfaces and libraries.

**[fix(explorer): encode big integer arguments (#3777)](https://github.com/latticexyz/mud/commit/c9a7e15b89f6e4486abcb46c3a75c213741816a4)** (@latticexyz/explorer)

Big integer values are now encoded correctly when calling functions from "Interact" page.

---

## Version 2.2.22

Release date: Thu Jun 26 2025

### Patch changes

**[chore(explorer): remove rhodolite support (#3704)](https://github.com/latticexyz/mud/commit/bd9e19b10418c4a0b8b3791e713d798b8df64a38)** (@latticexyz/explorer)

Removed Rhodolite chain support.

**[feat(store-sync): add support for upper bound in fetchRecords (#3744)](https://github.com/latticexyz/mud/commit/cd146eb4419e8477a8f43acd2e6dbc2f9f6b2b20)** (@latticexyz/store-sync)

The `fetchRecords` util now supports specifying an upper bound for the block height of SQL queries.

**[feat(explorer): resolve ENS (#3731)](https://github.com/latticexyz/mud/commit/7f1b769020c12f25d756b5c3c749c26303a22534)** (@latticexyz/explorer)

Address input fields in the "Interact" tab now accept ENS names, which are automatically resolved to their underlying address.

**[fix(explorer): editable cells keep focus (#3664)](https://github.com/latticexyz/mud/commit/fdb727e847024560315c10ebf32c1f924755ffe9)** (@latticexyz/explorer)

Editable table cells no longer lose focus during editing when the query is set to "live".

**[fix(store-sync): backoff on failed connection, close websockets (#3752)](https://github.com/latticexyz/mud/commit/291a54a26791869f0c15c67f4e5adc4890f5e893)** (@latticexyz/store-sync)

The preconfirmed logs stream now waits before reconnecting if a previous connection attempt failed.

**[feat(world,entrykit): add `sendUserOperationFrom` (#3675)](https://github.com/latticexyz/mud/commit/60085734145ea8db0b43084034bec9f8ea474dc4)** (@latticexyz/world)

Added a `sendUserOperationFrom` Viem action decorator to automatically route user operation calls through `callFrom`.

**[feat(explorer): decode function calls (#3710)](https://github.com/latticexyz/mud/commit/091ece6264dd4cdbdc21ea3d22347a6f1043a6a3)** (@latticexyz/explorer)

The Worlds Explorer explorer now supports decoding function data.

**[fix(explorer): array args encoding (#3748)](https://github.com/latticexyz/mud/commit/0fc224f81dabb2b29ae3056e7b71aa9b489b3626)** (@latticexyz/explorer)

Array function arguments are now correctly encoded on the "Interact" page.

**[fix(entrykit): refetch prerequisites after balance top-up (#3694)](https://github.com/latticexyz/mud/commit/d6161103025288c00f13b5adb523af5634b537a8)** (@latticexyz/entrykit)

Onboarding prerequisites are now re-fetched when the quarry gas balance is updated.

**[fix(store-sync): ignore store logs with invalid keys (#3720)](https://github.com/latticexyz/mud/commit/3baa3fd86f5917471729ba6551f12c17cdca53e3)** (@latticexyz/store-sync)

The sync stack now skips store logs with invalid key tuples instead of throwing errors.

MUD doesn’t validate schemas for onchain writes or deletions, it's the developer's responsibility to use correct encoding.
Using the wrong key schema onchain is effectively a no-op, since the data ends up in a storage slot that won’t be read when using the correct schema.
The expectation is that the sync stack ignores these no-op logs, but it was previously throwing during decode.

**[fix(explorer): display remotely updated table values (#3737)](https://github.com/latticexyz/mud/commit/a5fdfa8a665caabc57fedd4bf34a8199c6c1ad10)** (@latticexyz/explorer)

Table values updated remotely are now also reflected in the table viewer.

**[chore(explorer): append base world ABI to API endpoint (#3653)](https://github.com/latticexyz/mud/commit/7fd242ecf040c1c9955cdd2c971d0ed5570fa14b)** (@latticexyz/explorer)

World ABI endpoint is now includes the base world ABI.

**[feat(entrykit): loosen min gas balance (#3689)](https://github.com/latticexyz/mud/commit/b94aca694dd82b32bf78de9e6408f61b32e5b8e2)** (@latticexyz/entrykit)

Loosened minimum gas balance requirement in onboarding to allow for any gas balance above zero.

**[fix(explorer): fetch from sqlite indexer in production (#3679)](https://github.com/latticexyz/mud/commit/f0c0b982573f9953e1c726c0bef91671efaaa545)** (@latticexyz/explorer)

Fixed fetching data from `@latticexyz/store-indexer` `/q` API endpoint in production builds.

**[feat(explorer): url params for interact and decode forms (#3713)](https://github.com/latticexyz/mud/commit/d2c77c206d94a00082a25939b786df04d8249fcb)** (@latticexyz/explorer)

Interact and Decode forms now support URL parameters.

**[refactor(store-sync): migrate to isomorphic-ws (#3762)](https://github.com/latticexyz/mud/commit/91837e36ade680787d224691c848540fea793a5a)** (@latticexyz/store-sync)

The preconfirmed logs stream is now using `isomorphic-ws` for more control over error handling and reconnection logic.

**[fix(common): improve codegen error visibility (#3662)](https://github.com/latticexyz/mud/commit/88ddd0c3a68c52469abbc59c2f9db3bbee2eafb6)** (@latticexyz/common)

Improved surfacing of errors during code generation.

**[feat(explorer): collapsible sections for functions (#3727)](https://github.com/latticexyz/mud/commit/ea62e9b2384e58dac465f984c78f35117f36600d)** (@latticexyz/explorer)

Interact page is now organized into collapsible namespace and system sections.

**[fix(explorer): wallets connect options (#3732)](https://github.com/latticexyz/mud/commit/f06e8f25dd013c43d943e71a401fa4aeefd399fa)** (@latticexyz/explorer)

Restore wallet connection options in the wallet connect modal.

**[fix(explorer): various fixes (#3712)](https://github.com/latticexyz/mud/commit/5f0b4d10731aa3b4c1f5bb872d4571e4dd3b4aa3)** (@latticexyz/explorer)

- Boolean values can now be submitted on the Interact page.
- Fixed redirects when only a single local world is deployed.
- Chain logos are now displayed correctly when running the Explorer locally.
- Fixed scrolling behavior in the table dropdown when viewing non-selected tables.
- Verified world dropdown now appears immediately after pasting a world address, without waiting for all worlds to resolve.

**[feat(world-module-metadata): remove resource existence check (#3650)](https://github.com/latticexyz/mud/commit/6344ced32a0e0903de81a689ac45b97703db136e)** (@latticexyz/world-module-metadata)

Adding/deleting resource tags no longer checks if resource exists, only if you're the resource namespace owner.

**[feat(store-sync): system/world ABI from metadata (#3642)](https://github.com/latticexyz/mud/commit/490159e880e2ac0e1ce8f5785873a25b99fb7668)** (@latticexyz/store-sync)

`getWorldAbi` now returns a full world ABI (errors, parameter names, mutability, etc.) registered by the deployer using the metadata module.

Also added internal functions `getSystemAbi` and `getSystemAbis` to retrieve system-specific ABIs.

**[feat(entrykit): move to connectkit (#3721)](https://github.com/latticexyz/mud/commit/725f1aed27b397ad153bec254b2530eb20d2d743)** (@latticexyz/entrykit)

Migrated EntryKit's underlying wallet connection handling from RainbowKit to ConnectKit.

**[feat(store-indexer): format sql queries (#3687)](https://github.com/latticexyz/mud/commit/582f7187cf3cb1e0013aa5d192560235114d71e0)** (@latticexyz/store-indexer)

The local SQLite indexer now automatically converts camelCase column names to snake_case to comply with the SQL API.

**[fix(store-sync): handle pending deleted dynamic value in stash storage adapter (#3714)](https://github.com/latticexyz/mud/commit/1e9047e3056120ed1ab34976aec3df15df13b0e3)** (@latticexyz/store-sync)

Fixed a bug that caused the stash storage adapter to crash when deleting a dynamic field and writing to it again in the same block.

**[fix(store-sync): handle pending deletion in stash storage adapter (#3672)](https://github.com/latticexyz/mud/commit/7902888215e548882b314342e21caed5088b869c)** (@latticexyz/store-sync)

Pending deletions immediately followed by field updates are now handled correctly by the Stash storage adapter.

**[feat(explorer): read-only mode (#3701)](https://github.com/latticexyz/mud/commit/7c2fe37ce180c3d55160202867bd3835683f532b)** (@latticexyz/explorer)

Added read-only mode with no wallet connection that only shows non-editable sections of the Explorer.

**[chore(explorer): remove indexer endpoint (#3678)](https://github.com/latticexyz/mud/commit/fc10a277e139c26aea88326f188b45b18367d4a5)** (@latticexyz/explorer)

Removed the Explorer’s SQLite indexer API endpoint in favor of the equivalent `/q` endpoint from `@latticexyz/store-indexer`.

**[fix(world): `batchCall` in `sendUserOperationFrom` (#3693)](https://github.com/latticexyz/mud/commit/6a26a049c793442fcefed7a3268d2de7849cd2ae)** (@latticexyz/world)

Fixed a bug related to `batchCall` in `sendUserOperationFrom`.

**[feat(explorer): use systems abis in decode form (#3646)](https://github.com/latticexyz/mud/commit/13071c45dd7d28c1860e703d12b07624c271f508)** (@latticexyz/explorer)

- Added the `/system-abis` endpoint to retrieve ABIs by system IDs.
- The search form for decoding selectors now uses all system ABIs for complete results.
- The `ABI` page has been renamed to `Decode`.

**[fix(explorer): re-render externally updated table (#3692)](https://github.com/latticexyz/mud/commit/f7aa4c5722bf24103f4cd4ab01b5d9c55f9b2995)** (@latticexyz/explorer)

Table row data now correctly re-renders when updated outside the Explorer.

**[feat(world,entrykit): add `sendUserOperationFrom` (#3675)](https://github.com/latticexyz/mud/commit/60085734145ea8db0b43084034bec9f8ea474dc4)** (@latticexyz/entrykit)

EntryKit's `SessionClient` now automatically routes `sendUserOperation` through `callFrom` like it does with `writeContract` calls.

**[chore(entrykit): various improvements (#3699)](https://github.com/latticexyz/mud/commit/9f06079cb52cb39888097ea3a293ec71bd46ebbc)** (@latticexyz/entrykit)

- EntryKit now returns to the login flow modal after a successful top-up.
- The default chain is now selected as the source chain if the connected chain is not part of selectable chains.
- The "Switch chain" button now uses the primary color, making it appear clickable.
- The successful deposit status message has been updated.

**[fix(world): fix static array arguments in system libraries (#3661)](https://github.com/latticexyz/mud/commit/f6d87edb8513fd0f255ac4389a2e613a508ffab4)** (@latticexyz/world)

Fix static array arguments in system libraries.

**[feat(explorer): add chain switch (#3705)](https://github.com/latticexyz/mud/commit/34ec2ec478d6e3d46d82c74a6e09387d83b7776d)** (@latticexyz/explorer)

Chain switching between supported networks is now accessible on the homepage and the world page.

**[chore(explorer): coinbase wallet support (#3749)](https://github.com/latticexyz/mud/commit/120dc0daf0203ab15874f57f91343b9f31b42ea4)** (@latticexyz/explorer)

Coinbase wallet is now supported.

**[feat(entrykit): fork walletconnect connector (#3725)](https://github.com/latticexyz/mud/commit/bc95ea094386f235971f1c5b98a34f41c161999d)** (@latticexyz/entrykit)

Replaced WalletConnect connector with our own internal fork to resolve some chain switching issues (see https://github.com/wevm/wagmi/pull/4691).

**[feat(entrykit): add pyrope fee estimation (#3640)](https://github.com/latticexyz/mud/commit/050dfd5c0f540bc4145db05ca6798926fdecff4c)** (@latticexyz/entrykit)

Added explicit gas estimation for Pyrope to avoid overpaying.

**[refactor(entrykit): use skipToken instead of enabled (#3686)](https://github.com/latticexyz/mud/commit/d621dc7c427a59eb74f4d379862646355a149338)** (@latticexyz/entrykit)

Updated React Query usages to use `skipToken` instead of conditional a `queryFn` to avoid warnings in newer versions of React Query.

**[feat(explorer): resolve paths using chain ID or name (#3735)](https://github.com/latticexyz/mud/commit/5fa416eb3cdce964723463b48b91c49aabdf9f0b)** (@latticexyz/explorer)

Explorer will now automatically resolve and redirect deep links using a chain ID to their corresponding chain name, e.g.

https://explorer.mud.dev/690/worlds/0x2d70F1eFFbFD865764CAF19BE2A01a72F3CE774f

**[feat(entrykit): quarry paymaster relay.link top-up (#3688)](https://github.com/latticexyz/mud/commit/5f6c71d4a2949cf6ccc576cb3932460e44efa430)** (@latticexyz/entrykit)

Added support for Quarry paymaster top-up via relay.link deposit form.

**[feat(entrykit): show only deposit chains with balance (#3730)](https://github.com/latticexyz/mud/commit/8bd459b91322f8b9955f6407b95988a7755d27e4)** (@latticexyz/entrykit)

The chain selector dropdown for bridged deposits now only displays chains with available funds.

**[feat(explorer): fetch deprecated world ABI (#3654)](https://github.com/latticexyz/mud/commit/26d2e3acd8fc0a0852f530e8e1574a68d2baa3d2)** (@latticexyz/store-sync)

`getWorldAbi()` now returns an ABI that is a combination of:

- base World ABI
- system ABIs stored onchain with metadata module during deploy
- world functions

**[feat(entrykit): enable copying session wallet address (#3698)](https://github.com/latticexyz/mud/commit/daa34f06d070200c1aaf0bba78ba9f2dd8662a76)** (@latticexyz/entrykit)

Session wallet address can now be copied from EntryKit modal.

**[fix(world): support generating libraries for systems without function registration (#3670)](https://github.com/latticexyz/mud/commit/fb2745a7b2d4735a67adffa69e70ec7d1085f4da)** (@latticexyz/world)

Support generating libraries for systems without function registration.

**[chore(explorer): optional systemIds param for system ABIs endpoint (#3651)](https://github.com/latticexyz/mud/commit/a3645c819959efe97ff2e50f6f5b88ebe77fa980)** (@latticexyz/explorer)

`systemIds` parameter is now optional for the system ABIs API endpoint.

**[fix(explorer): read env vars (#3709)](https://github.com/latticexyz/mud/commit/9c89cc327787bf68c2ddb825365ac773a4388576)** (@latticexyz/explorer)

Environment variables are now loaded from the `.env` file alongside those specified via CLI flags.

**[feat(entrykit): gas balance withdraw (#3724)](https://github.com/latticexyz/mud/commit/8c4b624756007fd02b1c3c3494e34128a5f1c044)** (@latticexyz/entrykit)

You can now withdraw your gas balance from the Quarry paymaster.

**[feat(entrykit): separate loading state from invalid state (#3767)](https://github.com/latticexyz/mud/commit/2fe59091a36e3ace2e5ec143138e801fadcdc707)** (@latticexyz/entrykit)

`useSessionClient` will now return an error state when no user is connected. This separates the session client's pending state (querying data to determine if prerequisites are met) from invalid state (EntryKit misconfigured, user not connected, or prerequisites not met), allowing apps to provide better loading indicators within connect buttons.

The built-in `AccountButton` already uses this new behavior to show a pending icon while querying for the session client's prerequisites.

**[feat(store-sync): add flag to define chunking behavior during initial hydration (#3745)](https://github.com/latticexyz/mud/commit/6508c1df5ea605f58112f192114a2f837f362ecc)** (@latticexyz/store-sync)

The sync stack now supports defining the chunking behavior during initial hydration. Chunking remains enabled by default.

Chunking is useful to avoid blocking the main thread for too long, but it can lead to updates that happened in the same block being split across multiple chunks.
If chunking is enabled, clients should account for this by waiting for full hydration before using the update stream.
If atomicity of updates is important and blocking the main thread is not an issue, set this to `false`.

**[feat(explorer): interact system calls (#3718)](https://github.com/latticexyz/mud/commit/66b053c8bc9cfa25c1b60d00dd208a5b2cd9d9f7)** (@latticexyz/explorer)

The Interact tab now supports system functions. The functions can be searched by namespace, system name, or function name.

**[feat(store-sync): make pending logs sync more resilient (#3743)](https://github.com/latticexyz/mud/commit/23b0c9a68bb6c6a98011d43ddccf62994adb66ba)** (@latticexyz/store-sync)

The sync stack now handles downtime in the pending logs API and reconnects once it's available again.

**[fix(entrykit): make required gas balance non-zero (#3691)](https://github.com/latticexyz/mud/commit/fbf1be12730c08acd460aa36124a0565f4e73401)** (@latticexyz/entrykit)

Increased required balance/allowance to greater than zero.

**[fix(store-sync): setup message listener before setting up subscription (#3765)](https://github.com/latticexyz/mud/commit/a3918e051d892b946148bb88b25de1f64bdd302e)** (@latticexyz/store-sync)

Fixed a race condition in the preconfirmed logs stream by setting up the message listener before setting up the subscription.

**[feat(world-module-metadata): add metadata system lib (#3645)](https://github.com/latticexyz/mud/commit/2048adf7aa386ef1fe1e9863dd87cebdef439f1b)** (@latticexyz/world-module-metadata)

Added experimental system library for metadata system. Note that this is marked experimental as we may make breaking changes to the interface.

```solidity
import { metadataSystem } from "@latticexyz/world-metadata-module/src/codegen/experimental/systems/MetadataSystemLib.sol";

metadataSystem.setResourceTag(namespaceId, bytes32("label"), "hello");
```

**[feat(world): find systems based on inheritance (#3649)](https://github.com/latticexyz/mud/commit/03af917786370b8251542adb3d53099aa85e754f)** (@latticexyz/world, @latticexyz/cli)

`mud` CLI commands will now recognize systems if they inherit directly from the base `System` imported from `@latticexyz/world/src/System.sol`, allowing you to write systems without a `System` suffix.

```solidity
import {System} from "@latticexyz/world/src/System.sol";

contract EntityProgram is System {
  ...
}
```

If you have contracts that inherit from the base `System` that aren't meant to be deployed, you can mark them as `abstract contract` or [disable the system's deploy via config](https://mud.dev/config/reference).

**[chore: increase react peer dep range (#3728)](https://github.com/latticexyz/mud/commit/405a600d8d3aaf06cd06b64287a8acff9e2e0e35)** (@latticexyz/stash, @latticexyz/store-sync)

Added React 19.x to the peer dependency range.

**[feat(store-sync): stream json from indexer snapshot (#3761)](https://github.com/latticexyz/mud/commit/db94eb24a728db6eae9842199de07c6b85983abb)** (@latticexyz/store-sync)

Fetching a snapshot from the indexer will now parse JSON as a stream, avoiding issues with large snapshots where the string is too long to parse in one go.

**[fix: assert -> with (#3739)](https://github.com/latticexyz/mud/commit/8fad4be6941d39fe86b3f0100a04642670ff266a)** (@latticexyz/cli, @latticexyz/entrykit, @latticexyz/store-sync)

Updated JSON imports to use `with` annotation instead of `assert`.

**[fix(stash): maintain update atomicity in `subscribeQuery` (#3663)](https://github.com/latticexyz/mud/commit/b8239d8a667d5119569395f4b182f8ea3dc9b97e)** (@latticexyz/stash)

Stash now preserves batch updates when subscribing to query results.
Previously, while Stash supported batching table updates for atomic onchain changes, subscribing to query results would split these updates by table.

**[feat(explorer): textarea string fields (#3746)](https://github.com/latticexyz/mud/commit/7367a813d9b394415ba70678c4295cc90562c304)** (@latticexyz/explorer)

String fields in the "Interact" tab now support multiline values.

**[feat(entrykit): add wiresaw transport (#3703)](https://github.com/latticexyz/mud/commit/0f5c75bd8fc963e3697ff1720ec3608d119d4b5e)** (@latticexyz/entrykit)

Added experimental support for fast user operations on Wiresaw-enabled chains.

**[fix(cli): don't deploy abstract contracts (#3669)](https://github.com/latticexyz/mud/commit/ab837ceb49fa77cc29487bb9df0c487975b37afe)** (@latticexyz/cli, @latticexyz/common)

CLI will no longer deploy abstract systems and contracts without bytecode.

**[fix(world): support functions with missing argument names in system libraries (#3671)](https://github.com/latticexyz/mud/commit/d83a0fd5283b7bea7e9a5372ea3c45ab9aea350f)** (@latticexyz/world)

Adds support for functions with missing argument names in system libraries.

**[fix(entrykit): sign session wallet after top-up (#3697)](https://github.com/latticexyz/mud/commit/9dc032a7075a33fca3936f049aae8de923e9a723)** (@latticexyz/entrykit)

The login flow now only attempts to register the session account after it has been successfully funded.

**[fix(explorer): update only changed table values (#3733)](https://github.com/latticexyz/mud/commit/3ffa12704d00fca354851d8e2ed12f0dc1fc639f)** (@latticexyz/explorer)

Table cell edits are now saved only when the value has changed.

**[feat(explorer): verified worlds (#3707)](https://github.com/latticexyz/mud/commit/d8eef923b761a5efe83ddf9f5b0a1460b5ca4db9)** (@latticexyz/explorer)

Verified worlds are now shown in the world selection form.

**[feat(common): add paymaster for testnet chains, remove rhodolite (#3770)](https://github.com/latticexyz/mud/commit/689708688d9215c3441ffeac029236023d05c25f)** (@latticexyz/common)

Added [Quarry paymaster](https://github.com/latticexyz/quarry-paymaster) address for Garnet and Pyrope chain configs. And removed defunct Rhodolite chain config.

**[feat(entrykit): move to connectkit (#3721)](https://github.com/latticexyz/mud/commit/725f1aed27b397ad153bec254b2530eb20d2d743)** (create-mud)

Bumped Viem and Wagmi versions in templates.

**[feat(entrykit): move to connectkit (#3721)](https://github.com/latticexyz/mud/commit/725f1aed27b397ad153bec254b2530eb20d2d743)** (@latticexyz/entrykit)

Until we can add ERC-6492 support to our `CallWithSignature` module, EntryKit will now throw a readable error when signing a message using ERC-6492 instead of failing the transaction.

**[feat(store-indexer): add experimental/local SQL API endpoint (#3676)](https://github.com/latticexyz/mud/commit/6bb6a79dff407a5adf951343d9c37315816bac4b)** (@latticexyz/store-indexer)

Added experimental SQL API endpoint `/q` to the SQLite indexer. This is only intended for local development purposes and should not be used in production.

---

## Version 2.2.21

Release date: Fri Mar 21 2025

### Patch changes

**[feat(explorer): add pyrope testnet support (#3619)](https://github.com/latticexyz/mud/commit/1d354b89f3aeb28e9dc085bdde27647a7ba6d8ae)** (@latticexyz/common, @latticexyz/explorer)

Added Pyrope testnet chain.

**[fix(cli): remove payable modifier from library functions (#3629)](https://github.com/latticexyz/mud/commit/8cdc57b90fe3d3f21abe4a3362c8a7ac9ba2e9d4)** (@latticexyz/world)

System libraries are no longer generated with `payable` keyword.

**[fix: remove wiresaw from pyrope chain definition (#3634)](https://github.com/latticexyz/mud/commit/b18c0ef0edeab2378b08d9f4a328a5d0d817f6bf)** (@latticexyz/common)

Removed the `wiresaw` RPC URL from the Pyrope chain config, since Wiresaw is not deployed to Pyrope yet.

**[feat(entrykit): expose world address on session client (#3607)](https://github.com/latticexyz/mud/commit/f1e008f2d2a7ba2369a07f9807a7ee0cd1b3b20c)** (@latticexyz/entrykit)

The session client's world address (used for delegations and `callFrom`) is now available via `sesssionClient.worldAddress`.

The local signer is also available via `sesssionClient.internal_signer`. This is marked as internal for now as we may change how this is exposed.

Using the signer allows for [Sign-in with Ethereum](https://eips.ethereum.org/EIPS/eip-4361) and similar flows that avoid prompting the wallet for a signature, but can be validated via the associated delegation from user account to session account in the world.

**[chore(explorer): hide deleted records on local explorer (#3631)](https://github.com/latticexyz/mud/commit/af2865b3164b348b03dd4354e1737d3a37160689)** (@latticexyz/explorer)

Deleted records no longer appear in the table data viewer when using the SQLite indexer.

**[chore(entrykit): update error message in userOpExecutor (#3609)](https://github.com/latticexyz/mud/commit/f4db683f90214b03bb8d68635a3825cc9bf58263)** (@latticexyz/entrykit)

Updated error message for unsupported methods in `userOpExecutor`.

**[feat(entrykit): add react 19 and missing peer dep (#3605)](https://github.com/latticexyz/mud/commit/5a67f40bed3b05afd388f96a7b1bfee8b52c29ef)** (@latticexyz/entrykit)

Added React 19 to peer dependency range.

**[fix(entrykit): improve escape handling (#3623)](https://github.com/latticexyz/mud/commit/98fc29ddfa9b5db0492165acd2c49a9862569878)** (@latticexyz/entrykit)

Improved escape key handling when account modal is open. And fixed development warnings about missing dialog title/description.

**[feat(explorer): tables viewer pagination (#3426)](https://github.com/latticexyz/mud/commit/581228bd857077023efdb496a9a44fa62ff89936)** (@latticexyz/explorer)

The Explore tab's table viewer now supports pagination through limit/offset clauses in SQL queries.

**[refactor(world-consumer): remove namespace (#3597)](https://github.com/latticexyz/mud/commit/041031d271b62a7f41f7c6dc0098c1c0ae222bd5)** (@latticexyz/world-consumer, @latticexyz/world-module-erc20)

`WorldConsumer` now doesn't store a single namespace. Instead, child contracts can keep track of namespaces and use the `onlyNamespace(namespace)` and `onlyNamespaceOwner(namespace)` modifiers for access control.

ERC20 module was adapted to use this new version of `WorldConsumer`.

**[chore(store-indexer): bump koa (#3599)](https://github.com/latticexyz/mud/commit/8b83c6b7481219898ab0f8e9c1afd88591646396)** (@latticexyz/store-indexer)

Bumped Koa dependency for vulnerability fix.

**[feat(explorer): abi explorer (#3635)](https://github.com/latticexyz/mud/commit/aeb210f4c7f3e44c63655541e7aab8e83c52d6d6)** (@latticexyz/explorer)

Added an ABI page for exploring world ABI. The ABI Explorer also includes a form for searching custom errors or functions based on their selectors.

**[feat(entrykit): update relay chains (#3620)](https://github.com/latticexyz/mud/commit/55dae5f5bb7b814e6f488432deb15a9a15b49b06)** (@latticexyz/entrykit)

Updated chains supported by Relay.link.

**[feat(entrykit): validate signature (#3632)](https://github.com/latticexyz/mud/commit/454387765857a956f3872887619d25f0352abf1c)** (@latticexyz/entrykit)

Exported an internal method to validate signatures for login flows that use session signer on behalf of user accounts.

**[fix(explorer): enable table data refetch for local explorer (#3627)](https://github.com/latticexyz/mud/commit/303714d89811a01be2802c32f4f6876fa81e5df9)** (@latticexyz/explorer)

Table data refetching is now enabled for locally run Explorer instances.

---

## Version 2.2.20

Release date: Tue Feb 11 2025

### Patch changes

**[feat(explorer): wrap table names in double quotes by default (#3588)](https://github.com/latticexyz/mud/commit/306707570ec5fd27877d674502aa381d7fd89662)** (@latticexyz/explorer)

Table names in SQL queries are now automatically enclosed in double quotes by default, allowing support for special characters.

**[feat(world-consumer): convert store-consumer package into world-consumer (#3584)](https://github.com/latticexyz/mud/commit/b774ab28b3de6cefcbfce5e1bb6fcb68b9374abf)** (@latticexyz/world-module-erc20)

Migrated from `store-consumer` to `world-consumer`.

**[refactor(world): add default-reverting methods to Module (#3581)](https://github.com/latticexyz/mud/commit/391575967cd09bd527d819222232a54a7d722fc2)** (@latticexyz/world-module-callwithsignature, @latticexyz/world-module-erc20, @latticexyz/world-module-metadata, @latticexyz/world-modules)

Removed unsupported install methods as these now automatically revert in the base `Module` contract.

**[feat: install module with delegation (#3586)](https://github.com/latticexyz/mud/commit/31870811b975d44f4b5d14ae69fd623914237584)** (@latticexyz/cli, @latticexyz/world)

Added `useDelegation` module config option to install modules using a temporary, unlimited delegation. This allows modules to install or upgrade systems and tables on your behalf.

**[feat(world): generate system libs (#3587)](https://github.com/latticexyz/mud/commit/06e48e0239a5c7994ce73b4d2752860743fec4b0)** (@latticexyz/world)

Added experimental system libraries for World systems for better ergonomics when interacting with core systems.

Note that these libraries are marked experimental as we may make breaking changes to their interfaces.

```solidity
import { worldRegistrationSystem } from "@latticexyz/world/src/codegen/experimental/systems/WorldRegistrationSystemLib.sol";

// equivalent to `IBaseWorld(_world()).registerNamespace("hello")` but directly routed through `world.call` for better gas.
worldRegistrationSystem.registerNamespace("hello");

// and makes delegation use cases easier
worldRegistrationSystem.callFrom(_msgSender()).registerNamespace("hello");
```

**[refactor(world): add default-reverting methods to Module (#3581)](https://github.com/latticexyz/mud/commit/391575967cd09bd527d819222232a54a7d722fc2)** (@latticexyz/world)

The base `Module` contract now includes default implementations of `install` and `installRoot` that immediately revert, avoiding the need to implement these manually in each module.

If you've written a module, you may need to update your install methods with `override` when using this new base contract.

```diff
-function install(bytes memory) public {
+function install(bytes memory) public override {
```

```diff
-function installRoot(bytes memory) public {
+function installRoot(bytes memory) public override {
```

**[fix(cli): use execa directly instead of custom foundry wrappers (#3582)](https://github.com/latticexyz/mud/commit/b7901812d4035faa3ec9bb75f31ffe7af398bdf2)** (@latticexyz/cli)

Fixed forge/anvil/cast output for all CLI commands.

**[feat: install module with delegation (#3586)](https://github.com/latticexyz/mud/commit/31870811b975d44f4b5d14ae69fd623914237584)** (@latticexyz/cli, @latticexyz/world-module-metadata)

Metadata module has been updated to install via delegation, making it easier for later module upgrades and to demonstrate modules installed via delegation.

**[feat(world): generate system libs (#3587)](https://github.com/latticexyz/mud/commit/06e48e0239a5c7994ce73b4d2752860743fec4b0)** (@latticexyz/store)

Updated `IStoreRegistration` interface to allow calling `registerTable` with `keyNames` and `fieldNames` from `memory` rather than `calldata` so this can be called with names returned by table libraries.

**[feat: install module with delegation (#3586)](https://github.com/latticexyz/mud/commit/31870811b975d44f4b5d14ae69fd623914237584)** (@latticexyz/world)

Updated `encodeSystemCalls` and `encodeSystemCallsFrom` to include the `abi` in each call so that different systems/ABIs can be called in batch. Types have been improved to properly hint/narrow the expected arguments for each call.

```diff
-encodeSystemCalls(abi, [{
+encodeSystemCalls([{
+  abi,
   systemId: '0x...',
   functionName: '...',
   args: [...],
 }]);
```

```diff
-encodeSystemCallsFrom(from, abi, [{
+encodeSystemCallsFrom(from, [{
+  abi,
   systemId: '0x...',
   functionName: '...',
   args: [...],
 }]);
```

**[feat(world-consumer): convert store-consumer package into world-consumer (#3584)](https://github.com/latticexyz/mud/commit/b774ab28b3de6cefcbfce5e1bb6fcb68b9374abf)** (@latticexyz/world-consumer)

Renamed `store-consumer` package to `world-consumer`. The `world-consumer` package now only includes a single `WorldConsumer` contract that is bound to a `World`.

---

## Version 2.2.19

Release date: Thu Feb 06 2025

### Patch changes

**[fix(entrykit): improve fee handling (#3577)](https://github.com/latticexyz/mud/commit/900ac35deebfa260bafb1697d15e95eef855cd69)** (@latticexyz/entrykit)

Improved fee handling for known chains.

---

## Version 2.2.18

Release date: Wed Feb 05 2025

### Patch changes

**[fix(explorer): enable editing internal namespace tables (#3553)](https://github.com/latticexyz/mud/commit/6bd1695fe986f90478cfb8fe7fcc00a7a7df3e04)** (@latticexyz/explorer)

Tables under internal namespace are now editable.

**[chore(explorer): handle tuples in interact form (#3464)](https://github.com/latticexyz/mud/commit/c44207f620a38653497b78db0b71f5de7bc1a940)** (@latticexyz/explorer)

In the Interact tab, functions with tuple arguments can now be submitted. Additionally, function input fields display the tuple name when available and indicate tuple argument types.

**[feat: bump to node 20 (#3456)](https://github.com/latticexyz/mud/commit/491a5acc8ab6d5e1a65a9845160860199b5173fc)** (create-mud)

Updated templates to Node v20.

**[fix(vite-plugin-mud): start block as number (#3555)](https://github.com/latticexyz/mud/commit/7106953abc5baa13ac87123cc58796f788dab05a)** (create-mud, vite-plugin-mud)

Fixed an issue with providing world deploy's start block to Vite app's env.

**[fix(explorer): use table name helper from sqlite package (#3542)](https://github.com/latticexyz/mud/commit/4565714f5e9421cc7b2de56fe51db4434c55f5d1)** (@latticexyz/explorer)

Fixed an issue with how MUD table names were translated SQLite table names when querying.

**[chore(store-indexer): start frontend with decoded backend (#3572)](https://github.com/latticexyz/mud/commit/16710f177b60880b7fa1b2d0be350297a16e2c8c)** (@latticexyz/store-indexer)

`pnpm start:postgres-decoded` now starts both the indexer backend and frontend.

**[fix(entrykit): require bundler (#3570)](https://github.com/latticexyz/mud/commit/10ce339665bbc3cc175b109a51d216ec1b1bb739)** (@latticexyz/entrykit)

Using EntryKit without a configured bundler will now throw an error.

Redstone, Garnet, Rhodolite, and Anvil chains come preconfigured. For other chains, you can a bundler RPC URL to your chain config via

```ts
import type { Chain } from "viem";

const chain = {
  ...
  rpcUrls: {
    ...
    bundler: {
      http: ["https://..."],
    },
  },
} as const satisfies Chain;
```

**[refactor(store-consumer): adapt WithWorld to be a System (#3546)](https://github.com/latticexyz/mud/commit/5d6fb1b51da1545b911c55e0cd79bc16ed2cd8f5)** (@latticexyz/store-consumer, @latticexyz/store, @latticexyz/world-module-erc20, @latticexyz/world)

Updates `WithWorld` to be a `System`, so that functions in child contracts that use the `onlyWorld` or `onlyNamespace` modifiers must be called through the world in order to safely support calls from systems.

**[refactor(world-module-erc20): change erc20 module table names to pascal case (#3544)](https://github.com/latticexyz/mud/commit/88949aaf197da3a62782ffd0c29b7dd677425fac)** (@latticexyz/world-module-erc20)

Updated table names to pascal case for consistency.

**[feat(explorer): loading indicator for refetched query (#3552)](https://github.com/latticexyz/mud/commit/860224870f7eb070cccbb33b505ee42ba6e7092c)** (@latticexyz/explorer)

Display a loading indicator on the query execution button while refetching a non-live query.

**[refactor(entrykit): improve error handling (#3574)](https://github.com/latticexyz/mud/commit/88af9325733387259f29dfdafd2fdbc23f2ab499)** (@latticexyz/entrykit)

Improved error handling.

**[fix(entrykit): session client uses smart account (#3547)](https://github.com/latticexyz/mud/commit/e1db80ad5648a9c77b757cda3930aa134e0f1c97)** (@latticexyz/entrykit)

Clarified `SessionClient` type as using a `SmartAccount` under the hood so that it can be used with smart account-related Viem actions.

**[fix(entrykit): require bundler (#3570)](https://github.com/latticexyz/mud/commit/10ce339665bbc3cc175b109a51d216ec1b1bb739)** (@latticexyz/common)

Added bundler RPC URL to Garnet chain config.

**[fix(store-sync): skip invalid utf-8 characters in strings before inserting into postgres (#3562)](https://github.com/latticexyz/mud/commit/df5d3937706cb9465b0539af8f4725be3d84f858)** (@latticexyz/store-sync)

Since Postgres doesn't support `\x00` bytes in strings, the decoded postgres indexer now removes `\x00` bytes from decoded strings.

---

## Version 2.2.17

Release date: Thu Jan 30 2025

### Patch changes

**[fix(world): namespaceLabel should be compared to namespaceLabel not namespace (#3515)](https://github.com/latticexyz/mud/commit/94d82cfafbdbee448884643681b0b8db53eedfda)** (@latticexyz/world)

Fixed an issue in system resolving helper used by CLI was not correctly comparing `namespaceLabel`s.

**[feat(create-mud): new react template with stash/entrykit (#3478)](https://github.com/latticexyz/mud/commit/d5f4e1e44bbc260ff21dacdfab0e0f8389e9f304)** (@latticexyz/entrykit)

Bumped react-error-boundary dependency.

**[feat(store-indexer): add flag to validate block ranges (#3531)](https://github.com/latticexyz/mud/commit/40aaf970a122151852d3d3f02383f44bffed85b9)** (@latticexyz/store-indexer)

Added an experimental option to help sync from load balanced RPCs, where nodes may be slightly out of sync, causing data inconsistencies while fetching logs.

To enable this, use `INTERNAL__VALIDATE_BLOCK_RANGE=true` environment variable when starting up any of the indexers. This requires `RPC_HTTP_URL` to also be set.

Note that using this option makes an additional call to `eth_getBlockByNumber` for each `eth_getLogs` call and expects the RPC to support batched calls.

**[feat(explorer): save searched namespace (#3470)](https://github.com/latticexyz/mud/commit/dab0d08d3c8f18adcab7bcd4a6a7eafc941ac4e6)** (@latticexyz/explorer)

The context for the searched namespace and selected table is now preserved when reopening the table search and selection menu.

**[fix(store-sync): handle user ops in waitForTransaction (#3518)](https://github.com/latticexyz/mud/commit/5a9e238e660bfa670cef673b2e34bbde7f860720)** (@latticexyz/store-sync)

Updated `waitForTransaction` to handle receipt status for user operations.

**[fix(cli): support verifying systems with linked libraries (#3514)](https://github.com/latticexyz/mud/commit/452d3e53db2768f2e296ea7560c9bdd6560cd797)** (@latticexyz/cli)

The `verify` command should now be able to correctly verify systems using public libraries.

**[feat(create-mud): new react template with stash/entrykit (#3478)](https://github.com/latticexyz/mud/commit/d5f4e1e44bbc260ff21dacdfab0e0f8389e9f304)** (create-mud)

Updated React template with Stash client state library, EntryKit for wallet support, and a cleaned up app structure.

**[feat(store-indexer): add flag to validate block ranges (#3531)](https://github.com/latticexyz/mud/commit/40aaf970a122151852d3d3f02383f44bffed85b9)** (@latticexyz/block-logs-stream, @latticexyz/store-sync)

Added an experimental option to help sync from load balanced RPCs, where nodes may be slightly out of sync, causing data inconsistencies while fetching logs.

To enable this, replace `publicClient: Client` with `internal_clientOptions: { chain: Chain, validateBlockRange: true }` when calling any sync method (e.g. `syncToStash`). For `<SyncProvider>`, only a `internal_validateBlockRange` prop is needed.

```diff
-syncToStash({ publicClient, ... });
+syncToStash({ internal_clientOptions: { chain, validateBlockRange: true }, ... });
```

```diff
-<SyncProvider adapter={createSyncAdapter(...)}>
+<SyncProvider adapter={createSyncAdapter(...)} internal_validateBlockRange>
```

Note that using this option makes an additional call to `eth_getBlockByNumber` for each `eth_getLogs` call and expects the RPC to support batched calls.

**[docs: changeset for #3538 (#3539)](https://github.com/latticexyz/mud/commit/589fd3ae0e2dde80d259e64ac0d4f7f17a43afdc)** (@latticexyz/common)

Improved approach for checking for nonce errors.

**[feat(create-mud): new react-ecs template (#3485)](https://github.com/latticexyz/mud/commit/09846f2926132e17477b4d0d1e64b795fbd4485f)** (create-mud)

Updated React ECS template with EntryKit for wallet support and a cleaned up app structure.

**[feat(create-mud): rip out create-create-app (#3479)](https://github.com/latticexyz/mud/commit/e45e3751c0ea10c7b1f0088d674121419b0d0acb)** (create-mud)

Replaced internal usage of `create-create-app` with a simpler recursive copy operation.

**[feat(world): strip world prefix from function names when encoding system calls (#3527)](https://github.com/latticexyz/mud/commit/7c3df691b30f031202ab184345cbb76bb113c2cd)** (@latticexyz/world)

Using `encodeSystemCall` (and others) with a world ABI and namespace-prefixed function name will now attempt to strip the prefix when encoding it as a system call.

It's recommended to use a system ABI with these functions rather than a world ABI.

```ts
import systemAbi from "contracts/out/ISomeSystem.sol/ISomeSystem.sol.abi.json";
encodeSystemCall({ abi: systemAbi, ... });
```

**[feat(entrykit): deploy prereqs to any chain (#3529)](https://github.com/latticexyz/mud/commit/73859484bb53c1a4066de028a3ad7d3a4284e4da)** (@latticexyz/entrykit)

Renamed `deploy-local-prereqs` bin to `entrykit-deploy`, which now accepts an RPC URL so that you can deploy the EntryKit prerequisites to your chain of choice.

```
RPC_URL=http://rpc.garnetchain.com pnpm entrykit-deploy
```

This bin supports specifying the RPC URL via `RPC_URL`, `RPC_HTTP_URL`, `FOUNDRY_ETH_RPC_URL` environment variables or `FOUNDRY_PROFILE` if using `eth_rpc_url` in `foundry.toml`.

**[feat(store-indexer): add flag to validate block ranges (#3531)](https://github.com/latticexyz/mud/commit/40aaf970a122151852d3d3f02383f44bffed85b9)** (@latticexyz/block-logs-stream)

Added an experimental option to help sync from load balanced RPCs, where nodes may be slightly out of sync, causing data inconsistencies while fetching logs.

To enable this, replace `publicClient: Client` with `internal_clientOptions: { chain: Chain, validateBlockRange: true }` when calling `fetchLogs` or `fetchBlockLogs`.

```diff
-fetchLogs({ publicClient, ... });
+fetchLogs({ internal_clientOptions: { chain, validateBlockRange: true }, ... });
```

Note that using this option makes an additional call to `eth_getBlockByNumber` for each `eth_getLogs` call and expects the RPC to support batched calls.

**[feat(store-sync): recs sync adapter (#3486)](https://github.com/latticexyz/mud/commit/227db4d37db5dd26607f77e805d91701ba2e38db)** (@latticexyz/store-sync)

Added an RECS sync adapter to be used with `SyncProvider` in React apps.

```tsx
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { SyncProvider } from "@latticexyz/store-sync/react";
import { createSyncAdapter } from "@latticexyz/store-sync/recs";
import { createWorld } from "@latticexyz/recs";
import config from "./mud.config";

const world = createWorld();
const { syncAdapter, components } = createSyncAdapter({ world, config });

export function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SyncProvider chainId={chainId} address={worldAddress} startBlock={startBlock} adapter={syncAdapter}>
          {children}
        </SyncProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

**[fix(explorer): create a separate flag and port for the indexer created by the explorer (#3511)](https://github.com/latticexyz/mud/commit/3d5b7b75c5c68f4c7499ecd2fcf6e3b2b40c6ad5)** (@latticexyz/explorer)

Add a separate flag and port for the indexer created by the Explorer.

**[feat(entrykit): deploy prereqs to any chain (#3529)](https://github.com/latticexyz/mud/commit/73859484bb53c1a4066de028a3ad7d3a4284e4da)** (@latticexyz/cli)

Added an empty line to the end of `.json` output files for consistency.
Removed some unnecessary defaults to allow them to pass through via environment variables.

**[feat(explorer): enable re-executing query (#3471)](https://github.com/latticexyz/mud/commit/32649080323d2a27cdf4a189917a70b958d062da)** (@latticexyz/explorer)

Previously, queries could only be executed if they had changed, as data fetching was tied to query updates. Now, it’s possible to trigger a new table data fetch explicitly, regardless of whether the query has changed.

**[fix(protocol-parser): add padding for encodedLengths (#3507)](https://github.com/latticexyz/mud/commit/dead80e682bfa1bd23f4d3b9bac338aee38c281e)** (@latticexyz/protocol-parser)

Added padding to make sure the `encodedLengths` field of a Store log is always 32 bytes.

**[feat(world): support batchCall in callFrom action (#2796)](https://github.com/latticexyz/mud/commit/56e65f64186741cf38a7dc0bf62e2d22bbe8fed2)** (@latticexyz/world)

Updated `callFrom` action to automatically translate `batchCall` to `batchCallFrom`.
Also fixed `encodeSystemCallFrom` and `encodeSystemCallsFrom` to return the right format for use with `batchCall` and `batchCallFrom` respectively.

**[fix(cli): use system label when verifying (#3503)](https://github.com/latticexyz/mud/commit/5aa8a3ad00aa591f9c3a60526b045257dc8a0bb5)** (@latticexyz/cli)

Fixed an issue with `mud verify` where system contract artifacts were being resolved incorrectly.

**[feat: move CallWithSignature module to its own package (#3491)](https://github.com/latticexyz/mud/commit/ffefc8f000769d5ca625dd19290007a853a21788)** (@latticexyz/cli, @latticexyz/entrykit, @latticexyz/world-module-callwithsignature, @latticexyz/world-modules)

`CallWithSignature` module has been moved out of `@latticexyz/world-modules` and into its own package at `@latticexyz/world-module-callwithsignature`. This module is now installed by default during deploy as its needed by EntryKit.

If you previously had this module installed in your MUD config, you can now remove it.

```diff
 export default defineConfig({
   tables: {
     ...
   },
-  modules: [
-    {
-      artifactPath:
-        "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json",
-      root: true,
-    },
-  ],
 });
```

**[fix(explorer): return empty array for empty results (sqlite indexer) (#3469)](https://github.com/latticexyz/mud/commit/0812178a8a873aa728358040d1d494385f78566f)** (@latticexyz/explorer)

The Explorer now returns an empty array for empty results, instead of throwing an error, when using the local indexer.

**[fix(explorer): show loader only on initial table data load (#3517)](https://github.com/latticexyz/mud/commit/0ea31c36119277e7f6cad3c71ef2b012856ead41)** (@latticexyz/explorer)

The loader in the Explore table now appears only during the initial data load. Additionally, a loading spinner has been added to the query submit button for non-live queries to indicate when a query is being refetched.

**[feat(entrykit): deploy prereqs to any chain (#3529)](https://github.com/latticexyz/mud/commit/73859484bb53c1a4066de028a3ad7d3a4284e4da)** (@latticexyz/common)

Updated Rhodolite chain config with new contract addresses.

**[fix(cli): checksum deployed world addresses (#3465)](https://github.com/latticexyz/mud/commit/090c9224b80ab949997e0463f9ec0df953c731b5)** (@latticexyz/cli)

The world address stored in `worlds.json` and `deploys/latest.json` is now checksummed.

**[chore(cli): print mud version in deploy (#3476)](https://github.com/latticexyz/mud/commit/f52b1476f04ce0be68691e3b021a81e0fb9cce99)** (@latticexyz/cli)

Deploy now prints the current MUD CLI version for easier debugging.

---

## Version 2.2.16

Release date: Fri Jan 17 2025

### Patch changes

**[docs: add changeset for bug fix (#3463)](https://github.com/latticexyz/mud/commit/59389b1e37bc84664972231989ce7fdc739cce42)** (@latticexyz/explorer)

Fixed an issue where live queries were running while paused and vice versa.

**[feat(explorer): copy button (#3423)](https://github.com/latticexyz/mud/commit/54e5c06dd4606d2484a790cd1d531931d634d7a1)** (@latticexyz/explorer)

Added 'Copy to Clipboard' button to relevant sections for easier data copying.

**[feat(explorer): query execution time (#3444)](https://github.com/latticexyz/mud/commit/05c7298412805fbc5a2eae489d567ec405414abc)** (@latticexyz/explorer)

SQL query execution time in Explore table is now measured and displayed.

---

## Version 2.2.15

Release date: Fri Jan 17 2025

### Patch changes

**[feat: add `getRecords` util to fetch records from indexer, update deployer and explorer to use indexer (#3385)](https://github.com/latticexyz/mud/commit/b819749268918559589c12451d88ec1f933182d8)** (@latticexyz/explorer)

Improved the performance of the explorer's `Interact` tab by fetching the ABI from an indexer instead of from an Ethereum RPC if available.

**[feat(explorer): buffer transactions (#3365)](https://github.com/latticexyz/mud/commit/07b6be82ace9654ce043e616e28b347f3121f415)** (@latticexyz/explorer)

The transactions list in the explorer is now updated every 100ms instead of on every incoming transaction, to improve performance when there are many incoming transactions.

**[feat(config): import mud config with tsx (#3290)](https://github.com/latticexyz/mud/commit/9580d29aa0a181e3ded9c79de185ff1778c6daf0)** (@latticexyz/config)

Replaced esbuild with tsx to load MUD config in an effort to resolve issues with loading multiple MUD configs in parallel.

**[feat(cli): fetch world deploy block number if available (#3417)](https://github.com/latticexyz/mud/commit/1e092407da570f8ba52e89e73dda50cdff161a93)** (@latticexyz/cli)

When upgrading an existing world, the deployer now attempts to read the deploy block number from the `worlds.json` file. If it is found, the `HelloWorld` and `HelloStore` event are fetched from this block instead of searching for the events starting from the genesis block.

**[feat(explorer): indicate unsaved query changes (#3446)](https://github.com/latticexyz/mud/commit/53f7906b37b8f6ae27bee3236f62787ffca35806)** (@latticexyz/explorer)

The SQL editor now shows an indicator if the query has changed since it was last run.

**[feat(entrykit): initial release (#3419)](https://github.com/latticexyz/mud/commit/971ffedb9cb88982bab1f03f4f3818dbae11c68a)** (@latticexyz/entrykit)

Initial, experimental release of EntryKit.

**[fix(explorer): type-based sorting (#3340)](https://github.com/latticexyz/mud/commit/722f4b4c48b9e49509a47e5a23f1ce45dbe9999d)** (@latticexyz/explorer)

The columns in the Explore tab table are now sorted correctly according to their types.

**[feat(store-sync): update watchLogs rpc response type (#3356)](https://github.com/latticexyz/mud/commit/1770620af19746578b99a996f380f5117bfdd053)** (@latticexyz/store-sync)

Updated the `watchLogs` util to accept the updated RPC response type.

**[feat(explorer): pause/resume live query (#3445)](https://github.com/latticexyz/mud/commit/35cb94ae06a24157303ec3311f2639f36d4e2e6f)** (@latticexyz/explorer)

SQL live queries in the Explore view table can now be paused and resumed.

**[feat(explorer): key columns indicator (#3447)](https://github.com/latticexyz/mud/commit/7fa68f6717ecd3fc2c734ca31c842c1242175cbe)** (@latticexyz/explorer)

Indicated MUD schema key columns in the table view of the Explore tab.

**[feat(explorer): show event logs for interact function (#3418)](https://github.com/latticexyz/mud/commit/1a2b3c8f585e72b0f8aae42a1c11abef7193059b)** (@latticexyz/explorer)

The functions in the Interact tab now display the emitted logs with the block explorer URL for the submitted transaction.

**[feat(explorer): bundled transactions support (#3313)](https://github.com/latticexyz/mud/commit/059240612a3ba74d3e16dfb3b1b2c7276a6ebe1d)** (@latticexyz/explorer)

Added support for ERC-4337 bundled transactions, monitoring them by either listening to chain blocks or using the `observer` transport wrapper. Each user operation within a bundled transaction is displayed as an individual transaction in the Observe tab.

**[fix(world): use WorldContextConsumerLib.\_msgSender() instead of msg.sender (#3436)](https://github.com/latticexyz/mud/commit/653f378403c7e4f234f87dec20c9dfe523f0def0)** (@latticexyz/world)

Use `WorldContextConsumerLib._msgSender()` instead of `msg.sender` in system libraries.

**[fix(explorer): format default sql query (#3363)](https://github.com/latticexyz/mud/commit/0facee02cd70b7f8cd09a7faec59972ba95453d1)** (@latticexyz/explorer)

When accessing a new table in Explore tab, the SQL editor now encloses all column names in double quotes in order to prevent invalid queries.

**[chore: add changeset for cli PR #3350 (#3353)](https://github.com/latticexyz/mud/commit/3168f1f56abce047a639582b50bf1aa2c7906c90)** (@latticexyz/cli)

Deployer now retrieves resource tags by fetching logs to work around RPC rate limiting issues.

**[feat(vite-plugin-mud): add MUD vite plugin (#3449)](https://github.com/latticexyz/mud/commit/70f224ac8214c54c9c55b170f9c900030967f1b1)** (vite-plugin-mud)

Initial release of Vite plugin for MUD projects.

This will soon be included by default in MUD templates, but you can add to an existing MUD project with:

```
pnpm add -D vite@^6 vite-plugin-mud
```

And use like:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { mud } from "vite-plugin-mud";

export default defineConfig({
  plugins: [mud({ worldsFile: "worlds.json" })],
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client", "vite-plugin-mud/env"]
  }
}
```

**[fix(explorer): fetch latest abi (#3370)](https://github.com/latticexyz/mud/commit/3258a6d66251aa87514e5e63456f989a34bd1b8b)** (@latticexyz/explorer)

The latest ABI changes are now consistently fetched correctly.

**[fix(explorer): switch to fetchBlockLogs (#3352)](https://github.com/latticexyz/mud/commit/2be543f7f0936f5dc94c13613da679d8634dfc27)** (@latticexyz/explorer)

Fixed world ABI fetching in Rhodolite.

**[fix(world): switch to TS for ABIs in utils (#3429)](https://github.com/latticexyz/mud/commit/2d2aa0867580dd910cc772b5cdd42c802e8652e3)** (@latticexyz/world)

Moved TS utils over to using hardcoded ABIs instead of ones imported from `.abi.json` files to fix some internal type resolution issues.

**[feat(store-sync): add react provider and hook (#3451)](https://github.com/latticexyz/mud/commit/5f493cd8368e6571ef196d607dcd6de2815f799e)** (@latticexyz/store-sync)

Added an experimental `@latticexyz/store-sync/react` export with a `SyncProvider` and `useSync` hook. This allows for easier syncing MUD data to React apps.

Note that this is currently only usable with Stash and assumes you are also using Wagmi in your React app.

```tsx
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { SyncProvider } from "@latticexyz/store-sync/react";
import { createSyncAdapter } from "@latticexyz/store-sync/internal";

export function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SyncProvider
          chainId={chainId}
          address={worldAddress}
          startBlock={startBlock}
          adapter={createSyncAdapter({ stash })}
        >
          {children}
        </SyncProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

**[fix(store-sync): apply logs from buffer in watchLogs (#3346)](https://github.com/latticexyz/mud/commit/cd9fd0abd859f1d83baafc93a91e238d81726928)** (@latticexyz/store-sync)

Fixed a bug in `watchLogs` where logs from the buffer were not applied during the initial sync.

**[feat(explorer): decoded callFrom transactions (#3364)](https://github.com/latticexyz/mud/commit/d542357350b85654bc65f3befad22a3509c4ddb6)** (@latticexyz/explorer)

Transactions in `Observe` tab now display decoded `callFrom` function calls.

**[chore: remove catalog usage, move viem to peer deps (#3405)](https://github.com/latticexyz/mud/commit/09e9bd533704e7c1885872a8a1f9dca9e78bda4b)** (@latticexyz/block-logs-stream, @latticexyz/common, @latticexyz/config, @latticexyz/dev-tools, @latticexyz/explorer, @latticexyz/faucet, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/stash, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world)

Moved viem to peer dependencies to ensure a single, consistent version is installed in downstream projects.

**[fix(cli): throw error on schema changes (#3336)](https://github.com/latticexyz/mud/commit/ee388ed599b051400a6f1fc5d4c5d369e466ad92)** (@latticexyz/cli)

Deployer will now throw an error if it detects an already registered table with a different schema than the one you are trying to deploy.

**[feat(store-consumer): extract store consumer contracts (#3345)](https://github.com/latticexyz/mud/commit/d17a9be933cf4dbf869e26e6f9ee070444048312)** (@latticexyz/store-consumer, @latticexyz/world-module-erc20)

Extracted StoreConsumer base contracts into an independent package.
Added a `registerNamespace` boolean to `WithWorld` to provide more control over namespace registration.

**[feat(explorer): get observer url from chain config (#3366)](https://github.com/latticexyz/mud/commit/88b9daf1e01bd8675e31c455155759a3ef2af4f8)** (@latticexyz/explorer)

Observer transport now uses the `blockExplorers.worldsExplorer.url` from the chain config if no `explorerUrl` is provided.

**[feat(explorer): run query shortcut (#3443)](https://github.com/latticexyz/mud/commit/cfdfcc1c8e1d21a6336c608760bb76aa04aebefd)** (@latticexyz/explorer)

SQL queries can be executed using the Cmd/Ctrl + Enter shortcut.

**[fix(explorer): format default sql query (#3307)](https://github.com/latticexyz/mud/commit/9c1ca41560e2b3b319976794a73807f391e78b1b)** (@latticexyz/explorer)

When accessing a new table in Explore tab, the SQL editor now encloses column names that are also PostgreSQL keywords in double quotes in order to prevent invalid queries.

**[feat(stash): clean up mutations, emit updates as a list (#3376)](https://github.com/latticexyz/mud/commit/96f1473887e609cab366a4ba6caab9b62033cfb6)** (@latticexyz/stash)

Consolidated how state changes are applied and subscribers notified. Stash subscribers now receive an ordered list of state updates rather than an object.

**[fix(world): library imports and overloaded system functions (#3395)](https://github.com/latticexyz/mud/commit/ba5191c3d6f74b3c4982afd465cf449d23d70bb7)** (@latticexyz/world)

Fixes relative system imports in system libraries and adds support for overloaded system functions.

**[feat(cli): allow deploy salt to be a string (#3432)](https://github.com/latticexyz/mud/commit/74090950d81c6713d981806af5c1197e804b56bf)** (@latticexyz/cli)

In addition to a hex `--salt`, deploy commands now accept a string salt for world deployment, which will get converted to a hex.

```
pnpm mud deploy --salt hello
```

**[fix(cli): don't overload system abi type (#3455)](https://github.com/latticexyz/mud/commit/8fcf9c8f508ec818696f366a41f2b8a2e42c11b1)** (@latticexyz/cli)

Fixed an issue with overloaded system ABI types.

**[feat(store): add getRecord and getStaticDataLocation helpers (#3430)](https://github.com/latticexyz/mud/commit/1b477d476a666ccffafc6eb266d1732b90bc28f9)** (@latticexyz/store)

Added internal `getRecord` and `getStaticDataLocation` helpers.

**[feat: add `getRecords` util to fetch records from indexer, update deployer and explorer to use indexer (#3385)](https://github.com/latticexyz/mud/commit/b819749268918559589c12451d88ec1f933182d8)** (@latticexyz/store-sync, @latticexyz/world)

Added a `getRecords` util to fetch table records from an indexer or RPC.

Migrated the `getFunctions` and `getWorldAbi` utils from `@latticexyz/world` to `@latticexyz/store-sync/world` to allow `getFunctions` and `getWorldAbi` to use `getRecords` internally without circular dependencies.

**[feat: add `getRecords` util to fetch records from indexer, update deployer and explorer to use indexer (#3385)](https://github.com/latticexyz/mud/commit/b819749268918559589c12451d88ec1f933182d8)** (@latticexyz/cli)

Added an `indexerUrl` option to the `mud deploy` and `mud pull` CLI commands to read table records from an indexer instead of fetching logs from an Ethereum RPC.

**[feat(stash): add useRecord and useRecords hooks (#3450)](https://github.com/latticexyz/mud/commit/16242b74d5985720b4efca26e1e22e38bb463788)** (@latticexyz/stash)

Added `useRecord` and `useRecords` hooks for convenience.

```ts
import { useRecords } from "@latticexyz/stash/react";

const players = useRecords({ stash, table: Position });
```

```ts
import { useRecord } from "@latticexyz/stash/react";

const player = useRecord({ stash, table: Position, key: { player: "0x..." } });
```

**[fix(abi-ts): ts output should use as const (#3348)](https://github.com/latticexyz/mud/commit/534039428496bcededc62d2e450d29d7bac42475)** (@latticexyz/abi-ts)

Using a TS extension (rather than DTS) now correctly includes `as const` in the TS output.

**[fix(world): use fetchLogs in getFunctions (#3338)](https://github.com/latticexyz/mud/commit/22674ad244f59afd6bd364a3dd44df36992dd35f)** (@latticexyz/world)

`getFunctions` now internally uses `fetchLogs` for better handling of block range errors.

**[feat(explorer): export table data (#3380)](https://github.com/latticexyz/mud/commit/b0b42a9e0cca0e31fb31d1e00b78c3015b6f5663)** (@latticexyz/explorer)

Added support for exporting table data in CSV, JSON, and TXT formats.

**[feat(common): loosen client type in tx queue (#3408)](https://github.com/latticexyz/mud/commit/9d7188754ad7f6df6b190bf6618b598cb1d895c4)** (@latticexyz/common)

Loosened `publicClient` type for `transactionQueue` action decorator and `writeContract` and `sendTransaction` actions so that they can be used with plain, undecorated Viem clients.

**[feat(world): rework types for callFrom viem action (#3414)](https://github.com/latticexyz/mud/commit/509a3ccbac9b552a086f93b735d48e739153bead)** (@latticexyz/world)

Reworked `callFrom` action to use `getAction` internally, rather than a decorated Viem client, and updated types to better match Viem.

**[feat(explorer): show results from query functions (#3448)](https://github.com/latticexyz/mud/commit/c681aa6250eb8c3914a75fd45cdf32abc2d60746)** (@latticexyz/explorer)

In the Explore tab, the view table now displays results generated by SQL query functions.

**[fix(store-sync): reconnect unresponsive watchLogs socket (#3301)](https://github.com/latticexyz/mud/commit/9ddc874ecbe8671c197619a23bdeac2bee57174e)** (@latticexyz/store-sync)

Experimental pending logs watcher now reconnects if it loses connection or times out.

**[feat: system libraries (#3374)](https://github.com/latticexyz/mud/commit/09536b0614a03478fa0f53ec8beefef80455387d)** (@latticexyz/store, @latticexyz/world)

Adds an experimental feature to automatically generate Solidity libraries from systems, making it easier to perform calls between systems.

**[feat(store-sync): use client instead of decorated public client (#3441)](https://github.com/latticexyz/mud/commit/a6fe15cc524a7a2ed39a1f93d3e4f41a4e251697)** (@latticexyz/store-sync)

All sync methods using a `publicClient` argument now accept a plain Viem `Client` rather than a decorated `PublicClient`, allowing for more flexibility and better tree-shaking for lighter bundles.

**[feat(explorer): get observer url from chain config (#3366)](https://github.com/latticexyz/mud/commit/88b9daf1e01bd8675e31c455155759a3ef2af4f8)** (@latticexyz/common)

Updated Rhodolite chain config.

**[feat(world): add SystemCall.staticcall (#3381)](https://github.com/latticexyz/mud/commit/275c867182df9f1e22a6d4f0901a494c40e29f9a)** (@latticexyz/world)

Add a SystemCall.staticcall function that performs a staticcall without executing hooks.

**[feat(paymaster): add simple GenerousPaymaster for local development (#3422)](https://github.com/latticexyz/mud/commit/a7625b97410346b1187e66803dde5194084312fd)** (@latticexyz/paymaster)

Added `GenerousPaymaster`, a simple paymaster that sponsors all user operations for local development purposes.

---

## Version 2.2.14

Release date: Thu Oct 24 2024

### Patch changes

**[fix(cli): support public library methods in modules (#3308)](https://github.com/latticexyz/mud/commit/8eaad304db2fe9ae79f087ec7860928f734039d4)** (@latticexyz/cli)

Added support for deploying public libraries used within modules.

**[fix(cli): support public library methods in modules (#3308)](https://github.com/latticexyz/mud/commit/8eaad304db2fe9ae79f087ec7860928f734039d4)** (@latticexyz/world-module-erc20, @latticexyz/world-modules)

Changed ERC20 and ERC721 related modules to use public library methods instead of manual `delegatecall`s.

**[feat(stash): add useStash and improve other helpers (#3320)](https://github.com/latticexyz/mud/commit/93d0e763cca0facaaa20d7bde861c98c298f08ad)** (@latticexyz/stash)

Added `useStash` React hook. It's heavily inspired by Zustand's `useStore` and accepts a stash, a state selector, an an optional equality function to avoid unnecessary re-render cycles when returning unstable values.

Also updated `getRecord` and `getRecords` to each take either a `stash` or `state` object for more ergonomic use with `useStash`.

```ts
import { useStash } from "@latticexyz/stash/react";
import { getRecord } from "@latticexyz/stash";
import config from "../mud.config";

const tables = config.namespaces.app.tables;

export function PlayerName({ playerId }) {
  const record = useStash(stash, (state) => getRecord({ state, table: tables.Player, key: { playerId } }));
  ...
}
```

```ts
import isEqual from "fast-deep-equal";
import { useStash } from "@latticexyz/stash/react";
import { getRecords } from "@latticexyz/stash";
import config from "../mud.config";

export function PlayerNames() {
  const record = useStash(stash, (state) => getRecords({ state, table: tables.Player }), { isEqual });
  ...
}
```

---

## Version 2.2.13

Release date: Wed Oct 23 2024

### Patch changes

**[fix(gas-report): include contract name in file of output (#3317)](https://github.com/latticexyz/mud/commit/d5c270023abc325f25af868d3db1a0bdc3e62d6d)** (@latticexyz/gas-report)

Gas report output now include contract name as part of the `file` to help with stable ordering when sorting output.

**[chore(world-module-erc20): export erc20 module from internal (#3319)](https://github.com/latticexyz/mud/commit/90803770ee72bfd2b9ba9a7990285d1c5866f362)** (@latticexyz/world-module-erc20)

The new ERC20 World Module provides a simpler alternative to the ERC20 Puppet Module, while also being structured in a more extendable way so users can create tokens with custom functionality.

To install this module, you can import and define the module configuration from the NPM package:

```typescript
import { defineERC20Module } from "@latticexyz/world-module-erc20/internal";

// Add the output of this function to your World's modules
const erc20Module = defineERC20Module({ namespace: "erc20Namespace", name: "MyToken", symbol: "MTK" });
```

For detailed installation instructions, please check out the [`@latticexyz/world-module-erc20` README.md](https://github.com/latticexyz/mud/blob/main/packages/world-module-erc20/README.md).

**[feat(explorer): multi-line sql editor (#3311)](https://github.com/latticexyz/mud/commit/79d273a20b3dd50ab733b3261b830b0ef47bcebf)** (@latticexyz/explorer)

The SQL query editor now supports multi-line input.

**[feat(abi-ts): extension option (#3315)](https://github.com/latticexyz/mud/commit/75e93bac492f9000c482d6a26a5c8e29079dd32d)** (@latticexyz/abi-ts)

Added an `--extension` option to customize the resulting TS or DTS output. It defaults to the previous behavior of `.json.d.ts`, but can now be set to `.d.json.ts` for compatibility with newer TS versions and `.json.ts` or just `.ts` for a pure TS file.

**[fix(store-sync): update latest block for live logs API (#3323)](https://github.com/latticexyz/mud/commit/dfc2d6439ee7076cdccbf1a24b7423fb19a7771d)** (@latticexyz/store-sync)

Fixed an issue where the sync progress was not moving to "live" when synced from the MUD indexer's live logs API.

---

## Version 2.2.12

Release date: Fri Oct 18 2024

### Patch changes

**[feat(explorer): add functions filter to query state (#3268)](https://github.com/latticexyz/mud/commit/3d8db6f76f3634d532d39cf4091f22fee0a32b68)** (@latticexyz/explorer)

Function filters in `Interact` tab are now included as part of the URL.

**[feat(explorer): transaction timings (#3274)](https://github.com/latticexyz/mud/commit/1b0ffcf7a1a7daa2a87efe26059d6a142d257588)** (@latticexyz/explorer)

Transactions in Observe tab are now populated with timing metrics when using the `observer` Viem decorator in local projects.

You can wire up your local project to use transaction timings with:

```
import { observer } from "@latticexyz/explorer/observer";

// Extend the Viem client that is performing writes
walletClient.extend(observer());
```

**[fix(faucet,store-indexer): add bin wrappers (#3296)](https://github.com/latticexyz/mud/commit/20f44fbf733ff876d64a544c68a3cb1a4dc307a9)** (@latticexyz/faucet, @latticexyz/store-indexer)

Added bin wrappers to resolve issues when installing the package locally as a dependency of another package.

**[feat(explorer): show ABI errors in interact page (#3303)](https://github.com/latticexyz/mud/commit/d4c10c18ad853bed21c55fe92e2ba09c2382316d)** (@latticexyz/explorer)

Interact tab now displays decoded ABI errors for failed transactions.

**[chore: bump viem (#3273)](https://github.com/latticexyz/mud/commit/ea18f270c9a43dbe489b25f11b8379ccd969c02a)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/config, @latticexyz/dev-tools, @latticexyz/explorer, @latticexyz/faucet, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/stash, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world, create-mud)

Bumped viem to v2.21.19.

MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

```
pnpm recursive up viem@2.21.19
```

**[fix(explorer): display nested inputs (#3266)](https://github.com/latticexyz/mud/commit/2c9240111ae11e6727d3581453fba2b866f4b4a0)** (@latticexyz/explorer)

Fixed inputs display in the transactions table row.

**[feat(common): add rhodolite chain (#3295)](https://github.com/latticexyz/mud/commit/41a6e2f83ac4d48a9dccf52d933c15074b9a724e)** (@latticexyz/common)

Added Rhodolite devnet chain config and removed the old and now-defunct Lattice testnet chain config.

**[feat(explorer): show explore table error message (#3286)](https://github.com/latticexyz/mud/commit/af725304e133f95b0b0eb827fdf7283e54ac8342)** (@latticexyz/explorer)

Display error messages for failed queries within the Explore tab's table viewer.

**[feat(explorer): sql editor (#3276)](https://github.com/latticexyz/mud/commit/3a80bed31b97d439025f68b8e4ded27354e102f1)** (@latticexyz/explorer)

Explore page now has a full-featured SQL editor with syntax highlighting, autocomplete, and query validation.

**[feat(explorer): front page (#3255)](https://github.com/latticexyz/mud/commit/6476dec94cf32275631d49c7e8fe8fe5a0708040)** (@latticexyz/explorer)

Each chain's home page now lets you find and pick a world to explore.

**[feat(store-sync): add support for watching pending logs (#3287)](https://github.com/latticexyz/mud/commit/84ae33b8af3ebeb90749c6e82250869b15d17ed1)** (@latticexyz/store-sync)

Added experimental support for syncing state from pending logs.

**[fix(explorer): various fixes (#3299)](https://github.com/latticexyz/mud/commit/9a43e87db302ec599fd1e97d8b77e2e68831017f)** (@latticexyz/explorer)

- Not found page if invalid chain name.
- Only show selector for worlds if options exist.
- Remove "future time" from transactions table.
- Improved layout for Interact tab.
- Wrap long args in transactions table.
- New tables polling.
- Add logs (regression).

**[fix(common): allow overriding fees in writeContract and sendTransaction (#3288)](https://github.com/latticexyz/mud/commit/fe98442d7ee82f0d41ba10f05a4ee1bafea69d48)** (@latticexyz/common)

The `transactionQueue` decorator internally keeps an updated reference for the recommended `baseFeePerGas` and `maxPriorityFeePerGas` from the connected chain to avoid having to fetch it right before sending a transaction.
However, due to the way the fee values were overridden, it wasn't possible for users to explicitly pass in custom fee values.
Now explicitly provided fee values have precedence over the internally estimated fee values.

**[feat(explorer): global transactions listener (#3285)](https://github.com/latticexyz/mud/commit/4b4640913d014fb3a0a5a417b84c91b247e08ffc)** (@latticexyz/explorer)

Transactions are now monitored across all tabs while the World Explorer is open.

---

## Version 2.2.11

Release date: Mon Oct 07 2024

### Patch changes

**[feat(explorer): show transactions (#3062)](https://github.com/latticexyz/mud/commit/bbd5e315d18e2a3cdbd9a20023b680eac77d74b6)** (@latticexyz/explorer)

Observe tab is now populated by transactions flowing through the world, in addition to local transactions when using the `observer` transport wrapper.

**[feat(cli,store): fetch table-specific logs (#3245)](https://github.com/latticexyz/mud/commit/7ddcf64a222f184b1902a1dc93089064465b6acf)** (@latticexyz/block-logs-stream)

`fetchLogs` and `blockRangeToLogs` now accept a `getLogs` option to override the default behavior.

**[feat(cli,store): fetch table-specific logs (#3245)](https://github.com/latticexyz/mud/commit/7ddcf64a222f184b1902a1dc93089064465b6acf)** (@latticexyz/store)

Added `getStoreLogs` and `flattenStoreLogs` to aid in fetching data from store contracts. For now, these are internal exports and considered unstable/experimental.

**[feat(store-sync): add client support for streaming logs from indexer (#3226)](https://github.com/latticexyz/mud/commit/61930eeade86d8ce46392449a797ef6291f0ce62)** (@latticexyz/store-sync)

Added support for streaming logs from the indexer.

**[fix(explorer): expand selected transaction table row by hash/writeId (#3263)](https://github.com/latticexyz/mud/commit/645b7e09f191b41ad296c23f212da1739f17add5)** (@latticexyz/explorer)

Fixed row expansion in the transactions table where an incorrect row would expand when new transactions appeared.

**[fix(cli): update state block in dev runner redeploy (#3243)](https://github.com/latticexyz/mud/commit/111bb1b6c767a6f9654dde1a711d1db784f0770a)** (@latticexyz/cli)

Fixed a dev runner bug where the state block of a previous deploy was not updated during a redeploy, causing failed deploys due to fetching outdated world state.

**[fix(explorer): allow overriding internal indexer env variables (#3237)](https://github.com/latticexyz/mud/commit/85bbeb8be12597f28cd1506dae0d44b34c1427e4)** (@latticexyz/explorer)

It is now possible to pass in environment variables like `RPC_HTTP_URL` to the internal local indexer when running the explorer locally.

**[feat(explorer): integrate rejected transactions (#3251)](https://github.com/latticexyz/mud/commit/71eb34804ee9a6c74a10f896f41bf6f74cfc889c)** (@latticexyz/explorer)

Observe tab is now populated by rejected transactions coming from the `observer` transport wrapper.

**[feat(cli,store): fetch table-specific logs (#3245)](https://github.com/latticexyz/mud/commit/7ddcf64a222f184b1902a1dc93089064465b6acf)** (@latticexyz/cli)

Deployer now has a better method for fetching store logs from the world that should be more efficient and resilient to block range errors and rate limiting.

**[feat(store): add unwrap() function to ResourceIdInstance (#3249)](https://github.com/latticexyz/mud/commit/13e56891c7d6b66d53047e0d2de38ffea6fd2524)** (@latticexyz/store)

Added an `unwrap` function to the `ResourceIdInstance` library to make it easier to unwrap a `ResourceId` with `resourceId.unwrap()`.

**[feat(cli,store): fetch table-specific logs (#3245)](https://github.com/latticexyz/mud/commit/7ddcf64a222f184b1902a1dc93089064465b6acf)** (@latticexyz/common)

Added `logSort` method to help when sorting logs fetched from RPC, where they come back ordered relative to the topics used.

```ts
import { logSort } from "@latticexyz/common";

const logs = getLogs(...);
logs.sort(logSort);
```

**[feat(cli): mud pull (#3171)](https://github.com/latticexyz/mud/commit/9e53a51f3b6bf04f5a0074e2c61dc88a9a63ceec)** (@latticexyz/cli)

Added a `mud pull` command that downloads state from an existing world and uses it to generate a MUD config with tables and system interfaces. This makes it much easier to extend worlds.

```
mud pull --worldAddress 0x… --rpc https://…
```

---

## Version 2.2.10

Release date: Thu Sep 26 2024

### Patch changes

**[fix(world): resolve system namespace label (#3232)](https://github.com/latticexyz/mud/commit/9d7fc8588ef045280b544d2aace0d53a4324c71a)** (@latticexyz/world)

The `namespace` field in a multi-namespace config is now correctly resolved for systems.
This fixes a bug with root systems in a multi-namespace project.

**[fix(explorer): construct sqlite table names (#3234)](https://github.com/latticexyz/mud/commit/e39afda94e23cf11ade7bdc46c7ae6510ddc5e26)** (@latticexyz/explorer)

Fixed table name construction in the explorer query for root tables for SQLite.

**[fix(explorer): various fixes (#3235)](https://github.com/latticexyz/mud/commit/8858e52210693679e7626e25ee4dd9bcf30d7ae8)** (@latticexyz/explorer)

- Tables can be searched by specific values.
- Improved handling of dynamic SQL queries.
- The "Connect" modal is triggered during a write action if the wallet is not connected.
- Toast messages are now dismissible.

**[fix(create-mud): upgrade mprocs (#3236)](https://github.com/latticexyz/mud/commit/af26487ed896a2734f50b16a54d585631b13110d)** (create-mud)

Upgraded mprocs to fix issues with it not running when started via npm script.

You can do the same in an existing MUD project with:

```
pnpm recursive up mprocs@latest
```

---

## Version 2.2.9

Release date: Wed Sep 25 2024

### Patch changes

**[feat(explorer): dozer integration (#3185)](https://github.com/latticexyz/mud/commit/2f2e63adbc90288d11e4a15d755167f9c97cbf74)** (@latticexyz/explorer)

Exploring worlds on Redstone and Garnet chains will now retrieve data from the hosted SQL indexer.

**[feat(explorer): local indexer inside explorer (#3229)](https://github.com/latticexyz/mud/commit/95aa3bb07df284a374e982ccea53d24df4d61219)** (@latticexyz/explorer, create-mud)

Explorer now automatically starts a local indexer when using Anvil as the target chain.

If you previously had an `indexer` entry in your `mprocs.yaml` file, it can now be removed.

```diff
-  indexer:
-    cwd: packages/contracts
-    shell: shx rm -rf $SQLITE_FILENAME && pnpm sqlite-indexer
-    env:
-      DEBUG: mud:*
-      RPC_HTTP_URL: "http://127.0.0.1:8545"
-      FOLLOW_BLOCK_TAG: "latest"
-      SQLITE_FILENAME: "indexer.db"
```

**[feat(explorer): move filter state to url (#3225)](https://github.com/latticexyz/mud/commit/6c056de6090a6f4a9633b96513ca1738dc0993c1)** (@latticexyz/explorer)

Table filters are now included as part of the URL. This enables deep links and improves navigating between pages without losing search state.

**[refactor(cli): adjust deploy order (#3222)](https://github.com/latticexyz/mud/commit/9d990b5edc39c471929b2e6309bfa2ac448aa4c3)** (@latticexyz/cli)

Adjusted deploy order so that the world deploy happens before everything else to avoid spending gas on system contract deploys, etc. if a world cannot be created first.

---

## Version 2.2.8

Release date: Mon Sep 23 2024

### Patch changes

**[feat(store-sync): remove unused generics (#3218)](https://github.com/latticexyz/mud/commit/7c7bdb26d0f87e2a5fc20c4eb34abb5167000ab9)** (@latticexyz/common, @latticexyz/store-sync)

Removed unused generics and ensure that we're only passing around the generics we need, when we need them. Hopefully this improves TS performance in MUD projects.

**[fix(create-mud): add missing three deps, fix types (#3221)](https://github.com/latticexyz/mud/commit/4fffb79d433d1052e4b3c9cce0215cf81eba9b11)** (create-mud)

Fixed types in threejs template after dependency bump.

**[feat(cli): paginate world deploy logs (#3217)](https://github.com/latticexyz/mud/commit/0f5b2916edfa24b9d0ad1b82df56aed57f7e657d)** (@latticexyz/cli)

When deploying to an existing world, the deployer now paginates with [`fetchLogs`](https://github.com/latticexyz/mud/blob/main/packages/block-logs-stream/src/fetchLogs.ts) to find the world deployment.

**[feat(cli): paginate world deploy logs (#3217)](https://github.com/latticexyz/mud/commit/0f5b2916edfa24b9d0ad1b82df56aed57f7e657d)** (@latticexyz/block-logs-stream)

- For block range size errors, `fetchLogs` now reduces the max block range for subsequent requests in its loop. For block out of range or response size errors, only the current request's block range is reduced until the request succeeds, then it resets to the max block range.
- Added `fetchBlockLogs` to find all matching logs of the given block range, grouped by block number, in a single async call.
- Loosened the `publicClient` type and switched to tree shakable actions.

**[fix(cli): wait for world init before transferring ownership (#3220)](https://github.com/latticexyz/mud/commit/b0711983a5f72f9b3236e6cbcef3dae7a424a09c)** (@latticexyz/cli)

If the project is using a custom world, the deployer now waits for the init transaction to be confirmed before transferring ownership of the world.

---

## Version 2.2.7

Release date: Fri Sep 20 2024

### Patch changes

**[feat(cli): quieter automine (#3212)](https://github.com/latticexyz/mud/commit/58f101e45ad50e064779cbc441246a22b70efa07)** (@latticexyz/cli)

Reduced the log noise from enabling/disabling automine on non-Anvil chains.

**[fix(explorer): better observer decorator types (#3206)](https://github.com/latticexyz/mud/commit/5a6c03c6bc02c980ca051dadd8e20560ac25c771)** (@latticexyz/explorer)

Fixed `observer` decorator types so it can be used in more places.

**[feat(explorer): filterable tables selector (#3203)](https://github.com/latticexyz/mud/commit/7ac2a0d5ffd3f65d89318fc5778121ddf45bb5e1)** (@latticexyz/explorer)

Table selector of the Explore tab now has an input for searching/filtering tables by name.

**[fix(store): better enumValues type (#3211)](https://github.com/latticexyz/mud/commit/a08ba5e31e90bf3208919bc1d5e08c1ba9524130)** (@latticexyz/store)

Improved config output type of `enumValues`.

**[refactor: waitForStateChange -> waitForTransaction (#3210)](https://github.com/latticexyz/mud/commit/d21c1d1817ec2394007b28c90fec5a81f1fdd3d0)** (@latticexyz/explorer)

Renamed optional `waitForStateChange` param in `observer()` decorator to `waitForTransaction` to better align with `@latticexyz/store-sync` packages.

```diff
 const { waitForTransaction } = syncToZustand(...);
-observer({ waitForStateChange: waitForTransaction });
+observer({ waitForTransaction });
```

---

## Version 2.2.6

Release date: Thu Sep 19 2024

### Patch changes

**[feat(stash): release package to npm (#3184)](https://github.com/latticexyz/mud/commit/20fac30f2fb1e026f195ffe42c014cfaf9877376)** (@latticexyz/stash)

Added `@latticexyz/stash` package, a TypeScript client state library optimized for the MUD Store data model.
It uses the MUD store config to define local tables, which support writing, reading and subscribing to table updates.
It comes with a query engine optimized for "ECS-style" queries (similar to `@latticexyz/recs`) but with native support for composite keys.

You can find usage examples in the [`@latticexyz/stash` README.md](https://github.com/latticexyz/mud/blob/main/packages/stash/README.md).

This package is experimental and will have breaking changes while we refine its APIs and implementation. All of its exports are temporarily under `@latticexyz/stash/internal` until we consider it stable.

**[fix(cli): improve performance of linked library resolution during deployment (#3197)](https://github.com/latticexyz/mud/commit/22c37c3dbec5726f52055ed61c4e5f0e52ed30c1)** (@latticexyz/cli)

Significantly improved the deployment performance for large projects with public libraries by implementing a more efficient algorithm to resolve public libraries during deployment.
The local deployment time on a large reference project was reduced from over 10 minutes to 4 seconds.

**[feat(store-sync): add syncToStash util (#3192)](https://github.com/latticexyz/mud/commit/8dc588918c488f98603cbb7e183c88129942debe)** (@latticexyz/store-sync)

Added a `syncToStash` util to hydrate a `stash` client store from MUD contract state. This is currently exported from `@latticexyz/store-sync/internal` while Stash package is unstable/experimental.

```ts
import { createClient, http } from "viem";
import { anvil } from "viem/chains";
import { createStash } from "@latticexyz/stash/internal";
import { syncToStash } from "@latticexyz/store-sync/internal";
import config from "../mud.config";

const client = createClient({
  chain: anvil,
  transport: http(),
});

const address = "0x...";

const stash = createStash(config);
const sync = await syncToStash({ stash, client, address });
```

---

## Version 2.2.5

Release date: Thu Sep 19 2024

### Patch changes

**[fix(explorer): various fixes (#3195)](https://github.com/latticexyz/mud/commit/55ae82299985fd927cb45cf0d262c7fded156763)** (@latticexyz/explorer)

Refactored `observer` initialization to reuse bridge iframes with the same `url`.

**[fix(explorer): various fixes (#3195)](https://github.com/latticexyz/mud/commit/55ae82299985fd927cb45cf0d262c7fded156763)** (@latticexyz/explorer)

Fixed favicon paths and fixed a few issues where we were incorrectly redirecting based on the chain name or ID.

**[fix(explorer): various fixes (#3195)](https://github.com/latticexyz/mud/commit/55ae82299985fd927cb45cf0d262c7fded156763)** (@latticexyz/explorer)

Fixed an issue where the `observer` Viem client decorator required an empty object arg when no options are used.

```diff
-client.extend(observer({}));
+client.extend(observer());
```

---

## Version 2.2.4

Release date: Wed Sep 18 2024

### Patch changes

**[feat(explorer): anvil connector, connect external wallets (#3164)](https://github.com/latticexyz/mud/commit/e6147b2a9c92369d2ca26c60275c766da1a7d0d5)** (@latticexyz/explorer)

World Explorer now supports connecting external wallets.

**[fix(common): use latest block tag in nonce manager (#3180)](https://github.com/latticexyz/mud/commit/2f935cfd3fbc62f3c304e470751a26189523fcd2)** (@latticexyz/common)

To reset an account's nonce, the nonce manager uses the [`eth_getTransactionCount`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount) RPC method,
which returns the number of transactions sent from the account.
When using the `pending` block tag, this includes transactions in the mempool that have not been included in a block yet.
If an account submits a transaction with a nonce higher than the next valid nonce, this transaction will stay in the mempool until the nonce gap is closed and the transactions nonce is the next valid nonce.
This means if an account has gapped transactions "stuck in the mempool", the `eth_getTransactionCount` method with `pending` block tag can't be used to get the next valid nonce
(since it includes the number of transactions stuck in the mempool).
Since the nonce manager only resets the nonce on reload or in case of a nonce error, using the `latest` block tag by default is the safer choice to be able to recover from nonce gaps.

Note that this change may reveal more "transaction underpriced" errors than before. These errors will now be retried automatically and should go through after the next block is mined.

**[feat: bump wevm packages (#3178)](https://github.com/latticexyz/mud/commit/50010fb9fb6d21f69ba23c1eae14f4203919183d)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/config, @latticexyz/dev-tools, @latticexyz/explorer, @latticexyz/faucet, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/stash, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world, create-mud)

Bumped viem, wagmi, and abitype packages to their latest release.

MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

```
pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6
```

**[feat(cli): register namespace labels (#3172)](https://github.com/latticexyz/mud/commit/d3acd9242da44d201ea99e04c1631ed687d30a80)** (@latticexyz/cli)

Along with table and system labels, the MUD deployer now registers namespace labels. Additionally, labels will only be registered if they differ from the underlying resource name.

**[feat(explorer): active chain as dynamic param (#3181)](https://github.com/latticexyz/mud/commit/20604952d33419f18ab93fcc048db564b56a54b4)** (@latticexyz/explorer)

Added ability to connect World Explorer to Redstone and Garnet chains. The active chain is now passed as a dynamic route parameter.

**[feat(explorer): write observer (#3169)](https://github.com/latticexyz/mud/commit/784e5a98e679388ad6bc941cd1bc9b6486cf276d)** (@latticexyz/explorer)

World Explorer package now exports an `observer` Viem decorator that can be used to get visibility into contract writes initiated from your app. You can watch these writes stream in on the new "Observe" tab of the World Explorer.

```ts
import { createClient, publicActions, walletActions } from "viem";
import { observer } from "@latticexyz/explorer/observer";

const client = createClient({ ... })
  .extend(publicActions)
  .extend(walletActions)
  .extend(observer());
```

By default, the `observer` action assumes the World Explorer is running at `http://localhost:13690`, but this can be customized with the `explorerUrl` option.

```ts
observer({
  explorerUrl: "http://localhost:4444",
});
```

If you want to measure the timing of transaction-to-state-change, you can also pass in a `waitForStateChange` function that takes a transaction hash and returns a partial [`TransactionReceipt`](https://viem.sh/docs/glossary/types#transactionreceipt) with `blockNumber`, `status`, and `transactionHash`. This mirrors the `waitForTransaction` function signature returned by `syncTo...` helper in `@latticexyz/store-sync`.

```ts
observer({
  async waitForStateChange(hash) {
    return await waitForTransaction(hash);
  },
});
```

**[fix(world): resolve module config (#3193)](https://github.com/latticexyz/mud/commit/1f24978894725dca13c2adfee384e12f53f05c26)** (@latticexyz/world)

Added a config resolver to add default values for `modules` in the world config.

**[feat(store-sync): add util to fetch snapshot from indexer with SQL API (#2996)](https://github.com/latticexyz/mud/commit/8b4110e5d9ca2b7a6553a2c4078b7a8b82c6f211)** (@latticexyz/protocol-parser, @latticexyz/store-sync)

Added `store-sync` helper libraries to interact with the indexer's experimental SQL API endpoint. Documentation is available at [https://mud.dev/indexer/sql](https://mud.dev/indexer/sql).

---

## Version 2.2.3

Release date: Tue Sep 10 2024

### Patch changes

**[feat(cli): deploy custom world (#3131)](https://github.com/latticexyz/mud/commit/854645260c41eaa89cdadad30bf8e70d5d2fd109)** (@latticexyz/cli, @latticexyz/world)

MUD config now supports a `deploy.customWorld` option that, when used with the CLI, will deploy the specified custom World implementation.
Custom implementations must still follow [the World protocol](https://github.com/latticexyz/mud/tree/main/packages/world/ts/protocol-snapshots).

If you want to extend the world with new functions or override existing registered functions, we recommend using [root systems](https://mud.dev/world/systems#root-systems).
However, there are rare cases where this may not be enough to modify the native/internal World behavior.
Note that deploying a custom World opts out of the world factory, deterministic world deploys, and upgradeable implementation proxy.

```ts
import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  customWorld: {
    // path to custom world source from project root
    sourcePath: "src/CustomWorld.sol",
    // custom world contract name
    name: "CustomWorld",
  },
});
```

**[fix(explorer): world address cli option as hex (#3155)](https://github.com/latticexyz/mud/commit/b9c61a96082e62c4f1bec3a8ebb358ea30c315f0)** (@latticexyz/explorer)

Fixed an issue with `--worldAddress` CLI flag being incorrectly interpreted as a number rather a hex string. Additionally, added `--hostname` option for specifying the hostname on which to start the application.

**[feat(cli): speed up dev deploy with temporary automine during deploy (#3130)](https://github.com/latticexyz/mud/commit/d3ab5c3783265b3e82b76157bccedeae6b0445e1)** (@latticexyz/cli)

Speed up deployment in development by temporarily enabling automine mode for the duration of the deployment.

---

## Version 2.2.2

Release date: Tue Sep 03 2024

### Patch changes

**[style(explorer): format account balances (#3117)](https://github.com/latticexyz/mud/commit/fb9def83ddb128387b70edb6fe88064e234366ce)** (@latticexyz/explorer)

Format account balances with comma-separated thousands and trimmed decimal places for better readability.

**[feat(explorer): show error message in error page (#3121)](https://github.com/latticexyz/mud/commit/4b86c04dc703faf3bf12f6143781b5940b62cb17)** (@latticexyz/explorer)

Added error messages to error page to facilitate easier troubleshooting.

**[fix(cli): add missing await (#3119)](https://github.com/latticexyz/mud/commit/ef6f7c0c6afcc46e7463d18c00fa99c7cafcae65)** (@latticexyz/cli)

Fixed regression in 2.2.1 where deployment of modules already installed would throw an error instead of skipping.

---

## Version 2.2.1

Release date: Sun Sep 01 2024

### Patch changes

**[fix(store-sync): handle TransactionReceiptNotFoundError (#3115)](https://github.com/latticexyz/mud/commit/603b2ab6631c4f38fca0d9092d255578061987aa)** (@latticexyz/store-sync)

Improved error handling of `TransactionReceiptNotFoundError` in `waitForTransaction` when Viem versions aren't aligned.

**[fix(cli): deployer should wait for prereq txs (#3113)](https://github.com/latticexyz/mud/commit/0738d295f802be28524d517d75efe3b5837f10c1)** (@latticexyz/cli)

Deployer now waits for prerequisite transactions before continuing.

**[fix(common): use pending block tag in tx queue (#3073)](https://github.com/latticexyz/mud/commit/c0764a5e7d3a6a5291198dfe802fe060a0b54da9)** (@latticexyz/common)

`writeContract` and `sendTransaction` actions now use `pending` block tag when estimating gas. This aligns with previous behavior before changes in the last version.

---

## Version 2.2.0

Release date: Fri Aug 30 2024

### Minor changes

**[chore(explorer): update world explorer naming (#3069)](https://github.com/latticexyz/mud/commit/0eb25560cfc78354a5e6845c3244375759b71f4c)** (@latticexyz/explorer)

Initial release of the `@latticexyz/explorer` package. World Explorer is a standalone tool designed to explore and manage worlds. This initial release supports local worlds, with plans to extend support to any world in the future.

Read more on how to get started or contribute in the [World Explorer README](https://github.com/latticexyz/mud/blob/main/packages/explorer/README.md).

### Patch changes

**[fix(common): route all actions through viem client (#3071)](https://github.com/latticexyz/mud/commit/69cd0a1ba0450f3407ec5865334079653503fa86)** (@latticexyz/common)

Updated all custom Viem actions to properly call other actions via `getAction` so they can be composed.

**[build: use shx from dev deps (#3085)](https://github.com/latticexyz/mud/commit/c0bb0da58966b49c51570de9e3e031bee78b8473)** (create-mud)

Templates now use `shx` to run shell commands in scripts for better Windows compatibility.

**[feat(world): add namespaceLabel to system config (#3057)](https://github.com/latticexyz/mud/commit/04c675c946a0707956f38daad3fe516fde4a33a2)** (@latticexyz/config, @latticexyz/store)

Fixed a few type issues with `namespaceLabel` in tables and added/clarified TSDoc for config input/output objects.

**[fix(create-mud): update changeset package name + description (#3066)](https://github.com/latticexyz/mud/commit/bd4dffcabd6c6715df213e6c0c8b0631c9afc0b7)** (create-mud)

New projects created with `pnpm create mud` now include the World Explorer and SQLite indexer running as additional services.

**[feat(world): add namespaceLabel to system config (#3057)](https://github.com/latticexyz/mud/commit/04c675c946a0707956f38daad3fe516fde4a33a2)** (@latticexyz/cli, @latticexyz/world)

Add a strongly typed `namespaceLabel` to the system config output.
It corresponds to the `label` of the namespace the system belongs to and can't be set manually.

**[feat(cli,world): register system ABI onchain (#3050)](https://github.com/latticexyz/mud/commit/31caecc95be72fe94efd1df8cba2b5435fa39bb4)** (@latticexyz/cli)

In addition to table labels, system labels and ABIs are now registered onchain during deploy.

---

## Version 2.1.1

Release date: Tue Aug 20 2024

### Patch changes

**[chore: upgrade zod to latest (#3020)](https://github.com/latticexyz/mud/commit/64354814ed325cefd1066282944408de7c40b4a7)** (@latticexyz/cli, @latticexyz/faucet, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/world-modules)

Upgrade `zod` to `3.23.8` to avoid issues with [excessively deep type instantiations](https://github.com/colinhacks/zod/issues/577).

**[chore: bump viem, abitype (#3038)](https://github.com/latticexyz/mud/commit/9e21e42c7e510cc595acddfbd3c9006f42fcf81e)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/config, @latticexyz/dev-tools, @latticexyz/faucet, @latticexyz/protocol-parser, @latticexyz/query, @latticexyz/schema-type, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world, create-mud)

Bumped viem to `2.19.8` and abitype to `1.0.5`.

MUD projects using viem or abitype should do the same to ensure no type errors due to mismatched versions:

```
pnpm recursive up viem@2.19.8 abitype@1.0.5
```

**[refactor(world): make AccessControl lib usable outside of world package (#3034)](https://github.com/latticexyz/mud/commit/6a66f572039ea9193b2c4882943ab3a94ed3f844)** (@latticexyz/world-module-metadata, @latticexyz/world-modules, @latticexyz/world)

Refactored `AccessControl` library exported from `@latticexyz/world` to be usable outside of the world package and updated module packages to use it.

**[feat(world,cli): add system deploy config (#3011)](https://github.com/latticexyz/mud/commit/86a810488f7ffb481534062c9c3ff170a1120982)** (@latticexyz/world)

Added `deploy` config options to systems in the MUD config:

- `disabled` to toggle deploying the system (defaults to `false`)
- `registerWorldFunctions` to toggle registering namespace-prefixed system functions on the world (defaults to `true`)

```ts
import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  systems: {
    HiddenSystem: {
      deploy: {
        registerWorldFunctions: false,
      },
    },
  },
});
```

**[feat(world-module-metadata): add metadata module (#3026)](https://github.com/latticexyz/mud/commit/fad4e85853d9ee80753ae1b0b161b60bf9874846)** (@latticexyz/cli, @latticexyz/world-module-metadata)

Added metadata module to be automatically installed during world deploy. This module allows for tagging any resource with arbitrary metadata. Internally, we'll use this to tag resources with labels onchain so that we can use labels to create a MUD project from an existing world.

**[refactor(common): simplify writeContract/sendTransaction actions (#3043)](https://github.com/latticexyz/mud/commit/2daaab13a9387e661475aef9bafb938fa12f5eb9)** (@latticexyz/common)

Refactored `writeContract` and `sendTransaction` actions for simplicity and better error messages.

**[fix(world): worldgen should read system source from root dir (#3027)](https://github.com/latticexyz/mud/commit/542ea540329fce74d85c74368e26386682e39cce)** (@latticexyz/world)

Fixed an issue with worldgen when using a different `rootDir` from the current working directory, where worldgen would read system source files from the wrong place.

**[feat(config,store,world): add namespaceLabel to table config (#3039)](https://github.com/latticexyz/mud/commit/57bf8c361999c7210622466dadcba037d4fe1238)** (@latticexyz/config, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world)

Add a strongly typed `namespaceLabel` to the table config output.
It corresponds to the `label` of the namespace the table belongs to and can't be set manually.

---

## Version 2.1.0

Release date: Mon Aug 05 2024

### Minor changes

**[docs: update resource labels changeset (#2985)](https://github.com/latticexyz/mud/commit/9145d0abc513b3f5976666f25f94c0c85d1be262)** (@latticexyz/config, @latticexyz/store, @latticexyz/world)

Tables and systems in config output now include a `label` property. Labels are now used throughout the codebase as a user-friendly way to reference the given resource: config keys, contract names, generated libraries, etc.

Inside `namespaces` config output, keys for tables and systems and their filenames will always correspond to their labels. This should make MUD tooling more intuitive and predictable. For backwards compatibility, `tables` config output still uses namespace-prefixed keys.

Labels replace the previous resource `name` usage, which is truncated to `bytes16` to be used as part of the resource ID and, in the future, may not always be human-readable.

These labels will soon be registered onchain so that developers can initialize a new MUD project from an existing world, generating config and interfaces with user-friendly names.

**[docs: update namespaces changeset (#2989)](https://github.com/latticexyz/mud/commit/1fe57dea0553ab89ea1ecca0d4fe0cc8281ca09d)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world)

MUD projects can now use multiple namespaces via a new top-level `namespaces` config option.

```ts
import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespaces: {
    game: {
      tables: {
        Player: { ... },
        Position: { ... },
      },
    },
    guilds: {
      tables: {
        Guild: { ... },
      },
      systems: {
        MembershipSystem: { ... },
        TreasurySystem: { ... },
      },
    },
  },
});
```

Once you use the top-level `namespaces` config option, your project will be in "multiple namespaces mode", which expects a source directory structure similar to the config structure: a top-level `namespaces` directory with nested namespace directories that correspond to each namespace label in the config.

```
~/guilds
├── mud.config.ts
└── src
    └── namespaces
        ├── game
        │   └── codegen
        │       └── tables
        │           ├── Player.sol
        │           └── Position.sol
        └── guilds
            ├── MembershipSystem.sol
            ├── TreasurySystem.sol
            └── codegen
                └── tables
                    └── Guild.sol
```

### Patch changes

**[fix(cli,store): don't deploy disabled tables (#2982)](https://github.com/latticexyz/mud/commit/24e285d5ae2d4f5791688d96ee7f8635551d3fb8)** (@latticexyz/store)

Disabled deploy of `Hooks` table, as this was meant to be a generic, codegen-only table.

**[refactor(store-sync): remove remaining refs to old config (#2938)](https://github.com/latticexyz/mud/commit/b62cf9fb061206a02a798403db0637e49fdabcfa)** (@latticexyz/store-sync)

Refactored package to use the new Store/World configs under the hood, removing compatibility layers and improving performance.

**[refactor(store-sync): remove remaining refs to old config (#2938)](https://github.com/latticexyz/mud/commit/b62cf9fb061206a02a798403db0637e49fdabcfa)** (@latticexyz/store-indexer)

Updated return values to match updated types in `@latticexyz/store-sync`.

**[refactor(world): update worldgen with namespaces output (#2974)](https://github.com/latticexyz/mud/commit/570086e7b4980639c0150a150eed1e09591e739a)** (@latticexyz/world)

Refactored worldgen in preparation for multiple namespaces.

**[chore(store-sync): simplify types (#2946)](https://github.com/latticexyz/mud/commit/f43f945eea9e948fa58550990b35c5dd2bc04678)** (@latticexyz/store-sync)

Adjusted `SyncToRecsOptions` type intersection to improve TypeScript performance.

**[refactor(cli): move off of old config (#2941)](https://github.com/latticexyz/mud/commit/3cbbc62c9ace1a5eb1a5cb832ff88f3d05c5722e)** (@latticexyz/cli)

Refactored package to use the new Store/World configs under the hood, removing compatibility layers.

Removed `--srcDir` option from all commands in favor of using `sourceDirectory` in the project's MUD config.

**[fix: preserve JsDoc on defineWorld output, bump @arktype/util (#2815)](https://github.com/latticexyz/mud/commit/7129a16057a7fcc7195015a916bdf74e0809f3a2)** (@latticexyz/config, @latticexyz/query, @latticexyz/store, @latticexyz/world)

Bumped `@arktype/util` and moved `evaluate`/`satisfy` usages to its `show`/`satisfy` helpers.

**[refactor(store-sync): use config namespaces for tables (#2963)](https://github.com/latticexyz/mud/commit/3440a86b56823d0d54cd2e11ea4b90acc0e40682)** (@latticexyz/store-sync)

Refactored `syncToRecs` and `syncToZustand` to use tables from config namespaces output. This is a precursor for supporting multiple namespaces.

Note for library authors: If you were using `createStorageAdapter` from `@latticexyz/store-sync/recs`, this helper no longer appends MUD's built-in tables from Store and World packages. This behavior was moved into `syncToRecs` for consistency with `syncToZustand` and makes `createStorageAdapter` less opinionated.

You can achieve the previous behavior with:

```diff
 import { createStorageAdapter } from "@latticexyz/store-sync/recs";
+import { mudTables } from "@latticexyz/store-sync";

 createStorageAdapter({
-  tables,
+  tables: { ...tables, ...mudTables },
   ...
 });
```

**[refactor(cli): move off of old config (#2941)](https://github.com/latticexyz/mud/commit/3cbbc62c9ace1a5eb1a5cb832ff88f3d05c5722e)** (@latticexyz/world)

Refactored how worldgen resolves systems from the config and filesystem.

**[fix(cli,store): don't deploy disabled tables (#2982)](https://github.com/latticexyz/mud/commit/24e285d5ae2d4f5791688d96ee7f8635551d3fb8)** (@latticexyz/cli)

`mud deploy` will now correctly skip tables configured with `deploy: { disabled: true }`.

**[refactor(cli): use config namespaces for tables (#2965)](https://github.com/latticexyz/mud/commit/2da9e48cd4bb8e3dafecf6c37799929b7bbbc39d)** (@latticexyz/cli)

Refactored CLI commands to use tables from config namespaces output. This is a precursor for supporting multiple namespaces.

**[fix: preserve JsDoc on defineWorld output, bump @arktype/util (#2815)](https://github.com/latticexyz/mud/commit/7129a16057a7fcc7195015a916bdf74e0809f3a2)** (@latticexyz/common)

Removed `evaluate` and `satisfy` type utils in favor of `show` and `satisfy` from `@arktype/util`.

**[refactor(cli): move off of old config (#2941)](https://github.com/latticexyz/mud/commit/3cbbc62c9ace1a5eb1a5cb832ff88f3d05c5722e)** (@latticexyz/world-modules)

Moved build scripts to `mud build` now that CLI doesn't depend on this package.

Removed generated world interfaces as this package isn't meant to be used as a "world", but as a set of individual modules.

**[refactor(store-sync): move syncToZustand to new config (#2936)](https://github.com/latticexyz/mud/commit/9e05278de6730517647ae33fd9d46f2687ea5f93)** (@latticexyz/dev-tools)

Updated Zustand components after changes to `syncToZustand`.

**[refactor(cli): remove last ethers usage (#2952)](https://github.com/latticexyz/mud/commit/609de113f35e0e2a0fe4c6dafd25a900c6cd2cfa)** (@latticexyz/cli)

Refactored `mud trace` command to use Viem instead of Ethers and removed Ethers dependencies from the package.

**[refactor(store): update tablegen with namespaces output (#2972)](https://github.com/latticexyz/mud/commit/69eb63b5939c30515a62da9afbdd71f89a67f8a2)** (@latticexyz/store)

Refactored tablegen in preparation for multiple namespaces and addressed a few edge cases:

- User types configured with a relative `filePath` are now resolved relative to the project root (where the `mud.config.ts` lives) rather than the current working directory.
- User types inside libraries now need to be referenced with their fully-qualified code path (e.g. `LibraryName.UserTypeName`).

**[chore: bump glob (#2922)](https://github.com/latticexyz/mud/commit/e49059f057575614071ad992cd4df387ba10ca33)** (@latticexyz/abi-ts, @latticexyz/cli, @latticexyz/world-modules, @latticexyz/world, create-mud)

Bumped `glob` dependency.

**[feat(common): throw instead of truncating namespace (#2917)](https://github.com/latticexyz/mud/commit/8d0453e7b52e23da4ebe4eef30db734dd33c06b9)** (@latticexyz/common)

`resourceToHex` will now throw if provided namespace is >14 characters. Since namespaces are used to determine access control, it's not safe to automatically truncate to fit into `bytes14` as that may change the indended namespace for resource access.

**[refactor(store,world): simplify table shorthands (#2969)](https://github.com/latticexyz/mud/commit/fb1cfef0c19e7b9b5bb3ea5ef8b581e8db892fb7)** (@latticexyz/store, @latticexyz/world)

Refactored how the config handles shorthand table definitions, greatly simplifying the codebase. This will make it easier to add support for multiple namespaces.

---

## Version 2.0.12

Release date: Fri May 31 2024

### Patch changes

**[feat(store,world): add option to codegen tables into namespace dirs (#2840)](https://github.com/latticexyz/mud/commit/c10c9fb2dacc93bc58d013e74509180f90ac5b5a)** (@latticexyz/store)

Internal `tablegen` function (exported from `@latticexyz/store/codegen`) now expects an object of options with a `configPath` to use as a base path to resolve other relative paths from.

**[feat(store,world): add option to codegen tables into namespace dirs (#2840)](https://github.com/latticexyz/mud/commit/c10c9fb2dacc93bc58d013e74509180f90ac5b5a)** (@latticexyz/store, @latticexyz/world)

Added `sourceDirectory` as a top-level config option for specifying contracts source (i.e. Solidity) directory relative to the MUD config. This is used to resolve other paths in the config, like codegen and user types. Like `foundry.toml`, this defaults to `src` and should be kept in sync with `foundry.toml`.

Also added a `codegen.namespaceDirectories` option to organize codegen output (table libraries, etc.) into directories by namespace. For example, a `Counter` table in the `app` namespace will have codegen at `codegen/app/tables/Counter.sol`. If not set, defaults to `true` when using top-level `namespaces` key, `false` otherwise.

**[fix(cli,world): resolve table by just name (#2850)](https://github.com/latticexyz/mud/commit/9be2bb863194e2beee03b3d783f925c79b3c8562)** (@latticexyz/cli, @latticexyz/world)

Fixed `resolveTableId` usage within config's module `args` to allow referencing both namespaced tables (e.g. `resolveTableId("app_Tasks")`) as well as tables by just their name (e.g. `resolveTableId("Tasks")`). Note that using just the table name requires it to be unique among all tables within the config.

This helper is now exported from `@latticexyz/world` package as intended. The previous, deprecated export has been removed.

```diff
-import { resolveTableId } from "@latticexyz/config/library";
+import { resolveTableId } from "@latticexyz/world/internal";
```

**[fix(world-modules): register total supply table in erc20 module (#2877)](https://github.com/latticexyz/mud/commit/36c8b5b2476281ef9f66347c798aa93454648572)** (@latticexyz/world-modules)

Fixed `ERC20Module` to register the `TotalSupply` table when creating a new token.

If you've deployed a world with the `ERC20Module`, we recommend patching your world to register this table so that indexers can properly decode its record. You can do so with a simple Forge script:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { TotalSupply } from "@latticexyz/world-modules/src/modules/erc20-puppet/tables/TotalSupply.sol";
import { _totalSupplyTableId } from "@latticexyz/world-modules/src/modules/erc20-puppet/utils.sol";

contract RegisterTotalSupply is Script {
  function run(address worldAddress, string memory namespaceString) external {
    bytes14 namespace = bytes14(bytes(namespaceString));

    StoreSwitch.setStoreAddress(worldAddress);

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    TotalSupply.register(_totalSupplyTableId(namespace));

    vm.stopBroadcast();
  }
}
```

Then execute the transactions by running the following [`forge script`](https://book.getfoundry.sh/reference/forge/forge-script?highlight=script#forge-script) command:

```shell
forge script ./script/RegisterTotalSupply.s.sol --sig "run(address,string)" $WORLD_ADDRESS $NAMESPACE_STRING
```

**[feat(common): export base tsconfig (#2873)](https://github.com/latticexyz/mud/commit/f3180fe8437224d7a568f79ff60c9e70e9b48792)** (@latticexyz/abi-ts, @latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/config, @latticexyz/dev-tools, @latticexyz/faucet, @latticexyz/gas-report, @latticexyz/protocol-parser, @latticexyz/query, @latticexyz/react, @latticexyz/recs, @latticexyz/schema-type, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, @latticexyz/utils, @latticexyz/world-modules, @latticexyz/world, create-mud, solhint-config-mud, solhint-plugin-mud)

TS source has been removed from published packages in favor of DTS in an effort to improve TS performance. All packages now inherit from a base TS config in `@latticexyz/common` to allow us to continue iterating on TS performance without requiring changes in your project code.

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

**[feat(create-mud): clean up template scripts, add garnet/redstone (#2839)](https://github.com/latticexyz/mud/commit/d75266073e9fa1c5ede61636a60557deead6ff8e)** (create-mud)

Removed unnecessary build step in scripts and added deploy scripts for Redstone and Garnet chains.

---

## Version 2.0.11

Release date: Wed May 15 2024

### Patch changes

**[build: bump to node 18.20.2, pnpm 9.1.1 (#2831)](https://github.com/latticexyz/mud/commit/63e5d2d51192adc0a1f977a269097a03d7bf119d)** (create-mud)

Added pnpm 9 to project's `engines`.

**[fix(cli): fixed module artifactPath imports (#2832)](https://github.com/latticexyz/mud/commit/fe9d726371ddfd99f0b4ffa4b1e64b817417cfd3)** (@latticexyz/cli)

Fixed imports of module artifacts via `artifactPath` and removed unused `@latticexyz/world-modules` dependency.

---

## Version 2.0.10

Release date: Tue May 14 2024

### Patch changes

**[fix(cli): function selector lookup during deploy (#2800)](https://github.com/latticexyz/mud/commit/0ae9189ca60e86f7b12994bcc89bc196871d0e7c)** (@latticexyz/cli)

The deploy CLI now uses logs to find registered function selectors and their corresponding function signatures.
Previously only function signatures were fetched via logs and then mapped to function selectors via `getRecord` calls,
but this approach failed for namespaced function selectors of non-root system,
because the function signature table includes both the namespaced and non-namespaced signature but the function selector table only includes the namespaced selector that is registered on the world.

**[feat(cli): deploy with external modules (#2803)](https://github.com/latticexyz/mud/commit/a1b1ebf67367f91cea4000c073bc6b8da4601e3e)** (@latticexyz/cli, @latticexyz/world)

Worlds can now be deployed with external modules, defined by a module's `artifactPath` in your MUD config, resolved with Node's module resolution. This allows for modules to be published to and imported from npm.

```diff
 defineWorld({
   // …
   modules: [
     {
-      name: "KeysWithValueModule",
+      artifactPath: "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.json",
       root: true,
       args: [resolveTableId("Inventory")],
     },
   ],
 });
```

Note that the above assumes `@latticexyz/world-modules` is included as a dependency of your project.

**[chore: upgrade to ejs 3.1.10 (#2786)](https://github.com/latticexyz/mud/commit/4e4e9104e84a7cb7d041d2401f0a937e06251985)** (@latticexyz/world-modules, @latticexyz/store, @latticexyz/cli)

Removed the unused `ejs` dependency.

**[docs: fix create-mud package name in changeset (#2825)](https://github.com/latticexyz/mud/commit/de03e2a78e209c7eb509f986aa0ed0d1c2ae068d)** (create-mud)

Templates now use an `app` namespace by default, instead of the root namespace. This helps keep the root namespace clear for intentionally root-level things and avoids pitfalls with root systems calling other root systems.

**[chore: upgrade to ejs 3.1.10 (#2786)](https://github.com/latticexyz/mud/commit/4e4e9104e84a7cb7d041d2401f0a937e06251985)** (@latticexyz/world)

Upgraded the `ejs` dependency to 3.1.10.

**[fix(store-indexer): fix distance from follow block metric (#2791)](https://github.com/latticexyz/mud/commit/0d4e302f44c2ee52e9e14d24552499b7fb04306e)** (@latticexyz/store-indexer)

Fixed the `distance_from_follow_block` gauge to be a positive number if the latest processed block is lagging behind the latest remote block.

**[fix(common): extend OP contracts, add redstone ones (#2792)](https://github.com/latticexyz/mud/commit/51b137d3498a5d6235938cb93dc06ed0131fd7be)** (@latticexyz/common)

Added OP predeploy contracts for Redstone and Garnet chain configs and added chain-specific contracts for Redstone chain config.

**[chore: remove cli faucet command and services package (#2811)](https://github.com/latticexyz/mud/commit/4a61a128ca752aac5d86578573211304fbaf3c27)** (@latticexyz/cli)

Removed broken `mud faucet` command.

**[fix(world): config uses readonly arrays (#2805)](https://github.com/latticexyz/mud/commit/3dbf3bf3a3295ad63264044e315dec075de528fd)** (@latticexyz/world)

Updated World config types to use readonly arrays.

**[docs(store-sync): add changeset for #2808 (#2809)](https://github.com/latticexyz/mud/commit/36e1f7664f9234bf454e6d1f9c3806dfc695f219)** (@latticexyz/store-sync)

Both `encodeEntity` and `decodeEntity` now use an LRU cache to avoid repeating work during iterations of thousands of entities.

**[fix(store,world): throw on unexpected config keys (#2797)](https://github.com/latticexyz/mud/commit/32c1cda666bc8ccd6e083d8d94d96a42e65c3983)** (@latticexyz/store, @latticexyz/world)

`defineStore` and `defineWorld` will now throw a type error if an unexpected config option is used.

**[chore: remove cli faucet command and services package (#2811)](https://github.com/latticexyz/mud/commit/4a61a128ca752aac5d86578573211304fbaf3c27)** (create-mud)

Removed usages of old testnet faucet in templates. The previous testnet faucet is broken, deprecated, and going offline soon. We'll be replacing the burner account pattern with something better very soon!

**[chore: bump zod (#2804)](https://github.com/latticexyz/mud/commit/4caca05e34fd3647122bf2864f2c736e646614b6)** (@latticexyz/cli, @latticexyz/config, @latticexyz/faucet, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world-modules, @latticexyz/world)

Bumped zod dependency to comply with abitype peer dependencies.

**[feat(store,world): usable enum values from config (#2807)](https://github.com/latticexyz/mud/commit/27f888c70a712cea7f9a157cc82892a884ecc1df)** (@latticexyz/store, @latticexyz/world)

`defineStore` and `defineWorld` now maps your `enums` to usable, strongly-typed enums on `enumValues`.

```ts
const config = defineStore({
  enums: {
    TerrainType: ["Water", "Grass", "Sand"],
  },
});

config.enumValues.TerrainType.Water;
//                              ^? (property) Water: 0

config.enumValues.TerrainType.Grass;
//                              ^? (property) Grass: 1
```

This allows for easier referencing of enum values (i.e. `uint8` equivalent) in contract calls.

```ts
writeContract({
  // …
  functionName: "setTerrainType",
  args: [config.enumValues.TerrainType.Grass],
});
```

---

## Version 2.0.9

Release date: Wed May 01 2024

### Patch changes

**[fix(cli): do not require `PRIVATE_KEY` if using KMS (#2765)](https://github.com/latticexyz/mud/commit/30318687f35a57217e932f9f2b4c80a9d6617ee5)** (@latticexyz/cli)

Fixed `mud deploy` to not require the `PRIVATE_KEY` environment variable when using a KMS signer.

**[feat(create-mud): redstone and garnet chains (#2776)](https://github.com/latticexyz/mud/commit/6b247fb9d1902a5138ad4a05b634b4d0921af433)** (create-mud)

Updated templates with Redstone and Garnet chains and removed the deprecated Lattice testnet chain.

**[feat(store-indexer): add metric for distance from block tag to follow (#2763)](https://github.com/latticexyz/mud/commit/93690fdb1d51f8ef470fd4f1d84490c14bf1f442)** (@latticexyz/store-indexer)

Added a `distance_from_follow_block` metric to compare the latest stored block number with the block number corresponding to the block tag the indexer follows.

**[feat(cli): blockscout is default verifier (#2775)](https://github.com/latticexyz/mud/commit/0b6b70ffd2f8e7eaa9732d2aa5b158fd0927d10b)** (@latticexyz/cli)

`mud verify` now defaults to blockscout if no `--verifier` is provided.

**[fix(cli): run postdeploy with aws flag when kms is enabled (#2766)](https://github.com/latticexyz/mud/commit/428ff972198425cb19d363c92eb49002accdc6a0)** (@latticexyz/cli)

Fixed `mud deploy` to use the `forge script --aws` flag when executing `PostDeploy` with a KMS signer.

Note that you may need to update your `PostDeploy.s.sol` script, with `vm.startBroadcast` receiving no arguments instead of reading a private key from the environment:

```diff
-uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
-vm.startBroadcast(deployerPrivateKey);

+vm.startBroadcast();
```

**[feat(common): add indexer URL to chain configs (#2771)](https://github.com/latticexyz/mud/commit/764ca0a0c390ddce5d8a618fd4e801e9fc542a0b)** (@latticexyz/store-sync)

Updated `createStoreSync` to default to the chain's indexer URL when no `indexerUrl` is passed in. To intentionally unset the value and not use the indexer at all, `indexerUrl` can now also be `false`.

**[fix(cli): remove postdeploy gas setting in favor of script options (#2756)](https://github.com/latticexyz/mud/commit/074ed66eb64df377e37684c47d7ff15ced16885b)** (@latticexyz/cli)

Removed manual gas setting in PostDeploy step of `mud deploy` in favor of `forge script` fetching it from the RPC.

If you still want to manually set gas, you can use `mud deploy --forgeScriptOptions="--with-gas-price 1000000"`.

**[refactor(common,cli): kms deployer gets keyId from environment (#2760)](https://github.com/latticexyz/mud/commit/e03830ebe3ee3ea6fb1384be53fc26b668fbe607)** (@latticexyz/cli)

The key ID for deploying via KMS signer is now set via an `AWS_KMS_KEY_ID` environment variable to better align with Foundry tooling. To enable KMS signing with this environment variable, use the `--kms` flag.

```diff
-mud deploy --awsKmsKeyId [key ID]
+AWS_KMS_KEY_ID=[key ID] mud deploy --kms
```

**[feat(common): add indexer URL to chain configs (#2771)](https://github.com/latticexyz/mud/commit/764ca0a0c390ddce5d8a618fd4e801e9fc542a0b)** (@latticexyz/common)

Added an optional `indexerUrl` property to `MUDChain`, and populated it in the Redstone and Garnet chain configs.

**[feat(common): add chain icons (#2778)](https://github.com/latticexyz/mud/commit/bad3ad1bd9bb86bc7eb83cfb299df92d14c64c46)** (@latticexyz/common)

Added chain icons to Redstone and Garnet chain configs via `chain.iconUrls`.

---

## Version 2.0.8

Release date: Sat Apr 27 2024

### Patch changes

**[fix(store-indexer): allow empty env variable (#2746)](https://github.com/latticexyz/mud/commit/9c599b87bb02db5ae9a9389085b61bde48af9e4a)** (@latticexyz/store-indexer)

Added support for an empty `STORE_ADDRESS=` environment variable.
This previously would fail the input validation, now it behaves the same way as not setting the `STORE_ADDRESS` variable at all.

**[fix(cli): fix verify with sourcify for dependencies (#2750)](https://github.com/latticexyz/mud/commit/b4eb795ee5a6f8d250d3b3513fe72c5530f69c43)** (@latticexyz/cli)

Patched `mud verify` to properly verify store, world, and world-modules contracts. Currently only `sourcify` is fully supported and is the default verifier.

**[feat(common): add redstone chain config (#2749)](https://github.com/latticexyz/mud/commit/f23318ede18d0b10cf1f4c51dd24a373a5e5f740)** (@latticexyz/common)

Added Garnet testnet and Redstone mainnet chain configs and deprecated Lattice Testnet.

```ts
import { garnet, redstone } from "@latticexyz/common/chains";
```

---

## Version 2.0.7

Release date: Thu Apr 25 2024

### Patch changes

**[feat(store-indexer): add prometheus metrics (#2739)](https://github.com/latticexyz/mud/commit/27c4fdee6e04d6d61bef320673bed22b2872b51c)** (@latticexyz/store-indexer)

Add Prometheus metrics at `/metrics` to the Postgres indexer backend and frontend, as well as the SQLite indexer.

**[fix(common): use feeRef for sendTransaction calls (#2725)](https://github.com/latticexyz/mud/commit/375d902ed02541fa5add7012465e05da079d4d95)** (@latticexyz/common)

Added asynchronous polling for current fees to `sendTransaction`.

**[fix(block-logs-stream): handle proxyd errors (#2726)](https://github.com/latticexyz/mud/commit/bf16e729fea1830659b81a6a0ea5fccb6429ea42)** (@latticexyz/block-logs-stream)

Added detection and handling for proxyd rate limit and block range errors.

**[feat(cli): deploy with kms (#2704)](https://github.com/latticexyz/mud/commit/c74a66474169d16a2ed4b7fd9046984d4ceabc3f)** (@latticexyz/cli)

Added a `--awsKmsKeyId` flag to `mud deploy` that deploys the world using an AWS KMS key as a transaction signer.

**[fix(store-sync): await fetchAndStoreLogs (#2702)](https://github.com/latticexyz/mud/commit/16695fea8a0a8d80179c3fbe68120b34de076659)** (@latticexyz/store-sync)

Partially revert [#2665](https://github.com/latticexyz/mud/pull/2665) to guarantee logs are stored in order.

**[fix(cli): add retry to getLogs when getting resource ID's (#2709)](https://github.com/latticexyz/mud/commit/dbc7e066d0bd344a5d9b2586c7f2875d21cfd0ca)** (@latticexyz/cli)

Deploying now retries on "block is out of range" errors, for cases where the RPC is load balanced and out of sync.

**[feat(cli): manually fetch gas price from rpc before PostDeploy runs (#2638)](https://github.com/latticexyz/mud/commit/189050bd2c61ba645325d45a6a4040153d361412)** (@latticexyz/cli)

Deploy will now fetch and set the gas price during execution of PostDeploy script. This should greatly reduce the fees paid for L2s.

**[fix(world-modules): properly concat baseURI and tokenURI in ERC721 module (#2686)](https://github.com/latticexyz/mud/commit/78a94d715af427b77f52a7e2ff4be2cb3752e2a9)** (@latticexyz/world-modules)

Fixed ERC721 module to properly encode token ID as part of token URI.

**[feat(cli): verify command (#2662)](https://github.com/latticexyz/mud/commit/fce741b07dd68f4a0a553bee5d63f1d6b0546283)** (@latticexyz/cli)

Added a new `mud verify` command which verifies all contracts in a project. This includes systems, modules, the WorldFactory and World.

**[fix(common): kms correctly serializes transactions (#2721)](https://github.com/latticexyz/mud/commit/182d70608fce514ae1aec5366a7bbae1dc936844)** (@latticexyz/common)

Added `kmsKeyToAccount`, a [viem custom account](https://viem.sh/docs/accounts/custom#custom-account) that signs transactions using AWS KMS.

To use it, you must first install `@aws-sdk/client-kms@3.x` and `asn1.js@5.x` dependencies into your project. Then create a KMS account with:

```ts
import { kmsKeyToAccount } from "@latticexyz/common/kms";
const account = kmsKeyToAccount({ keyId: ... });
```

By default, a `KMSClient` will be created, but you can also pass one in via the `client` option. The default KMS client will use [your environment's AWS SDK configuration](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/configuring-the-jssdk.html).

**[fix(cli): fix deployer warning (#2683)](https://github.com/latticexyz/mud/commit/632a7525ab2f125ed01a612987ece58cb1fd9740)** (@latticexyz/cli)

Fixed an issue where deploys were warning about mismatched bytecode when the bytecode was correct and what we expect.

**[fix(create-mud): make worlds.json address type more specific (#2685)](https://github.com/latticexyz/mud/commit/534e7729a7e727575bb7db99c4acda55e8ceb295)** (create-mud)

Made `worlds.json`'s `address` type more like viem's `Hex` type so it's easy to pass through as an argument.

**[refactor(world,cli): rename `useProxy` to `upgradeableWorldImplementation` (#2732)](https://github.com/latticexyz/mud/commit/1ccd627676cb94a07e29e511db037a5f855c3096)** (@latticexyz/world, @latticexyz/cli)

Added a `deploy.upgradeableWorldImplementation` option to the MUD config that deploys the World as an upgradeable proxy contract. The proxy behaves like a regular World contract, but the underlying implementation can be upgraded by calling `setImplementation`.

**[fix(store): enforce unique table names across types (#2736)](https://github.com/latticexyz/mud/commit/ed404b7d840db755f7513d4a7d32b85eaa3dd058)** (@latticexyz/store)

Added a check to `registerTable` that prevents registering both an offchain and onchain table with the same name, making it easier to use human-readable names in indexers.

**[feat(world-modules): string systemId in `callWithSignature` typehash (#2700)](https://github.com/latticexyz/mud/commit/2c9b16c77aca12e4c23e96de83e5820c09cb3b9d)** (@latticexyz/world-modules, @latticexyz/world)

Replaced the `systemId` field in the `Unstable_CallWithSignatureSystem` typehash with individual `systemNamespace` and `systemName` string fields.

**[feat(cli): add user-specified PostDeploy forge options (#2703)](https://github.com/latticexyz/mud/commit/8493f88f8db972ef2a7c1caa49f8231c60ed2ba5)** (@latticexyz/cli)

Added a `--forgeScriptOptions` flag to deploy and dev commands to allow passing in additional CLI flags to `forge script` command.

**[fix(common): make `Resource` type props readonly (#2516)](https://github.com/latticexyz/mud/commit/f736c43dbc39edff51957a298b563576237429df)** (@latticexyz/common)

`Resource` type props are now readonly.

---

## Version 2.0.6

Release date: Wed Apr 17 2024

### Patch changes

**[feat(store-indexer): add cache headers (#2669)](https://github.com/latticexyz/mud/commit/36354994f702f22c569e52524ea4a3f523050c5a)** (@latticexyz/store-indexer)

Added `Cache-Control` and `Content-Type` headers to the postgres indexer API.

**[fix(common): latency improvements (#2641)](https://github.com/latticexyz/mud/commit/6c8ab471adfb522e841b679072c7ff53fe105034)** (@latticexyz/common)

Reduced the number of RPC requests before sending a transaction in the `transactionQueue` viem decorator.

**[fix(store,world): fix StoreRead.getDynamicFieldLength (#2680)](https://github.com/latticexyz/mud/commit/103db6ced9815b61e1b40348f814958f240f66fc)** (@latticexyz/store)

Patched `StoreRead.getDynamicFieldLength` to properly read `StoreCore.getDynamicFieldLength`.

Previously `StoreRead.getDynamicFieldLength` incorrectly read from `StoreCore.getFieldLength`, which expected a `fieldIndex` instead of a `dynamicFieldIndex`, and thereby returned an invalid result if the table had both static and dynamic fields (in which case `fieldIndex` != `dynamicFieldIndex`). `StoreRead` is used for external reads from the `Store`/`World` contract, so this bug only materialized in external table reads (ie from `Systems` outside the root namespace) of the dynamic length of a field in a table with both static and dynamic fields.

**[feat(world-modules): callWithSignature chain id is salt (#2648)](https://github.com/latticexyz/mud/commit/96e82b7f11ef30a331941c202fe09591d348cb41)** (@latticexyz/world-modules)

Moved the chain ID in `CallWithSignature` from the `domain.chainId` to the `domain.salt` field to allow for cross-chain signing without requiring wallets to switch networks. The value of this field should be the chain on which the world lives, rather than the chain the wallet is connected to.

**[refactor(store,world): refactor types, remove redundant casts (#2555)](https://github.com/latticexyz/mud/commit/9720b568cd302c597fd0030e59eceab2bb833e39)** (@latticexyz/store, @latticexyz/world)

Internal type improvements.

**[chore: bump viem to 2.9.20 (#2681)](https://github.com/latticexyz/mud/commit/c18e93c5e1fb6987f31369f2e81f26ea2ac196d8)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/config, @latticexyz/dev-tools, @latticexyz/faucet, @latticexyz/protocol-parser, @latticexyz/query, @latticexyz/schema-type, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world, create-mud)

Bumped viem to 2.9.20.

**[docs: add changeset for #2645 (#2647)](https://github.com/latticexyz/mud/commit/d95028a6d1233557ee605f4691f0d47ced47a681)** (create-mud, @latticexyz/block-logs-stream, @latticexyz/protocol-parser, @latticexyz/store-indexer, @latticexyz/schema-type, @latticexyz/store-sync, @latticexyz/dev-tools, @latticexyz/common, @latticexyz/config, @latticexyz/faucet, @latticexyz/query, @latticexyz/store, @latticexyz/world, @latticexyz/cli)

Bumped viem to 2.9.16.

**[docs: add changeset for devtools top up (#2658)](https://github.com/latticexyz/mud/commit/77d3b30942e8593b4aeb5d7921494ca0d627786b)** (@latticexyz/dev-tools)

Added a "top up" button to account balance when running on anvil.

**[fix(store-sync): reduce latency in waitForTransaction (#2665)](https://github.com/latticexyz/mud/commit/de3bc3d1fe78762e43b692f6f3334dee9b632c8f)** (@latticexyz/store-sync)

Small optimizations in `waitForTransaction` to parallelize network requests.

**[feat(store-sync): add status and block number to return type of waitForTransaction (#2668)](https://github.com/latticexyz/mud/commit/8c3dcf77c2481b11622a0603c8a09a5b1fb5f787)** (@latticexyz/store-sync)

`waitForTransaction` now returns a `Promise<{ blockNumber: bigint, status: "success" | "reverted" }>` instead of `Promise<void>`, to allow consumers to react to reverted transactions without refetching the transaction receipt.

---

## Version 2.0.5

Release date: Fri Apr 12 2024

### Patch changes

**[fix(world-modules): add missing interfaces (#2605)](https://github.com/latticexyz/mud/commit/e2e8ec8b3e7152337cb81a5d54c9bb36486c462e)** (@latticexyz/world-modules)

Added missing system interfaces for ERC721, UniqueEntity, and CallWithSignature modules.

**[fix(common): pass through rest of nonce manager opts (#2616)](https://github.com/latticexyz/mud/commit/a9e8a407b5d6f356d7d0a1c1f093de926ffb072f)** (@latticexyz/common)

Fixed `getNonceManager` to correctly pass all options to `createNonceManager`.

**[feat(world-modules): add `validateCallWithSignature` to `Unstable_CallWithSignatureModule` (#2614)](https://github.com/latticexyz/mud/commit/081c396790a0b68d85ef7735f0e7e643b99721c3)** (@latticexyz/world-modules)

Added `validateCallWithSignature` function to `Unstable_CallWithSignatureModule` to validate a signature without executing the call.

**[fix(world-modules): explicitly export mud config (#2598)](https://github.com/latticexyz/mud/commit/e3c3a118e60e8c4de6b16c521d2d78b0b9f670c2)** (@latticexyz/world-modules)

Exported mud config as internal.

**[feat(create-mud): change `anvil` to create a block every two seconds (#2635)](https://github.com/latticexyz/mud/commit/aa6ecf7b1157a61c21e0bb15c060eb2fc5936e12)** (create-mud)

Updated `anvil` args with two second block time to better reflect L2s

**[fix(store): return zero for uninitialised static array elements (#2613)](https://github.com/latticexyz/mud/commit/b798ccb2b19bdda2995f188912258c7563747e42)** (@latticexyz/store)

Fixed the behaviour of static arrays, so that they return zero for uninitialised values, to mirror the native Solidity behavior. Previously they reverted with `Store_IndexOutOfBounds` if the index had not been set yet.

**[chore: changeset for `callWithSignature` (#2601)](https://github.com/latticexyz/mud/commit/d02efd80292db1c671fca5261560fdf525871475)** (@latticexyz/cli, @latticexyz/world-modules, @latticexyz/world)

Replaced the `Unstable_DelegationWithSignatureModule` preview module with a more generalized `Unstable_CallWithSignatureModule` that allows making arbitrary calls (similar to `callFrom`).

This module is still marked as `Unstable`, because it will be removed and included in the default `World` deployment once it is audited.

---

## Version 2.0.4

Release date: Tue Apr 02 2024

### Patch changes

**[feat(common): allow specifying concurrency in transactionQueue (#2589)](https://github.com/latticexyz/mud/commit/620e4ec13ca73ceecefc257ef8a8eadb2bdf6aa4)** (@latticexyz/common)

`transactionQueue` now accepts a `queueConcurrency` to allow adjusting the number of concurrent calls to the mempool. This defaults to `1` to ensure transactions are ordered and nonces are handled properly. Any number greater than that is likely to see nonce errors and transactions arriving out of order, but this may be an acceptable trade-off for some applications that can safely retry.

---

## Version 2.0.3

Release date: Tue Apr 02 2024

### Patch changes

**[feat(common,world): improvements for smart accounts (#2578)](https://github.com/latticexyz/mud/commit/d2e4d0fbbc011e64e593b0dd784cb8f2d0da7522)** (@latticexyz/common)

`transactionQueue` decorator now accepts an optional `publicClient` argument, which will be used in place of the extended viem client for making public action calls (`getChainId`, `getTransactionCount`, `simulateContract`, `call`). This helps in cases where the extended viem client is a smart account client, like in [permissionless.js](https://github.com/pimlicolabs/permissionless.js), where the transport is the bundler, not an RPC.

`writeObserver` decorator now accepts any `Client`, not just a `WalletClient`.

`createBurnerAccount` now returns a `PrivateKeyAccount`, the more specific `Account` type.

**[feat(common,world): improvements for smart accounts (#2578)](https://github.com/latticexyz/mud/commit/d2e4d0fbbc011e64e593b0dd784cb8f2d0da7522)** (@latticexyz/world)

`callFrom` decorator now accepts any `Client`, not just a `WalletClient`. It also no longer attempts to wrap/redirect calls to `call`, `callFrom`, and `registerDelegationWithSignature`.

---

## Version 2.0.2

Release date: Mon Apr 01 2024

### Patch changes

**[feat(world-modules): register delegation with signature (#2480)](https://github.com/latticexyz/mud/commit/e86bd14db092331454a604183be5f5739563f449)** (@latticexyz/cli, @latticexyz/world-modules, @latticexyz/world)

Added a new preview module, `Unstable_DelegationWithSignatureModule`, which allows registering delegations with a signature.

Note: this module is marked as `Unstable`, because it will be removed and included in the default `World` deployment once it is audited.

**[chore: threejs template changeset (#2529)](https://github.com/latticexyz/mud/commit/a1101f785719f6b61449db62e265bf0f90665ccb)** (create-mud)

Changed the controls in the `threejs` template from arrow keys to WASD and added text to explain what the app does.

**[docs: clarify `callFrom` changelog (#2579)](https://github.com/latticexyz/mud/commit/090a099bf4891dfa3cd95f88b68dcfd5ea14bdea)** (@latticexyz/world)

Added a viem client decorator for account delegation. By extending viem clients with this function after delegation, the delegation is automatically applied to World contract writes. This means that these writes are made on behalf of the delegator. Internally, it transforms the write arguments to use `callFrom`.

This is an internal feature and is not ready for stable consumption yet, so it's not yet exported. Its API may change.

When using with a viem public client, system function selectors will be fetched from the world:

```ts
walletClient.extend(
  callFrom({
    worldAddress,
    delegatorAddress,
    publicClient,
  }),
);
```

Alternatively, a `worldFunctionToSystemFunction` handler can be passed in that will translate between world function selectors and system function selectors for cases where you want to provide your own behavior or use data already cached in e.g. Zustand or RECS.

```ts
walletClient.extend(
  callFrom({
    worldAddress,
    delegatorAddress,
    worldFunctionToSystemFunction: async (worldFunctionSelector) => {
      const systemFunction = useStore.getState().getValue(tables.FunctionSelectors, { worldFunctionSelector })!;
      return {
        systemId: systemFunction.systemId,
        systemFunctionSelector: systemFunction.systemFunctionSelector,
      };
    },
  }),
);
```

**[refactor(cli): remove forge cache workaround (#2576)](https://github.com/latticexyz/mud/commit/3b845d6b23b950e30310886407de11bb33fd028c)** (@latticexyz/cli)

Remove workaround for generating `IWorld` interface from cached forge files as this was fixed by forge.

**[fix(create-mud): run anvil in its own process (#2538)](https://github.com/latticexyz/mud/commit/9e239765e6dd253819a7aa77a87caa528be549db)** (create-mud)

Templates now run anvil in its own process (via mprocs) for better visibility into anvil logs.

---

## Version 2.0.1

Release date: Thu Mar 21 2024

### Patch changes

**[fix(store,world): minor config validation fixes (#2517)](https://github.com/latticexyz/mud/commit/4a6b45985c5da66145078dc92884f65403ecd697)** (@latticexyz/store, @latticexyz/world)

Minor fixes to config input validations:

- `systems.openAccess` incorrectly expected `true` as the only valid input. It now allows `boolean`.
- The config complained if parts of it were defined `as const` outside the config input. This is now possible.
- Shorthand inputs are now enabled.

---

## Version 2.0.0

Release date: Thu Mar 21 2024

---

## Version 2.0.0-next.18

Release date: Thu Mar 21 2024

### Major changes

**[docs: add store/world config changesets (#2497)](https://github.com/latticexyz/mud/commit/c9ee5e4a28e9eea6aefd4e5a535a60760d24f7cd)** (@latticexyz/store, @latticexyz/world)

Store and World configs have been rebuilt with strong types. The shape of these configs have also changed slightly for clarity, the biggest change of which is merging of `keySchema` and `valueSchema` into a single `schema` with a separate `key` for a table's primary key.

To migrate, first update the imported config method:

```diff filename="mud.config.ts"
-import { mudConfig } from "@latticexyz/world/register";
+import { defineWorld } from "@latticexyz/world";

-export default mudConfig({
+export default defineWorld({
```

_Note that if you are only using Store, you will need to import `defineStore` from `@latticexyz/store`._

Then migrate the table key by renaming `keySchema` to `schema` and define the table `key` with each field name from your key schema:

```diff filename="mud.config.ts"
 export default defineWorld({
   tables: {
     Position: {
-      keySchema: {
+      schema: {
         player: "address",
       },
       valueSchema: {
         x: "int32",
         y: "int32",
       },
+      key: ['player'],
     },
   },
 });
```

Now we can merge the `valueSchema` into `schema`.

```diff filename="mud.config.ts"
 export default defineWorld({
   tables: {
     Position: {
       schema: {
         player: "address",
-      },
-      valueSchema: {
         x: "int32",
         y: "int32",
       },
       key: ['player'],
     },
   },
 });
```

If you previously used the table config shorthand without the full `keySchema` and `valueSchema`, some of the defaults have changed. Shorthands now use an `id: "bytes32"` field by default rather than `key: "bytes32"` and corresponding `key: ["id"]`. To keep previous behavior, you may have to manually define your `schema` with the previous `key` and `value` fields.

```diff filename="mud.config.ts"
 export default defineWorld({
   tables: {
-    OwnedBy: "address",
+    OwnedBy: {
+      schema: {
+        key: "bytes32",
+        value: "address",
+      },
+      key: ["key"],
+    },
   },
 });
```

Singleton tables are defined similarly, where an empty `key` rather than `keySchema` is provided:

```diff filename="mud.config.ts"
-keySchema: {}
+key: []
```

Offchain tables are now defined as a table `type` instead an `offchainOnly` boolean:

```diff filename="mud.config.ts"
-offchainOnly: true
+type: 'offchainTable'
```

All codegen options have moved under `codegen`:

```diff filename="mud.config.ts"
 export default defineWorld({
-  codegenDirectory: "…",
+  codegen: {
+    outputDirectory: "…",
+  },
   tables: {
     Position: {
       schema: {
         player: "address",
         x: "int32",
         y: "int32",
       },
       key: ['player'],
-      directory: "…",
-      dataStruct: false,
+      codegen: {
+        outputDirectory: "…",
+        dataStruct: false,
+      },
     },
   },
 });
```

**[refactor: move table ID and field layout constants into table library (#2327)](https://github.com/latticexyz/mud/commit/44236041fb792fc676481d9d30b5846752ed0491)** (create-mud, @latticexyz/cli, @latticexyz/common, @latticexyz/store, @latticexyz/world, @latticexyz/world-modules)

Moved table ID and field layout constants in code-generated table libraries from the file level into the library, for clearer access and cleaner imports.

```diff
-import { SomeTable, SomeTableTableId } from "./codegen/tables/SomeTable.sol";
+import { SomeTable } from "./codegen/tables/SomeTable.sol";

-console.log(SomeTableTableId);
+console.log(SomeTable._tableId);

-console.log(SomeTable.getFieldLayout());
+console.log(SomeTable._fieldLayout);
```

**[feat(store,world): set protocol version, add tests (#2412)](https://github.com/latticexyz/mud/commit/9aa5e7865bc8f6f090f599ac1367bc927aaee2e4)** (@latticexyz/store, @latticexyz/world)

Set the protocol version to `2.0.0` for each Store and World.

**[refactor(schema-type,protocol-parser): explicit internal vs external exports (#2452)](https://github.com/latticexyz/mud/commit/b38c096d88340080ec02277bc772c1269b6b65fd)** (@latticexyz/protocol-parser, @latticexyz/schema-type)

Moved all existing exports to a `/internal` import path to indicate that these are now internal-only and deprecated. We'll be replacing these types and functions with new ones that are compatible with our new, strongly-typed config.

**[feat(store): add field index to Store_SpliceDynamicData event (#2279)](https://github.com/latticexyz/mud/commit/8193136a9511d066aeebce82155d3509aa760282)** (@latticexyz/store, @latticexyz/store-sync)

Added `dynamicFieldIndex` to the `Store_SpliceDynamicData` event. This enables indexers to store dynamic data as a blob per dynamic field without a schema lookup.

**[refactor: rename PackedCounter to EncodedLengths (#2490)](https://github.com/latticexyz/mud/commit/3e7d83d01b9e027df9ef76068ab2e4ddf5c71d4b)** (@latticexyz/cli, @latticexyz/protocol-parser, @latticexyz/store, @latticexyz/world-modules, @latticexyz/world, create-mud)

Renamed `PackedCounter` to `EncodedLengths` for consistency.

**[feat(store-sync): adjust DB schema/table names for consistency (#2379)](https://github.com/latticexyz/mud/commit/adc68225008b481df6b47050638677fd936c22c9)** (@latticexyz/store-indexer, @latticexyz/store-sync)

PostgreSQL sync/indexer now uses `{storeAddress}` for its database schema names and `{namespace}__{tableName}` for its database table names (or just `{tableName}` for root namespace), to be more consistent with the rest of the MUD codebase.

For namespaced tables:

```diff
- SELECT * FROM 0xfff__some_ns.some_table
+ SELECT * FROM 0xfff.some_ns__some_table
```

For root tables:

```diff
- SELECT * FROM 0xfff__.some_table
+ SELECT * FROM 0xfff.some_table
```

SQLite sync/indexer now uses snake case for its table names and column names for easier writing of queries and to better match PostgreSQL sync/indexer naming.

```diff
- SELECT * FROM 0xfFf__someNS__someTable
+ SELECT * FROM 0xfff__some_ns__some_table
```

**[feat: use new config (#2483)](https://github.com/latticexyz/mud/commit/252a1852dc76c8e3f923c4f066620278ca69c430)** (@latticexyz/cli, @latticexyz/dev-tools, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world-modules, @latticexyz/world, create-mud)

Migrated to new config format.

### Minor changes

**[feat(cli): add a RPC batch option to cli (#2322)](https://github.com/latticexyz/mud/commit/645736dfa00508cbaa7ba84b4e1a19f03b09fa7f)** (@latticexyz/cli)

Added an `--rpcBatch` option to `mud deploy` command to batch RPC calls for rate limited RPCs.

**[feat(store-sync,store-indexer): add followBlockTag option (#2315)](https://github.com/latticexyz/mud/commit/3622e39dd5be2b0e98dfae38040fc35ccf01fe87)** (@latticexyz/store-indexer, @latticexyz/store-sync)

Added a `followBlockTag` option to configure which block number to follow when running `createStoreSync`. It defaults to `latest` (current behavior), which is recommended for individual clients so that you always have the latest chain state.

Indexers now default to `safe` to avoid issues with reorgs and load-balanced RPCs being out of sync. This means indexers will be slightly behind the latest block number, but clients can quickly catch up. Indexers can override this setting using `FOLLOW_BLOCK_TAG` environment variable.

**[refactor(world): registerRootFunctionSelector takes system signature (#2395)](https://github.com/latticexyz/mud/commit/5debcca83e8fbb732bd1ef55391b5251481abdf4)** (@latticexyz/world)

`registerRootFunctionSelector` now expects a `systemFunctionSignature` instead of a `systemFunctionSelector`. Internally, we compute the selector from the signature. This allows us to track system function signatures that are registered at the root so we can later generate ABIs for these systems.

**[feat(common): add viem actions that work the same as the current wrappers (#2347)](https://github.com/latticexyz/mud/commit/5926765556e8631baf192c0fb47fe87642c12368)** (@latticexyz/common, create-mud)

Added viem custom client actions that work the same as MUD's now-deprecated `getContract`, `writeContract`, and `sendTransaction` wrappers. Templates have been updated to reflect the new patterns.

You can migrate your own code like this:

```diff
-import { createWalletClient } from "viem";
-import { getContract, writeContract, sendTransaction } from "@latticexyz/common";
+import { createWalletClient, getContract } from "viem";
+import { transactionQueue, writeObserver } from "@latticexyz/common/actions";

-const walletClient = createWalletClient(...);
+const walletClient = createWalletClient(...)
+  .extend(transactionQueue())
+  .extend(writeObserver({ onWrite });

 const worldContract = getContract({
   client: { publicClient, walletClient },
-  onWrite,
 });
```

**[refactor(store): add StoreWrite and Store abstract contracts (#2411)](https://github.com/latticexyz/mud/commit/93390d8994bac0ad7c4a66ba00bc9783899b8cff)** (@latticexyz/store, @latticexyz/world)

Added an `abstract` `StoreKernel` contract, which includes all Store interfaces except for registration, and implements write methods, `protocolVersion` and initializes `StoreCore`. `Store` extends `StoreKernel` with the `IStoreRegistration` interface. `StoreData` is removed as a separate interface/contract. `World` now extends `StoreKernel` (since the registration methods are added via the `InitModule`).

**[refactor(store): make static array length a constant (#2410)](https://github.com/latticexyz/mud/commit/144c0d8db85a28b0c09f2efdf21f078a9e66af97)** (@latticexyz/store)

Replaced the static array length getters in table libraries with constants.

**[feat(gas-report): run gas report with --isolate (#2331)](https://github.com/latticexyz/mud/commit/90d0d79cfc8e035ad17a2e18917f68d5a0d88f01)** (@latticexyz/gas-report)

Now uses `--isolate` flag in `forge test` for more accurate gas measurement.

**[feat(cli): link and deploy public libraries (#1910)](https://github.com/latticexyz/mud/commit/5554b197a26f2a3207688d53fecf85e6a77624e3)** (@latticexyz/cli)

`mud deploy` now supports public/linked libraries.

This helps with cases where system contracts would exceed the EVM bytecode size limit and logic would need to be split into many smaller systems.

Instead of the overhead and complexity of system-to-system calls, this logic can now be moved into public libraries that will be deployed alongside your systems and automatically `delegatecall`ed.

**[refactor: hardcode key/value schema in table libraries (#2328)](https://github.com/latticexyz/mud/commit/3042f86e66ed39618bf520b5dbba06bfd23486a4)** (create-mud, @latticexyz/store, @latticexyz/world, @latticexyz/world-modules)

Moved key schema and value schema methods to constants in code-generated table libraries for less bytecode and less gas in register/install methods.

```diff
-console.log(SomeTable.getKeySchema());
+console.log(SomeTable._keySchema);

-console.log(SomeTable.getValueSchema());
+console.log(SomeTable._valueSchema);
```

**[feat: upgrade viem to v2 (#2284)](https://github.com/latticexyz/mud/commit/d7b1c588a73ab8d5f49165841fde3bfbe78fd981)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/config, @latticexyz/dev-tools, @latticexyz/faucet, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world, create-mud)

Upgraded all packages and templates to viem v2.7.12 and abitype v1.0.0.

Some viem APIs have changed and we've updated `getContract` to reflect those changes and keep it aligned with viem. It's one small code change:

```diff
 const worldContract = getContract({
   address: worldAddress,
   abi: IWorldAbi,
-  publicClient,
-  walletClient,
+  client: { public: publicClient, wallet: walletClient },
 });
```

### Patch changes

**[fix(cli): throw error when deploying overlapping systems (#2325)](https://github.com/latticexyz/mud/commit/8f49c277d255d437b2db27208e923ecbe4e2756d)** (@latticexyz/cli, @latticexyz/world)

Attempting to deploy multiple systems where there are overlapping system IDs now throws an error.

**[fix(common): use `setTimeout` as fallback for `requestIdleCallback` (#2406)](https://github.com/latticexyz/mud/commit/82693072f749a7234eb0c2bf9e2cec39ea8ad2a0)** (@latticexyz/common)

`waitForIdle` now falls back to `setTimeout` for environments without `requestIdleCallback`.

**[refactor: human-readable resource IDs use double underscore (#2310)](https://github.com/latticexyz/mud/commit/d5c0682fbd34fd7d5a96cd66a14b126c8f1afdb7)** (@latticexyz/store-sync, @latticexyz/dev-tools, @latticexyz/common, @latticexyz/cli)

Updated all human-readable resource IDs to use `{namespace}__{name}` for consistency with world function signatures.

**[chore: remove some unused files (#2398)](https://github.com/latticexyz/mud/commit/01e46d99cd9c14e826fa198171d7e17d7896a721)** (@latticexyz/common, @latticexyz/react)

Removed some unused files, namely `curry` in `@latticexyz/common` and `useDeprecatedComputedValue` from `@latticexyz/react`.

**[fix(world-modules): token modules always register namespace (#2352)](https://github.com/latticexyz/mud/commit/4be22ba41c39cf4e93f85065c2e59269bdc693e0)** (@latticexyz/world-modules)

ERC20 and ERC721 implementations now always register the token namespace, instead of checking if it has already been registered. This prevents issues with registering the namespace beforehand, namely that only the owner of a system can create a puppet for it.

**[refactor(store): store core imports store events (#2356)](https://github.com/latticexyz/mud/commit/2c920de7b04bddde0280b1699a9b047182aa712c)** (@latticexyz/store)

Refactored `StoreCore` to import `IStoreEvents` instead of defining the events twice.

**[feat(world): emit salt in WorldDeployed event (#2301)](https://github.com/latticexyz/mud/commit/3be4deecf8bc19ebba9723237be2264997ef6292)** (@latticexyz/world)

Added salt to the `WorldDeployed` event.

**[chore: upgrade to typescript 5.4.2 (#2397)](https://github.com/latticexyz/mud/commit/257a0afc78fa8e5ecbf0ecba44de151b858a2f49)** (@latticexyz/cli, create-mud)

Bumped `typescript` to `5.4.2`, `eslint` to `8.57.0`, and both `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to `7.1.1`.

**[fix(common): remove underscore prefix from root namespace labels (#2400)](https://github.com/latticexyz/mud/commit/307abab341cd5b1bb2bef86f9c7335b6e6e798f0)** (@latticexyz/common)

`resourceToLabel` now correctly returns just the resource name if its in the root namespace.

**[chore(noise): remove noise package (#2304)](https://github.com/latticexyz/mud/commit/5a8dfc8570de02acb60a9975cb6c41763b757ef3)** (@latticexyz/noise)

Removed the @latticexyz/noise package.

**[refactor(store): event interfaces for Store libraries (#2348)](https://github.com/latticexyz/mud/commit/c991c71ae2eed8ec3c8a328962439710cffc135d)** (@latticexyz/store)

Added interfaces for all errors that are used by `StoreCore`, which includes `FieldLayout`, `PackedCounter`, `Schema`, and `Slice`. This interfaces are inherited by `IStore`, ensuring that all possible errors are included in the `IStore` ABI for proper decoding in the frontend.

**[docs: add missing changeset (#2374)](https://github.com/latticexyz/mud/commit/e34d117082475b801e07f331362f961c910069df)** (@latticexyz/common)

Moved the transaction simulation step to just before sending the transaction in our transaction queue actions (`sendTransaction` and `writeContract`).

This helps avoid cascading transaction failures for deep queues or when a transaction succeeding depends on the value of the previous.

**[fix(store): restore bytesN helpers (#2403)](https://github.com/latticexyz/mud/commit/190fdd113862de2a5d35dd24206e2278b8cb9bf7)** (@latticexyz/store)

Restored `Bytes.sliceN` helpers that were previously (mistakenly) removed and renamed them to `Bytes.getBytesN`.

If you're upgrading an existing MUD project, you can rerun codegen with `mud build` to update your table libraries to the new function names.

**[chore: upgrade prettier to 3.2.5 and prettier-plugin-solidity to 1.3.1 (#2303)](https://github.com/latticexyz/mud/commit/db314a7490b7797322fd0568cbeec0066c231666)** (@latticexyz/common)

Upgraded prettier version to 3.2.5 and prettier-plugin-solidity version to 1.3.1.

**[feat(world): add system signatures to FunctionSignatures (#2392)](https://github.com/latticexyz/mud/commit/1a82c278dd8037155b6449e383b3a00d6453ea3e)** (@latticexyz/world)

Added system signatures to the `FunctionSignatures` table, so they can be used to generate system ABIs and decode system calls made via the world.

**[fix(gas-report): update filename matcher (#2277)](https://github.com/latticexyz/mud/commit/a02da555b82b494acdef8cc5b8f58fc6760d1c07)** (@latticexyz/gas-report)

Fixed gas report parsing for foundry versions released after 2024-02-15.

**[feat(create-mud): add additional recommended vscode extensions (#2440)](https://github.com/latticexyz/mud/commit/5237e32054b99542c1dd38c56df6f2235c4c79be)** (create-mud)

Added `dbaeumer.vscode-eslint` and `esbenp.prettier-vscode` to recommended VSCode extensions.

**[refactor(world): add IWorldEvents with HelloWorld (#2358)](https://github.com/latticexyz/mud/commit/86766ce12c749a247216bf753889c35745f4d722)** (@latticexyz/world)

Created an `IWorldEvents` interface with `HelloStore`, so all World events are defined in a single interface.

**[fix(store-sync): track changed records together in zustand (#2387)](https://github.com/latticexyz/mud/commit/3f5d33afb19cf0c99269445120f5e985806241ad)** (@latticexyz/store-sync)

Fixes an issue with Zustand store sync where multiple updates to a record for a key in the same block did not get tracked and applied properly.

**[refactor(store): hellostore in IStoreEvents (#2357)](https://github.com/latticexyz/mud/commit/c58da9adc6c67bc410fdc1c72f21cb1af8bdb50f)** (@latticexyz/store)

Moved the `HelloStore` to `IStoreEvents` so all Store events are defined in the same interface.

**[feat(world): world kernel inherits `IModuleErrors` (#2380)](https://github.com/latticexyz/mud/commit/be18b75b93716a2d948496009ae34d6cb0cf389a)** (@latticexyz/world)

`IWorldKernel` now inherits `IModuleErrors` so it can render the correct errors if the World reverts when delegatecalled with Module code.

**[feat(cli): deterministic deployer fallback (#2261)](https://github.com/latticexyz/mud/commit/9c83adc01c2bcd8c390318006a0cf8139b747d6d)** (@latticexyz/cli)

Added a non-deterministic fallback for deploying to chains that have replay protection on and do not support pre-EIP-155 transactions (no chain ID).

If you're using `mud deploy` and there's already a [deterministic deployer](https://github.com/Arachnid/deterministic-deployment-proxy) on your target chain, you can provide the address with `--deployerAddress 0x...` to still get some determinism.

**[refactor(world): rename functionSelector to worldFunctionSelector (#2391)](https://github.com/latticexyz/mud/commit/95f64c85e5a10106ce7cc9dc5575fcebeeb87151)** (@latticexyz/world)

Renamed the `functionSelector` key in the `FunctionSelectors` table to `worldFunctionSelector`. This clarifies that `FunctionSelectors` is for world function selectors and can be used to generate the world ABI.

---

## Version 2.0.0-next.17

Release date: Tue Feb 20 2024

### Major changes

**[chore: upgrade to Solidity 0.8.24 (#2202)](https://github.com/latticexyz/mud/commit/aabd30767cdda7ce0c32663e7cc483db1b66d967)** (@latticexyz/world-modules, @latticexyz/schema-type, @latticexyz/gas-report, @latticexyz/common, @latticexyz/noise, @latticexyz/store, @latticexyz/world, @latticexyz/cli, create-mud)

Bumped Solidity version to 0.8.24.

**[feat(world): rename CoreModule to InitModule (#2227)](https://github.com/latticexyz/mud/commit/db7798be2181c1b9e55380a195a04100aab627fd)** (@latticexyz/world)

Renamed `CoreModule` to `InitModule` and `CoreRegistrationSystem` to `RegistrationSystem`.

**[feat(cli,world): add user defined salt in WorldFactory.deployWorld() (#2219)](https://github.com/latticexyz/mud/commit/618dd0e89232896326c30ce55f183fceb0edabdb)** (@latticexyz/cli, @latticexyz/world)

`WorldFactory` now expects a user-provided `salt` when calling `deployWorld(...)` (instead of the previous globally incrementing counter). This enables deterministic world addresses across different chains.

When using `mud deploy`, you can provide a `bytes32` hex-encoded salt using the `--salt` option, otherwise it defaults to a random hex value.

**[feat(store): rename StoreCore.registerCoreTables to registerInternalTables (#2225)](https://github.com/latticexyz/mud/commit/5c52bee094fe5dad445a2d600cbea83e29302c40)** (@latticexyz/store, @latticexyz/world)

Renamed `StoreCore`'s `registerCoreTables` method to `registerInternalTables`.

### Minor changes

**[fix(world-modules): `SystemSwitch` properly calls systems from root (#2205)](https://github.com/latticexyz/mud/commit/c4fc850416df72f055be9fb1eb36a0edfaa1febc)** (@latticexyz/world-modules)

Fixed `SystemSwitch` to properly call non-root systems from root systems.

**[feat(store-sync): wait for idle after each chunk of logs in a block (#2254)](https://github.com/latticexyz/mud/commit/997286bacafa43bd997c3c752b445acc23726bde)** (@latticexyz/store-sync)

`createStoreSync` now [waits for idle](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) between each chunk of logs in a block to allow for downstream render cycles to trigger. This means that hydrating logs from an indexer will no longer block until hydration completes, but rather allow for `onProgress` callbacks to trigger.

**[feat(world): deployment salt by msg.sender (#2210)](https://github.com/latticexyz/mud/commit/6470fe1fd1fc73104cfdd01d79793203bffe5d1c)** (@latticexyz/world)

`WorldFactory` now derives a salt based on number of worlds deployed by `msg.sender`, which should help with predictable world deployments across chains.

### Patch changes

**[feat(cli): hardcode table ID with codegen (#2229)](https://github.com/latticexyz/mud/commit/a35c05ea95395e9c7da3e18030fc200c2cde1353)** (@latticexyz/cli, @latticexyz/common, @latticexyz/store, @latticexyz/world-modules, @latticexyz/world, create-mud)

Table libraries now hardcode the `bytes32` table ID value rather than computing it in Solidity. This saves a bit of gas across all storage operations.

**[fix(store): reorder core table registration (#2164)](https://github.com/latticexyz/mud/commit/05b3e8882ef846e26dbf18946f64533f70d3bf41)** (@latticexyz/store)

Fixed a race condition when registering core tables, where we would set a record in the `ResourceIds` table before the table was registered.

**[fix(world): check table exists for register store and system hook [L-09] (#2195)](https://github.com/latticexyz/mud/commit/745485cda0d3a46e3d63d05c0149b2448e578010)** (@latticexyz/world)

Updated `WorldRegistrationSystem` to check that systems exist before registering system hooks.

**[fix(store-sync): fix overflowing column types, bump postgres sync version (#2270)](https://github.com/latticexyz/mud/commit/6c615b608e73d3bdabde3ad03823f1dce87f2ac6)** (@latticexyz/store-sync)

Bumped the Postgres column size for `int32`, `uint32`, `int64`, and `uint64` types to avoid overflows

**[feat(store-sync): bool array column types for decoded indexer (#2283)](https://github.com/latticexyz/mud/commit/4e445a1abb764de970381f5c5570ce135b712c4c)** (@latticexyz/store-sync)

Moved boolean array types to use array column types (instead of JSON columns) for the Postgres decoded indexer

**[docs: add missing changeset (#2282)](https://github.com/latticexyz/mud/commit/669fa43e5adcd2b3e44a298544c62ef9e0df642a)** (@latticexyz/store-sync)

Moved numerical array types to use array column types (instead of JSON columns) for the Postgres decoded indexer

**[docs: changeset for #2187 (#2188)](https://github.com/latticexyz/mud/commit/78a837167e527511d1a03fe67f60eb1d2e80aaa2)** (@latticexyz/cli)

Fixed registration of world signatures/selectors for namespaced systems. We changed these signatures in [#2160](https://github.com/latticexyz/mud/pull/2160), but missed updating part of the deploy step.

**[fix(common): include only errors defined in the contract (#2194)](https://github.com/latticexyz/mud/commit/c162ad5a546a92009aafc6150d9449738234b1ef)** (@latticexyz/common)

Prevented errors not included in the contract (but present in the file) from being included in the interface by `contractToInterface`

**[refactor(store): push to StoreHooks with StoreCore method (#2201)](https://github.com/latticexyz/mud/commit/55a05fd7af2abe68d2a041f55bafdd03f5d68788)** (@latticexyz/store)

Refactored `StoreCore.registerStoreHook` to use `StoreHooks._push` for gas efficiency.

**[refactor(world,world-modules): rename module args to encodedArgs (#2199)](https://github.com/latticexyz/mud/commit/e2d089c6d3970094e0310e84b096db0487967cc9)** (@latticexyz/world-modules, @latticexyz/world)

Renamed the Module `args` parameter to `encodedArgs` to better reflect that it is ABI-encoded arguments.

**[feat(world): rename CoreModule to InitModule (#2227)](https://github.com/latticexyz/mud/commit/db7798be2181c1b9e55380a195a04100aab627fd)** (@latticexyz/cli)

Updated deployer with world's new `InitModule` naming.

**[fix(world): prevent namespace from ending with underscore [M-05] (#2182)](https://github.com/latticexyz/mud/commit/17f98720928444ce8f82639b6d1f1eb01012a1c8)** (@latticexyz/world)

Added a check to prevent namespaces from ending with an underscore (which could cause problems with world function signatures).

**[fix(world): check table exists for register store and system hook [L-09] (#2195)](https://github.com/latticexyz/mud/commit/745485cda0d3a46e3d63d05c0149b2448e578010)** (@latticexyz/store)

Updated `StoreCore` to check that tables exist before registering store hooks.

---

## Version 2.0.0-next.16

Release date: Tue Jan 23 2024

### Major changes

**[feat(world): remove system name from function signatures/selectors [M-05] (#2160)](https://github.com/latticexyz/mud/commit/0f27afddb73d855d119ea432d7943cd96952e4da)** (@latticexyz/world-modules, @latticexyz/world)

World function signatures for namespaced systems have changed from `{namespace}_{systemName}_{functionName}` to `{namespace}__{functionName}` (double underscore, no system name). This is more ergonomic and is more consistent with namespaced resources in other parts of the codebase (e.g. MUD config types, table names in the schemaful indexer).

If you have a project using the `namespace` key in your `mud.config.ts` or are manually registering systems and function selectors on a namespace, you will likely need to codegen your system interfaces (`pnpm build`) and update any calls to these systems through the world's namespaced function signatures.

**[chore: add module addresses changeset (#2172)](https://github.com/latticexyz/mud/commit/865253dba0aeccf30615e446c8946583ee6b1068)** (@latticexyz/world, @latticexyz/world-modules)

Refactored `InstalledModules` to key modules by addresses instead of pre-defined names. Previously, modules could report arbitrary names, meaning misconfigured modules could be installed under a name intended for another module.

**[feat(world): require namespace to exist before registering systems/tables in it [C-01] (#2007)](https://github.com/latticexyz/mud/commit/063daf80ef9aa9151903061fc7d80c170a96cb07)** (@latticexyz/cli, @latticexyz/world-modules, @latticexyz/world)

Previously `registerSystem` and `registerTable` had a side effect of registering namespaces if the system or table's namespace didn't exist yet.
This caused a possible frontrunning issue, where an attacker could detect a `registerSystem`/`registerTable` transaction in the mempool,
insert a `registerNamespace` transaction before it, grant themselves access to the namespace, transfer ownership of the namespace to the victim,
so that the `registerSystem`/`registerTable` transactions still went through successfully.
To mitigate this issue, the side effect of registering a namespace in `registerSystem` and `registerTable` has been removed.
Calls to these functions now expect the respective namespace to exist and the caller to own the namespace, otherwise they revert.

Changes in consuming projects are only necessary if tables or systems are registered manually.
If only the MUD deployer is used to register tables and systems, no changes are necessary, as the MUD deployer has been updated accordingly.

```diff
+  world.registerNamespace(namespaceId);
   world.registerSystem(systemId, system, true);
```

```diff
+  world.registerNamespace(namespaceId);
   MyTable.register();
```

**[refactor(cli,world,world-modules): split and separately deploy core systems (#2128)](https://github.com/latticexyz/mud/commit/57d8965dfaa5275bd803a48c22d42b50b83c23ed)** (@latticexyz/cli)

Separated core systems deployment from `CoreModule`, and added the systems as arguments to `CoreModule`

**[refactor(cli,world,world-modules): split and separately deploy core systems (#2128)](https://github.com/latticexyz/mud/commit/57d8965dfaa5275bd803a48c22d42b50b83c23ed)** (@latticexyz/world)

- Split `CoreSystem` into `AccessManagementSystem`, `BalanceTransferSystem`, `BatchCallSystem`, `CoreRegistrationSystem`
- Changed `CoreModule` to receive the addresses of these systems as arguments, instead of deploying them
- Replaced `CORE_SYSTEM_ID` constant with `ACCESS_MANAGEMENT_SYSTEM_ID`, `BALANCE_TRANSFER_SYSTEM_ID`, `BATCH_CALL_SYSTEM_ID`, `CORE_REGISTRATION_SYSTEM_ID`, for each respective system

These changes separate the initcode of `CoreModule` from the bytecode of core systems, which effectively removes a limit on the total bytecode of all core systems.

**[feat(world): prevent invalid namespace strings [M-05] (#2169)](https://github.com/latticexyz/mud/commit/c642ff3a0ad0d6f47d53d7c381ad6d3fffe52bbf)** (@latticexyz/world)

Namespaces are not allowed to contain double underscores ("\_\_") anymore, as this sequence of characters is used to [separate the namespace and function selector](https://github.com/latticexyz/mud/pull/2168) in namespaced systems.
This is to prevent signature clashes of functions in different namespaces.

(Example: If namespaces were allowed to contain this separator string, a function "function" in namespace "namespace\_\_my" would result in the namespaced function selector "namespace\_\_my\_\_function",
and would clash with a function "my\_\_function" in namespace "namespace".)

**[fix(cli): mud set-version --link shouldn't fetch versions (#2000)](https://github.com/latticexyz/mud/commit/854de0761fd3744c2076a2b995f0f9274a8ef971)** (@latticexyz/store-sync)

Postgres storage adapter now uses snake case for decoded table names and column names. This allows for better SQL ergonomics when querying these tables.

To avoid naming conflicts for now, schemas are still case-sensitive and need to be queried with double quotes. We may change this in the future with [namespace validation](https://github.com/latticexyz/mud/issues/1991).

### Minor changes

**[feat(store): never allow empty FieldLayout (#2122)](https://github.com/latticexyz/mud/commit/3ac68ade6e60dae2caad9f12ca146b1d461cb1c4)** (@latticexyz/store)

Removed `allowEmpty` option from `FieldLayout.validate()` as field layouts should never be empty.

**[feat(store): improve FieldLayout errors [N-03] (#2114)](https://github.com/latticexyz/mud/commit/103f635ebc20ac1aecc5c526c4bcb928e860a7ed)** (@latticexyz/store)

Improved error messages for invalid `FieldLayout`s

```diff
-error FieldLayoutLib_InvalidLength(uint256 length);
+error FieldLayoutLib_TooManyFields(uint256 numFields, uint256 maxFields);
+error FieldLayoutLib_TooManyDynamicFields(uint256 numFields, uint256 maxFields);
+error FieldLayoutLib_Empty();
```

### Patch changes

**[fix(store): emit event after calling beforeSetRecord hook [L-02] (#2017)](https://github.com/latticexyz/mud/commit/c6c13f2ea7e405cac2bc9cf77659d2d66bfdc0d2)** (@latticexyz/store)

Storage events are now emitted after "before" hooks, so that the resulting logs are now correctly ordered and reflect onchain logic. This resolves issues with store writes and event emissions happening in "before" hooks.

**[refactor(world-modules): simplify getUniqueEntity call (#2161)](https://github.com/latticexyz/mud/commit/eaa766ef7d68b76bb783531a1a2691abdaa27df5)** (@latticexyz/world-modules)

Removed `IUniqueEntitySystem` in favor of calling `getUniqueEntity` via `world.call` instead of the world function selector. This had a small gas improvement.

**[refactor(store,world): rename ambiguous elements [N-03] (#2091)](https://github.com/latticexyz/mud/commit/e6c03a87a5c80b5ed9ddc1aaf6ad73f544c03648)** (@latticexyz/store, @latticexyz/world)

Renamed the `requireNoCallback` modifier to `prohibitDirectCallback`.

**[refactor(world): use \_getSystem when fetching system addresses [N-11] (#2022)](https://github.com/latticexyz/mud/commit/c207d35e822afe5f04225d6854fb039116cc7840)** (@latticexyz/world)

Optimised `StoreRegistrationSystem` and `WorldRegistrationSystem` by fetching individual fields instead of entire records where possible.

**[fix(world): inline debug constants [L-11] (#1976)](https://github.com/latticexyz/mud/commit/d00c4a9af5fe54b1d21caa9f5cd525e48b3960f5)** (@latticexyz/world)

Removed `ROOT_NAMESPACE_STRING` and `ROOT_NAME_STRING` exports in favor of inlining these constants, to avoid reuse as they're meant for internal error messages and debugging.

**[refactor(store,world,world-modules): code suggestions [N-08] (#2140)](https://github.com/latticexyz/mud/commit/37c228c63235e184a40623d9bb1f6494abdf25e4)** (@latticexyz/store, @latticexyz/world)

Refactored various files to specify integers in a hex base instead of decimals.

**[fix(store): do not render push and pop for static arrays, use static length [M-02] (#2175)](https://github.com/latticexyz/mud/commit/1bf2e908763529e08c3d233f68eaf6705c9fffab)** (@latticexyz/store)

Updated codegen to not render `push` and `pop` methods for static arrays. The `length` method now returns the hardcoded known length instead of calculating it like with a dynamic array.

**[fix(world): module supports world context consumer id [L-12] (#2032)](https://github.com/latticexyz/mud/commit/f6f402896d8256da3b868f865a960db68393caf4)** (@latticexyz/world)

Added the WorldContextConsumer interface ID to `supportsInterface` in the Module contract.

**[fix(world): limit call context of `CoreSystem` to delegatecall [C-02] (#2111)](https://github.com/latticexyz/mud/commit/08b4221712cb004867e5c43b4b408aa45d9e3355)** (@latticexyz/world)

Systems are expected to be always called via the central World contract.
Depending on whether it is a root or non-root system, the call is performed via `delegatecall` or `call`.
Since Systems are expected to be stateless and only interact with the World state, it is not necessary to prevent direct calls to the systems.
However, since the `CoreSystem` is known to always be registered as a root system in the World, it is always expected to be delegatecalled,
so we made this expectation explicit by reverting if it is not delegatecalled.

**[refactor(store,world,world-modules): code suggestions [N-08] (#2140)](https://github.com/latticexyz/mud/commit/37c228c63235e184a40623d9bb1f6494abdf25e4)** (@latticexyz/world)

Made the `coreModule` variable in `WorldFactory` immutable.

**[refactor(store,world,world-modules): code suggestions [N-08] (#2140)](https://github.com/latticexyz/mud/commit/37c228c63235e184a40623d9bb1f6494abdf25e4)** (@latticexyz/world)

Removed the unnecessary `extcodesize` check from the `Create2` library.

**[refactor(store,world,world-modules): code suggestions [N-08] (#2140)](https://github.com/latticexyz/mud/commit/37c228c63235e184a40623d9bb1f6494abdf25e4)** (@latticexyz/world-modules, @latticexyz/store, @latticexyz/world)

Refactored `ResourceId` to use a global Solidity `using` statement.

**[refactor(store,world,world-modules): code suggestions [N-08] (#2140)](https://github.com/latticexyz/mud/commit/37c228c63235e184a40623d9bb1f6494abdf25e4)** (@latticexyz/world-modules, @latticexyz/store, @latticexyz/world)

Refactored EIP165 usages to use the built-in interfaceId property instead of pre-defined constants.

**[fix(world): prevent initialising the world multiple times [L-05] (#2170)](https://github.com/latticexyz/mud/commit/2bfee9217c0b08b2cca5b4a5aef6f4c2f0e7d2f2)** (@latticexyz/world)

Added a table to track the `CoreModule` address the world was initialised with.

**[fix(store-sync): improve syncToZustand hydration speed (#2145)](https://github.com/latticexyz/mud/commit/a735e14b44f7bd0ed72745610d49b55a181f5401)** (@latticexyz/store-sync)

Improved `syncToZustand` speed of hydrating from snapshot by only applying block logs once per block instead of once per log.

**[fix(store): revert if slice bound is invalid [L-10] (#2034)](https://github.com/latticexyz/mud/commit/7b28d32e579a0ed09122982617bb938b3e2b5a98)** (@latticexyz/store)

Added a custom error `Store_InvalidBounds` for when the `start:end` slice in `getDynamicFieldSlice` is invalid (it used to revert with the default overflow error)

**[refactor(store): order load function arguments [N-02] (#2033)](https://github.com/latticexyz/mud/commit/9f8b84e733412323103fdd81067f8edc9d681a17)** (@latticexyz/store)

Aligned the order of function arguments in the `Storage` library.

```solidity
store(uint256 storagePointer, uint256 offset, bytes memory data)
store(uint256 storagePointer, uint256 offset, uint256 length, uint256 memoryPointer)
load(uint256 storagePointer, uint256 offset, uint256 length)
load(uint256 storagePointer, uint256 offset, uint256 length, uint256 memoryPointer)
```

**[fix(world): check namespace exists before balance transfer [L-03] (#2095)](https://github.com/latticexyz/mud/commit/aee8020a65ca5cfebb2ca479357a535bbf07269b)** (@latticexyz/world)

Namespace balances can no longer be transferred to non-existent namespaces.

**[fix(store): add missing FieldLayout and Schema validations [L-07] (#2046)](https://github.com/latticexyz/mud/commit/ad4ac44594f222fdfeca77e4d262eb47ef735836)** (@latticexyz/store)

Added more validation checks for `FieldLayout` and `Schema`.

**[fix(world): prevent misconfigured delegations, allow unregistering [L-04] (#2096)](https://github.com/latticexyz/mud/commit/e4a6189df7b2bbf5c88cc050c529d8f0ee49bc5a)** (@latticexyz/world)

Prevented invalid delegations by performing full validation regardless of whether `initCallData` is empty. Added an `unregisterDelegation` function which allows explicit unregistration, as opposed of passing in zero bytes into `registerDelegation`.

**[refactor(store,world,world-modules): code suggestions [N-08] (#2140)](https://github.com/latticexyz/mud/commit/37c228c63235e184a40623d9bb1f6494abdf25e4)** (@latticexyz/world-modules, @latticexyz/store, @latticexyz/world)

Refactored various Solidity files to not explicitly initialise variables to zero.

**[refactor(store,world,world-modules): code suggestions [N-08] (#2140)](https://github.com/latticexyz/mud/commit/37c228c63235e184a40623d9bb1f6494abdf25e4)** (@latticexyz/store)

Refactored some Store functions to use a right bit mask instead of left.

**[refactor(store,world,world-modules): code suggestions [N-08] (#2140)](https://github.com/latticexyz/mud/commit/37c228c63235e184a40623d9bb1f6494abdf25e4)** (@latticexyz/store)

Simplified a check in `Slice.getSubslice`.

**[refactor(store,world,world-modules): code suggestions [N-08] (#2140)](https://github.com/latticexyz/mud/commit/37c228c63235e184a40623d9bb1f6494abdf25e4)** (@latticexyz/world)

Refactored `WorldContext` to get the world address from `WorldContextConsumerLib` instead of `StoreSwitch`.

**[refactor(store,world,world-modules): code suggestions [N-08] (#2140)](https://github.com/latticexyz/mud/commit/37c228c63235e184a40623d9bb1f6494abdf25e4)** (@latticexyz/store)

Optimised the `Schema.validate` function to decrease gas use.

---

## Version 2.0.0-next.15

Release date: Wed Jan 03 2024

### Major changes

**[fix(store-sync,store-indexer): make last updated block number not null (#1972)](https://github.com/latticexyz/mud/commit/504e25dc83a210a1ef3b66d8487d9e292470620c)** (@latticexyz/store-sync)

`lastUpdatedBlockNumber` columns in Postgres storage adapters are no longer nullable

**[feat(store-indexer): clean database if outdated (#1984)](https://github.com/latticexyz/mud/commit/e48fb3b037d2ee888a8c61a6fc51721c903559e3)** (@latticexyz/store-sync)

Renamed singleton `chain` table to `config` table for clarity.

**[feat(store-sync, store-indexer): order logs by logIndex (#2037)](https://github.com/latticexyz/mud/commit/85b94614b83cd0964a305d488c1efb247445b915)** (@latticexyz/store-indexer, @latticexyz/store-sync)

The postgres indexer is now storing the `logIndex` of the last update of a record to be able to return the snapshot logs in the order they were emitted onchain.

**[feat(store-sync): fetch and store logs (#2003)](https://github.com/latticexyz/mud/commit/a4aff73c538265ecfd2a17ecf98edcaa6a2ef935)** (@latticexyz/store-sync)

Previously, all `store-sync` strategies were susceptible to a potential memory leak where the stream that fetches logs from the RPC would get ahead of the stream that stores the logs in the provided storage adapter. We saw this most often when syncing to remote Postgres servers, where inserting records was much slower than we retrieving them from the RPC. In these cases, the stream would build up a backlog of items until the machine ran out of memory.

This is now fixed by waiting for logs to be stored before fetching the next batch of logs from the RPC. To make this strategy work, we no longer return `blockLogs$` (stream of logs fetched from RPC but before they're stored) and instead just return `storedBlockLogs$` (stream of logs fetched from RPC after they're stored).

**[feat(store-sync,store-indexer): schemaless indexer (#1965)](https://github.com/latticexyz/mud/commit/1b5eb0d075579d2437b4329266ca37735e65ce41)** (@latticexyz/store-sync)

`syncToPostgres` from `@latticexyz/store-sync/postgres` now uses a single table to store all records in their bytes form (`staticData`, `encodedLengths`, and `dynamicData`), more closely mirroring onchain state and enabling more scalability and stability for automatic indexing of many worlds.

The previous behavior, where schemaful SQL tables are created and populated for each MUD table, has been moved to a separate `@latticexyz/store-sync/postgres-decoded` export bundle. This approach is considered less stable and is intended to be used for analytics purposes rather than hydrating clients. Some previous metadata columns on these tables have been removed in favor of the bytes records table as the source of truth for onchain state.

This overhaul is considered breaking and we recommend starting a fresh database when syncing with either of these strategies.

**[feat(store-sync): snake case postgres names in decoded tables (#1989)](https://github.com/latticexyz/mud/commit/7b73f44d98dd25483c037e76d174e30e99488bd3)** (@latticexyz/store-sync)

Postgres storage adapter now uses snake case for decoded table names and column names. This allows for better SQL ergonomics when querying these tables.

To avoid naming conflicts for now, schemas are still case-sensitive and need to be queried with double quotes. We may change this in the future with [namespace validation](https://github.com/latticexyz/mud/issues/1991).

### Minor changes

**[feat(store-sync,store-indexer): sync from getLogs indexer endpoint (#1973)](https://github.com/latticexyz/mud/commit/5df1f31bc9d35969de6f03396905778748017f38)** (@latticexyz/store-sync)

Refactored how we fetch snapshots from an indexer, preferring the new `getLogs` endpoint and falling back to the previous `findAll` if it isn't available. This refactor also prepares for an easier entry point for adding client caching of snapshots.

The `initialState` option for various sync methods (`syncToPostgres`, `syncToRecs`, etc.) is now deprecated in favor of `initialBlockLogs`. For now, we'll automatically convert `initialState` into `initialBlockLogs`, but if you want to update your code, you can do:

```ts
import { tablesWithRecordsToLogs } from "@latticexyz/store-sync";

const initialBlockLogs = {
  blockNumber: initialState.blockNumber,
  logs: tablesWithRecordsToLogs(initialState.tables),
};
```

**[feat(create-mud): remove window global usage in vanilla template (#1774)](https://github.com/latticexyz/mud/commit/f6133591a86eb169a7b1b2b8d342733a887af610)** (create-mud)

Replaced usage of `window` global in vanilla JS template with an event listener on the button.

**[feat(cli): add build command (#1990)](https://github.com/latticexyz/mud/commit/59d78c93ba80d20e5d7c4f47b9fe24575bcdc8cd)** (@latticexyz/cli)

Added a `mud build` command that generates table libraries, system interfaces, and typed ABIs.

**[feat(store-sync,store-indexer): schemaless indexer (#1965)](https://github.com/latticexyz/mud/commit/1b5eb0d075579d2437b4329266ca37735e65ce41)** (@latticexyz/common)

Added `unique` and `groupBy` array helpers to `@latticexyz/common/utils`.

```ts
import { unique } from "@latticexyz/common/utils";

unique([1, 2, 1, 4, 3, 2]);
// [1, 2, 4, 3]
```

```ts
import { groupBy } from "@latticexyz/common/utils";

const records = [
  { type: "cat", name: "Bob" },
  { type: "cat", name: "Spot" },
  { type: "dog", name: "Rover" },
];
Object.fromEntries(groupBy(records, (record) => record.type));
// {
//   "cat": [{ type: "cat", name: "Bob" }, { type: "cat", name: "Spot" }],
//   "dog: [{ type: "dog", name: "Rover" }]
// }
```

**[feat(store-sync,store-indexer): schemaless indexer (#1965)](https://github.com/latticexyz/mud/commit/1b5eb0d075579d2437b4329266ca37735e65ce41)** (@latticexyz/store-indexer)

The `findAll` method is now considered deprecated in favor of a new `getLogs` method. This is only implemented in the Postgres indexer for now, with SQLite coming soon. The new `getLogs` method will be an easier and more robust data source to hydrate the client and other indexers and will allow us to add streaming updates from the indexer in the near future.

For backwards compatibility, `findAll` is now implemented on top of `getLogs`, with record key/value decoding done in memory at request time. This may not scale for large databases, so use wisely.

**[feat(store-indexer): clean database if outdated (#1984)](https://github.com/latticexyz/mud/commit/e48fb3b037d2ee888a8c61a6fc51721c903559e3)** (@latticexyz/store-indexer)

When the Postgres indexer starts up, it will now attempt to detect if the database is outdated and, if so, cleans up all MUD-related schemas and tables before proceeding.

**[feat(store-indexer, store-sync): improve query performance and enable compression, add new api (#2026)](https://github.com/latticexyz/mud/commit/4c1dcd81eae44c37f66bd80871daf02834c04fb5)** (@latticexyz/common)

- Added a `Result<Ok, Err>` type for more explicit and typesafe error handling ([inspired by Rust](https://doc.rust-lang.org/std/result/)).

- Added a `includes` util as typesafe alternative to [`Array.prototype.includes()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes).

**[docs: add changeset for zustand sync progress (#1931)](https://github.com/latticexyz/mud/commit/7eabd06f7af9748aba842d116f1dcd0ef5635999)** (@latticexyz/store-sync)

Added and populated `syncProgress` key in Zustand store for sync progress, like we do for RECS sync. This will let apps using `syncToZustand` render a loading state while initial client hydration is in progress.

```tsx
const syncProgress = useStore((state) => state.syncProgress);

if (syncProgress.step !== SyncStep.LIVE) {
  return <>Loading ({Math.floor(syncProgress.percentage)}%)</>;
}
```

**[feat(store-sync,store-indexer): sync from getLogs indexer endpoint (#1973)](https://github.com/latticexyz/mud/commit/5df1f31bc9d35969de6f03396905778748017f38)** (@latticexyz/common)

Updated `chunk` types to use readonly arrays

**[feat(store-sync,store-indexer): sync from getLogs indexer endpoint (#1973)](https://github.com/latticexyz/mud/commit/5df1f31bc9d35969de6f03396905778748017f38)** (@latticexyz/store-indexer)

Added `getLogs` query support to sqlite indexer

**[feat(store-indexer, store-sync): improve query performance and enable compression, add new api (#2026)](https://github.com/latticexyz/mud/commit/4c1dcd81eae44c37f66bd80871daf02834c04fb5)** (@latticexyz/store-indexer, @latticexyz/store-sync)

- Improved query performance by 10x by moving from drizzle ORM to handcrafted SQL.
- Moved away from `trpc` for more granular control over the transport layer.
  Added an `/api/logs` endpoint using the new query and gzip compression for 40x less data transferred over the wire.
  Deprecated the `/trpc/getLogs` and `/trpc/findAll` endpoints.
- Added a `createIndexerClient` client for the new `/api` indexer API exported from `@latticexyz/store-sync/indexer-client`.
  The `createIndexerClient` export from `@latticexyz/store-sync/trpc-indexer` is deprecated.

```diff
- import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";
+ import { createIndexerClient } from "@latticexyz/store-sync/indexer-client";

- const indexer = createIndexerClient({ url: "https://indexer.holesky.redstone.xyz/trpc" });
+ const indexer = createIndexerClient({ url: "https://indexer.holesky.redstone.xyz" });

- const snapshot = indexer.getLogs.query(options);
+ const snapshot = indexer.getLogs(options);
```

**[feat(store-indexer): return a "not found" error when no snapshot is found for a `/api/logs` request (#2043)](https://github.com/latticexyz/mud/commit/f61b4bc0903d09c4c71f01270012953adee50701)** (@latticexyz/store-indexer)

The `/api/logs` indexer endpoint is now returning a `404` snapshot not found error when no snapshot is found for the provided filter instead of an empty `200` response.

**[fix(cli): add worldAddress to dev-contracts (#1892)](https://github.com/latticexyz/mud/commit/1feecf4955462554c650f56e4777aa330e31f667)** (@latticexyz/store-indexer)

Added `STORE_ADDRESS` environment variable to index only a specific MUD Store.

### Patch changes

**[fix(store,world): exclude ERC165 interface ID from custom interface ID's [L-06] (#2014)](https://github.com/latticexyz/mud/commit/d8c8f66bfd403994216e856d5e92368f7a63be38)** (@latticexyz/store, @latticexyz/world)

Exclude ERC165 interface ID from custom interface ID's.

**[fix(store-sync,store-indexer): make last updated block number not null (#1972)](https://github.com/latticexyz/mud/commit/504e25dc83a210a1ef3b66d8487d9e292470620c)** (@latticexyz/store-indexer)

Records are now ordered by `lastUpdatedBlockNumber` at the Postgres SQL query level

**[fix(store): slice4 output should be bytes4 [M-03] (#2031)](https://github.com/latticexyz/mud/commit/1b86eac0530d069ff267f6fee8d6a71d6bbb365b)** (@latticexyz/store)

Changed the type of the output variable in the `slice4` function to `bytes4`.

**[fix(cli): mud set-version --link shouldn't fetch versions (#2000)](https://github.com/latticexyz/mud/commit/854de0761fd3744c2076a2b995f0f9274a8ef971)** (@latticexyz/cli)

Using `mud set-version --link` will no longer attempt to fetch the latest version from npm.

**[fix(store,world): fix mud config TS errors (#1974)](https://github.com/latticexyz/mud/commit/1077c7f53b6c0d6ea7663fe2722b0e768d407741)** (@latticexyz/store, @latticexyz/world)

Fixed an issue where `mud.config.ts` source file was not included in the package, causing TS errors downstream.

**[feat(store-indexer): command to run decoded indexer (#2001)](https://github.com/latticexyz/mud/commit/b00550cef2a3824dd38122a16b6e768bd88f9357)** (@latticexyz/store-indexer)

Added a script to run the decoded postgres indexer.

**[chore(store-indexer, store-sync): add explicit error logs (#2045)](https://github.com/latticexyz/mud/commit/0a3b9b1c9c821b153cb07281b585feb006ec621e)** (@latticexyz/store-indexer, @latticexyz/store-sync)

Added explicit error logs for unexpected situations.
Previously all `debug` logs were going to `stderr`, which made it hard to find the unexpected errors.
Now `debug` logs go to `stdout` and we can add explicit `stderr` logs.

**[chore(common): log benchmark to stderr (#2047)](https://github.com/latticexyz/mud/commit/933b54b5fcdd9400e21e8e0114bb4c691e830fec)** (@latticexyz/common)

The benchmark util now logs to `stdout` instead of `stderr`.

**[chore(world): add explicit visibility to coreSystem [N-07] (#2029)](https://github.com/latticexyz/mud/commit/f8dab7334d41d1a53dfad0bbd13a1bbe6fc0cbf8)** (@latticexyz/world)

Added explicit `internal` visibility to the `coreSystem` variable in `CoreModule`.

**[fix(world,world-modules): requireInterface correctly specifies ERC165 [M-02] (#2016)](https://github.com/latticexyz/mud/commit/1a0fa7974b493258c7fc8f0708c442ed548e227e)** (@latticexyz/world)

Fixed `requireInterface` to correctly specify ERC165.

**[feat(world): add isInstalled to Module (#2056)](https://github.com/latticexyz/mud/commit/eb384bb0e073b1261b8ab92bc74c32ec4956c886)** (@latticexyz/world-modules, @latticexyz/world)

Added `isInstalled` and `requireNotInstalled` helpers to `Module` base contract.

**[fix(store-sync): create table registration logs from indexer records (#1919)](https://github.com/latticexyz/mud/commit/712866f5fb392a4e39b59cd4565da61adc3c005f)** (@latticexyz/store-sync)

`createStoreSync` now correctly creates table registration logs from indexer records.

**[chore(store-indexer): setup Sentry middleware in indexer (#2054)](https://github.com/latticexyz/mud/commit/85d16e48b6b3d15fe895dba550fb8d176481e1cd)** (@latticexyz/store-indexer)

Added a Sentry middleware and `SENTRY_DNS` environment variable to the postgres indexer.

**[fix(world): register FunctionSignatures table [L-01] (#1841)](https://github.com/latticexyz/mud/commit/e5a962bc31086fc4c13bbb4aa049b7a14599b11d)** (@latticexyz/world)

`World` now correctly registers the `FunctionSignatures` table.

**[feat(store-indexer): replace fastify with koa (#2006)](https://github.com/latticexyz/mud/commit/c314badd13412a7a96692046b0402a00988994f1)** (@latticexyz/store-indexer)

Replaced Fastify with Koa for store-indexer frontends

**[fix(create-mud): include `.gitignore` files in created projects (#1945)](https://github.com/latticexyz/mud/commit/6963a9e85ea97b47be2edd199afa98100f728cf1)** (create-mud)

Templates now correctly include their respective `.gitignore` files

**[fix(cli): always rebuild IWorld ABI (#1929)](https://github.com/latticexyz/mud/commit/2699630c0e0c2027f331a9defe7f90a8968f7b3d)** (@latticexyz/cli)

Deploys will now always rebuild `IWorld.sol` interface (a workaround for https://github.com/foundry-rs/foundry/issues/6241)

**[build: allow use by TypeScript projects with `bundler`/`node16` config (#2084)](https://github.com/latticexyz/mud/commit/590542030e7500f8d3cce6e54e4961d9f8a1a6d5)** (@latticexyz/abi-ts, @latticexyz/block-logs-stream, @latticexyz/common, @latticexyz/config, @latticexyz/dev-tools, @latticexyz/faucet, @latticexyz/gas-report, @latticexyz/noise, @latticexyz/phaserx, @latticexyz/protocol-parser, @latticexyz/react, @latticexyz/recs, @latticexyz/schema-type, @latticexyz/services, @latticexyz/store-sync, @latticexyz/store, @latticexyz/utils, @latticexyz/world-modules, @latticexyz/world)

TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.

**[fix(store): onBeforeSpliceDynamicData receives the previous encoded lengths [M-01] (#2020)](https://github.com/latticexyz/mud/commit/6db95ce15e1c51422ca0494883210105c3e742ba)** (@latticexyz/store)

Fixed `StoreCore` to pass `previousEncodedLengths` into `onBeforeSpliceDynamicData`.

**[fix(store-indexer): disable prepared statements (#2058)](https://github.com/latticexyz/mud/commit/392c4b88d033d2d175541b974189a3f4da49e335)** (@latticexyz/store-indexer)

Disabled prepared statements for the postgres indexer, which led to issues in combination with `pgBouncer`.

**[chore: pipe debug logs to stdout, add separate util to pipe to stderr (#2044)](https://github.com/latticexyz/mud/commit/5d737cf2e7a1a305d7ef0bee99c07c17d80233c8)** (@latticexyz/abi-ts, @latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/faucet, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store)

Updated the `debug` util to pipe to `stdout` and added an additional util to explicitly pipe to `stderr` when needed.

**[chore(store-indexer): stringify filter in error log (#2048)](https://github.com/latticexyz/mud/commit/5ab67e3350bd08d15fbbe28c498cec62d2aaa116)** (@latticexyz/store-indexer)

The error log if no data is found in `/api/logs` is now stringifying the filter instead of logging `[object Object]`.

**[fix(store): fix potential memory corruption [M-04] (#1978)](https://github.com/latticexyz/mud/commit/5ac4c97f43756e3fca4ab01f6c881822100fa56d)** (@latticexyz/store)

Fixed M-04 Memory Corruption on Load From Storage
It only affected external use of `Storage.load` with a `memoryPointer` argument

**[chore(store,world): remove unused imports [N-05] (#2028)](https://github.com/latticexyz/mud/commit/e481717413a280e830b33b44a16c8c2475452b07)** (@latticexyz/store, @latticexyz/world)

Removed unused imports from various files in the `store` and `world` packages.

**[fix(store-indexer): add postgres-decoded-indexer binary (#2062)](https://github.com/latticexyz/mud/commit/735d957c6906e896e3e496158b9afd35da4688d4)** (@latticexyz/store-indexer)

Added a binary for the `postgres-decoded` indexer.

**[fix(world-modules): rename token address fields (#1986)](https://github.com/latticexyz/mud/commit/747d8d1b819882c1f84b8029fd4ade669f772322)** (@latticexyz/world-modules)

Renamed token address fields in ERC20 and ERC721 modules to `tokenAddress`

**[fix(react): trigger useComponentValue on deleted records (#1959)](https://github.com/latticexyz/mud/commit/9ef3f9a7c2ea52778027fb61988f876b590b22b0)** (@latticexyz/react)

Fixed an issue where `useComponentValue` would not detect a change and re-render if the component value was immediately removed.

**[fix(store-sync): use dynamic data in postgres decoded indexer (#1983)](https://github.com/latticexyz/mud/commit/34203e4ed88c2aa79f994b99a96be4fcff21ca06)** (@latticexyz/store-sync)

Fixed invalid value when decoding records in `postgres-decoded` storage adapter

**[fix(faucet): use MUD's sendTransaction for better nonce handling (#2080)](https://github.com/latticexyz/mud/commit/9082c179c5a1907cc79ec95543664e63fc327bb4)** (@latticexyz/faucet)

Updated to use MUD's `sendTransaction`, which does a better of managing nonces for higher volumes of transactions.

---

## Version 2.0.0-next.14

Release date: Fri Nov 10 2023

### Major changes

**[feat(dev-tools): show zustand tables (#1891)](https://github.com/latticexyz/mud/commit/1faf7f697481a92c02ca40edbf71e317de1c06e3)** (@latticexyz/store-sync)

`syncToZustand` now uses `tables` argument to populate the Zustand store's `tables` key, rather than the on-chain table registration events. This means we'll no longer store data into Zustand you haven't opted into receiving (e.g. other namespaces).

**[feat(store-indexer): separate postgres indexer/frontend services (#1887)](https://github.com/latticexyz/mud/commit/5ecccfe751b0d217f98a45e8e7fdc73d15ad6494)** (@latticexyz/store-indexer)

Separated frontend server and indexer service for Postgres indexer. Now you can run the Postgres indexer with one writer and many readers.

If you were previously using the `postgres-indexer` binary, you'll now need to run both `postgres-indexer` and `postgres-frontend`.

For consistency, the Postgres database logs are now disabled by default. If you were using these, please let us know so we can add them back in with an environment variable flag.

### Minor changes

**[feat(cli): warn when contract is over or close to the size limit (#1894)](https://github.com/latticexyz/mud/commit/bdb46fe3aa124014a53f1f070eb0db25771ace19)** (@latticexyz/cli)

Deploys now validate contract size before deploying and warns when a contract is over or close to the size limit (24kb). This should help identify the most common cause of "evm revert" errors during system and module contract deploys.

**[fix(store): resolveUserTypes for static arrays (#1876)](https://github.com/latticexyz/mud/commit/bb91edaa01c8a66fc3eef4d5c93ccd20ae9a5066)** (@latticexyz/schema-type)

Added `isSchemaAbiType` helper function to check and narrow an unknown string to the `SchemaAbiType` type

**[feat(dev-tools): show zustand tables (#1891)](https://github.com/latticexyz/mud/commit/1faf7f697481a92c02ca40edbf71e317de1c06e3)** (@latticexyz/dev-tools, create-mud)

Added Zustand support to Dev Tools:

```ts
const { syncToZustand } from "@latticexyz/store-sync";
const { mount as mountDevTools } from "@latticexyz/dev-tools";

const { useStore } = syncToZustand({ ... });

mountDevTools({
  ...
  useStore,
});
```

**[docs: add changeset for SystemboundDelegationControl (#1906)](https://github.com/latticexyz/mud/commit/fdbba6d88563034be607600a7af25b234f306103)** (@latticexyz/world-modules)

Added a new delegation control called `SystemboundDelegationControl` that delegates control of a specific system for some maximum number of calls. It is almost identical to `CallboundDelegationControl` except the delegatee can call the system with any function and args.

**[feat(store-indexer): add env var to index only one store (#1886)](https://github.com/latticexyz/mud/commit/f318f2fe736767230442f074fffd2d39c5629b38)** (@latticexyz/store-indexer)

Added `STORE_ADDRESS` environment variable to index only a specific MUD Store.

### Patch changes

**[fix(create-mud): pin prettier-plugin-solidity (#1889)](https://github.com/latticexyz/mud/commit/aacffcb59ad75826b33a437ce430ac0e8bfe0ddb)** (@latticexyz/common, create-mud)

Pinned prettier-plugin-solidity version to 1.1.3

**[fix(cli): add worldAddress to dev-contracts (#1892)](https://github.com/latticexyz/mud/commit/1feecf4955462554c650f56e4777aa330e31f667)** (@latticexyz/cli)

Added `--worldAddress` argument to `dev-contracts` CLI command so that you can develop against an existing world.

**[fix(store,world): explicit mud.config exports (#1900)](https://github.com/latticexyz/mud/commit/b2d2aa715b30cdbcddf8e442c663bd319235c209)** (@latticexyz/store, @latticexyz/world)

Added an explicit package export for `mud.config`

**[fix(store-sync): show TS error for non-existent tables when using zustand (#1896)](https://github.com/latticexyz/mud/commit/1327ea8c88f99fd268c743966dabed6122be098d)** (@latticexyz/store-sync)

Fixed `syncToZustand` types so that non-existent tables give an error and `never` type instead of a generic `Table` type.

**[fix(store): resolveUserTypes for static arrays (#1876)](https://github.com/latticexyz/mud/commit/bb91edaa01c8a66fc3eef4d5c93ccd20ae9a5066)** (@latticexyz/store)

Fixed `resolveUserTypes` for static arrays.
`resolveUserTypes` is used by `deploy`, which prevented deploying tables with static arrays.

**[docs(faucet): fix default port in readme (#1835)](https://github.com/latticexyz/mud/commit/9ad27046c5fbc814cb7d9339097eed96a922c083)** (@latticexyz/cli)

The `mud test` cli now exits with code 1 on test failure. It used to exit with code 0, which meant that CIs didn't notice test failures.

---

## Version 2.0.0-next.13

Release date: Thu Nov 02 2023

### Major changes

**[feat(utils): remove hash utils and ethers (#1783)](https://github.com/latticexyz/mud/commit/52182f70d350bb99cdfa6054cd6d181e58a91aa6)** (@latticexyz/utils)

Removed `keccak256` and `keccak256Coord` hash utils in favor of [viem's `keccak256`](https://viem.sh/docs/utilities/keccak256.html#keccak256).

```diff
- import { keccak256 } from "@latticexyz/utils";
+ import { keccak256, toHex } from "viem";

- const hash = keccak256("some string");
+ const hash = keccak256(toHex("some string"));
```

```diff
- import { keccak256Coord } from "@latticexyz/utils";
+ import { encodeAbiParameters, keccak256, parseAbiParameters } from "viem";

  const coord = { x: 1, y: 1 };
- const hash = keccak256Coord(coord);
+ const hash = keccak256(encodeAbiParameters(parseAbiParameters("int32, int32"), [coord.x, coord.y]));
```

**[feat(store-indexer,store-sync): filter by table and key (#1794)](https://github.com/latticexyz/mud/commit/f6d214e3d79f9591fddd3687aa987a57f417256c)** (@latticexyz/store-indexer)

Removed `tableIds` filter option in favor of the more flexible `filters` option that accepts `tableId` and an optional `key0` and/or `key1` to filter data by tables and keys.

If you were using an indexer client directly, you'll need to update your query:

```diff
  await indexer.findAll.query({
    chainId,
    address,
-   tableIds: ['0x...'],
+   filters: [{ tableId: '0x...' }],
  });
```

**[feat(create-mud): move react template to zustand, add react-ecs template (#1851)](https://github.com/latticexyz/mud/commit/78949f2c939ff5f743c026367c5978cb459f6f88)** (create-mud)

Replaced the `react` template with a basic task list app using the new Zustand storage adapter and sync method. This new template better demonstrates the different ways of building with MUD and has fewer concepts to learn (i.e. just tables and records, no more ECS).

For ECS-based React apps, you can use `react-ecs` template for the previous RECS storage adapter.

### Minor changes

**[feat(create-mud): replace concurrently with mprocs (#1862)](https://github.com/latticexyz/mud/commit/6288f9033b5f26124ab0ae3cde5934a7aef50f95)** (create-mud)

Updated templates to use [mprocs](https://github.com/pvolok/mprocs) instead of [concurrently](https://github.com/open-cli-tools/concurrently) for running dev scripts.

**[feat(store-sync): extra table definitions (#1840)](https://github.com/latticexyz/mud/commit/de47d698f031a28ef8d9e329e3cffc85e904c6a1)** (@latticexyz/store-sync)

Added an optional `tables` option to `syncToRecs` to allow you to sync from tables that may not be expressed by your MUD config. This will be useful for namespaced tables used by [ERC20](https://github.com/latticexyz/mud/pull/1789) and [ERC721](https://github.com/latticexyz/mud/pull/1844) token modules until the MUD config gains [namespace support](https://github.com/latticexyz/mud/issues/994).

Here's how we use this in our example project with the `KeysWithValue` module:

```ts
syncToRecs({
  ...
  tables: {
    KeysWithValue: {
      namespace: "keywval",
      name: "Inventory",
      tableId: resourceToHex({ type: "table", namespace: "keywval", name: "Inventory" }),
      keySchema: {
        valueHash: { type: "bytes32" },
      },
      valueSchema: {
        keysWithValue: { type: "bytes32[]" },
      },
    },
  },
  ...
});
```

**[feat(world-modules): add ERC721 module (#1844)](https://github.com/latticexyz/mud/commit/d7325e517ce18597d55e8bce41036e78e00c3a78)** (@latticexyz/world-modules)

Added the `ERC721Module` to `@latticexyz/world-modules`.
This module allows the registration of `ERC721` tokens in an existing World.

Important note: this module has not been audited yet, so any production use is discouraged for now.

````solidity
import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { ERC721MetadataData } from "@latticexyz/world-modules/src/modules/erc721-puppet/tables/ERC721Metadata.sol";
import { IERC721Mintable } from "@latticexyz/world-modules/src/modules/erc721-puppet/IERC721Mintable.sol";
import { registerERC721 } from "@latticexyz/world-modules/src/modules/erc721-puppet/registerERC721.sol";

// The ERC721 module requires the Puppet module to be installed first
world.installModule(new PuppetModule(), new bytes(0));

// After the Puppet module is installed, new ERC721 tokens can be registered
IERC721Mintable token = registerERC721(world, "myERC721", ERC721MetadataData({ name: "Token", symbol: "TKN", baseURI: "" }));```
````

**[feat(world-modules): add puppet module (#1793)](https://github.com/latticexyz/mud/commit/35348f831b923aed6e9bdf8b38bf337f3e944a48)** (@latticexyz/world-modules)

Added the `PuppetModule` to `@latticexyz/world-modules`. The puppet pattern allows an external contract to be registered as an external interface for a MUD system.
This allows standards like `ERC20` (that require a specific interface and events to be emitted by a unique contract) to be implemented inside a MUD World.

The puppet serves as a proxy, forwarding all calls to the implementation system (also called the "puppet master").
The "puppet master" system can emit events from the puppet contract.

```solidity
import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { createPuppet } from "@latticexyz/world-modules/src/modules/puppet/createPuppet.sol";

// Install the puppet module
world.installModule(new PuppetModule(), new bytes(0));

// Register a new puppet for any system
// The system must implement the `CustomInterface`,
// and the caller must own the system's namespace
CustomInterface puppet = CustomInterface(createPuppet(world, <systemId>));
```

**[feat(create-mud): enable MUD CLI debug logs (#1861)](https://github.com/latticexyz/mud/commit/b68e1699b52714561c9ac62fa593d0b6cd9fe656)** (create-mud)

Enabled MUD CLI debug logs for all templates.

**[feat(store-indexer,store-sync): filter by table and key (#1794)](https://github.com/latticexyz/mud/commit/f6d214e3d79f9591fddd3687aa987a57f417256c)** (@latticexyz/store-sync)

Added a `filters` option to store sync to allow filtering client data on tables and keys. Previously, it was only possible to filter on `tableIds`, but the new filter option allows for more flexible filtering by key.

If you are building a large MUD application, you can use positional keys as a way to shard data and make it possible to load only the data needed in the client for a particular section of your app. We're using this already in Sky Strife to load match-specific data into match pages without having to load data for all matches, greatly improving load time and client performance.

```ts
syncToRecs({
  ...
  filters: [{ tableId: '0x...', key0: '0x...' }],
});
```

The `tableIds` option is now deprecated and will be removed in the future, but is kept here for backwards compatibility.

**[feat(world-modules): add ERC20 module (#1789)](https://github.com/latticexyz/mud/commit/83638373450af5d8f703a183a74107ef7efb4152)** (@latticexyz/world-modules)

Added the `ERC20Module` to `@latticexyz/world-modules`.
This module allows the registration of `ERC20` tokens in an existing World.

Important note: this module has not been audited yet, so any production use is discouraged for now.

```solidity
import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { registerERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/registerERC20.sol";

// The ERC20 module requires the Puppet module to be installed first
world.installModule(new PuppetModule(), new bytes(0));

// After the Puppet module is installed, new ERC20 tokens can be registered
IERC20Mintable token = registerERC20(world, "myERC20", ERC20MetadataData({ decimals: 18, name: "Token", symbol: "TKN" }));
```

**[feat(store-sync): sync to zustand (#1843)](https://github.com/latticexyz/mud/commit/fa77635839e760a9de5fc8959ee492b7a4d8a7cd)** (@latticexyz/store-sync)

Added a Zustand storage adapter and corresponding `syncToZustand` method for use in vanilla and React apps. It's used much like the other sync methods, except it returns a bound store and set of typed tables.

```ts
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import config from "contracts/mud.config";

const { tables, useStore, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToZustand({
  config,
  ...
});

// in vanilla apps
const positions = useStore.getState().getRecords(tables.Position);

// in React apps
const positions = useStore((state) => state.getRecords(tables.Position));
```

This change will be shortly followed by an update to our templates that uses Zustand as the default client data store and sync method.

**[feat(store): add experimental config resolve helper (#1826)](https://github.com/latticexyz/mud/commit/b1d41727d4b1964ad3cd907c1c2126b02172b413)** (@latticexyz/common)

Added a `mapObject` helper to map the value of each property of an object to a new value.

### Patch changes

**[fix(create-mud): set store address in PostDeploy script (#1817)](https://github.com/latticexyz/mud/commit/c5148da763645e0adc1250245ea447904014bef2)** (create-mud)

Updated templates' PostDeploy script to set store address so that tables can be used directly inside PostDeploy.

**[fix(create-mud): workaround create-create-app templating (#1863)](https://github.com/latticexyz/mud/commit/1b33a915c56247599c19c5de04090b776b87d561)** (create-mud)

Fixed an issue when creating a new project from the `react` app, where React's expressions were overlapping with Handlebars expressions (used by our template command).

**[fix(cli): change import order so .env file is loaded first (#1860)](https://github.com/latticexyz/mud/commit/21a626ae9bd79f1a275edc70b43d19ed43f48131)** (@latticexyz/cli)

Changed `mud` CLI import order so that environment variables from the `.env` file are loaded before other imports.

**[fix(common,config): remove chalk usage (#1824)](https://github.com/latticexyz/mud/commit/3e057061da17dd2d0c5fd23e6f5a027bdf9a9223)** (@latticexyz/common, @latticexyz/config)

Removed chalk usage from modules imported in client fix downstream client builds (vite in particular).

---

## Version 2.0.0-next.12

Release date: Fri Oct 20 2023

### Major changes

**[feat(store): default off storeArgument (#1741)](https://github.com/latticexyz/mud/commit/7ce82b6fc6bbf390ae159fe990d5d4fca5a4b0cb)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world-modules, @latticexyz/world, create-mud)

Store config now defaults `storeArgument: false` for all tables. This means that table libraries, by default, will no longer include the extra functions with the `_store` argument. This default was changed to clear up the confusion around using table libraries in tests, `PostDeploy` scripts, etc.

If you are sure you need to manually specify a store when interacting with tables, you can still manually toggle it back on with `storeArgument: true` in the table settings of your MUD config.

If you want to use table libraries in `PostDeploy.s.sol`, you can add the following lines:

```diff
  import { Script } from "forge-std/Script.sol";
  import { console } from "forge-std/console.sol";
  import { IWorld } from "../src/codegen/world/IWorld.sol";
+ import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

  contract PostDeploy is Script {
    function run(address worldAddress) external {
+     StoreSwitch.setStoreAddress(worldAddress);
+
+     SomeTable.get(someKey);
```

**[feat(cli): declarative deployment (#1702)](https://github.com/latticexyz/mud/commit/29c3f5087017dbc9dc2c9160e10bfbac5806741f)** (@latticexyz/cli)

`deploy`, `test`, `dev-contracts` were overhauled using a declarative deployment approach under the hood. Deploys are now idempotent and re-running them will introspect the world and figure out the minimal changes necessary to bring the world into alignment with its config: adding tables, adding/upgrading systems, changing access control, etc.

The following CLI arguments are now removed from these commands:

- `--debug` (you can now adjust CLI output with `DEBUG` environment variable, e.g. `DEBUG=mud:*`)
- `--priorityFeeMultiplier` (now calculated automatically)
- `--disableTxWait` (everything is now parallelized with smarter nonce management)
- `--pollInterval` (we now lean on viem defaults and we don't wait/poll until the very end of the deploy)

Most deployment-in-progress logs are now behind a [debug](https://github.com/debug-js/debug) flag, which you can enable with a `DEBUG=mud:*` environment variable.

**[feat(world-modules): only install modules once (#1756)](https://github.com/latticexyz/mud/commit/6ca1874e02161c8feb08b5fafb20b57ce0c8fe72)** (@latticexyz/world-modules)

Modules now revert with `Module_AlreadyInstalled` if attempting to install more than once with the same calldata.

This is a temporary workaround for our deploy pipeline. We'll make these install steps more idempotent in the future.

### Minor changes

**[docs(world): add changeset for system call helpers (#1747)](https://github.com/latticexyz/mud/commit/7fa2ca1831234b54a55c20632d29877e5e711eb7)** (@latticexyz/world)

Added TS helpers for calling systems dynamically via the World.

- `encodeSystemCall` for `world.call`

  ```ts
  worldContract.write.call(encodeSystemCall({
    abi: worldContract.abi,
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }));
  ```

- `encodeSystemCallFrom` for `world.callFrom`

  ```ts
  worldContract.write.callFrom(encodeSystemCallFrom({
    abi: worldContract.abi,
    from: "0x...",
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }));
  ```

- `encodeSystemCalls` for `world.batchCall`

  ```ts
  worldContract.write.batchCall(encodeSystemCalls(abi, [{
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }]));
  ```

- `encodeSystemCallsFrom` for `world.batchCallFrom`
  ```ts
  worldContract.write.batchCallFrom(encodeSystemCallsFrom(abi, "0x...", [{
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }]));
  ```

**[feat(world-modules): only install modules once (#1756)](https://github.com/latticexyz/mud/commit/6ca1874e02161c8feb08b5fafb20b57ce0c8fe72)** (@latticexyz/world)

Added a `Module_AlreadyInstalled` error to `IModule`.

**[feat(common): add sendTransaction, add mempool queue to nonce manager (#1717)](https://github.com/latticexyz/mud/commit/0660561545910b03f8358e5ed7698f74e64f955b)** (@latticexyz/common)

- Added a `sendTransaction` helper to mirror viem's `sendTransaction`, but with our nonce manager
- Added an internal mempool queue to `sendTransaction` and `writeContract` for better nonce handling
- Defaults block tag to `pending` for transaction simulation and transaction count (when initializing the nonce manager)

**[feat(cli): add `--alwaysPostDeploy` flag to deploys (#1765)](https://github.com/latticexyz/mud/commit/ccc21e91387cb09de9dc56729983776eb9bcdcc4)** (@latticexyz/cli)

Added a `--alwaysRunPostDeploy` flag to deploys (`deploy`, `test`, `dev-contracts` commands) to always run `PostDeploy.s.sol` script after each deploy. By default, `PostDeploy.s.sol` is only run once after a new world is deployed.

This is helpful if you want to continue a deploy that may not have finished (due to an error or otherwise) or to run deploys with an idempotent `PostDeploy.s.sol` script.

**[feat(abi-ts): move logs to debug (#1736)](https://github.com/latticexyz/mud/commit/ca32917519eb9065829f11af105abbbb31d6efa2)** (@latticexyz/abi-ts)

Moves log output behind a debug flag. You can enable logging with `DEBUG=abi-ts` environment variable.

**[feat(cli): remove forge clean from deploy (#1759)](https://github.com/latticexyz/mud/commit/e667ee808b5362ff215ba3faea028b526660eccb)** (@latticexyz/cli)

CLI `deploy`, `test`, `dev-contracts` no longer run `forge clean` before each deploy. We previously cleaned to ensure no outdated artifacts were checked into git (ABIs, typechain types, etc.). Now that all artifacts are gitignored, we can let forge use its cache again.

**[feat(common): clarify resourceId (hex) from resource (object) (#1706)](https://github.com/latticexyz/mud/commit/d2f8e940048e56d9be204bf5b2cbcf8d29cc1dee)** (@latticexyz/common)

Renames `resourceIdToHex` to `resourceToHex` and `hexToResourceId` to `hexToResource`, to better distinguish between a resource ID (hex value) and a resource reference (type, namespace, name).

```diff
- resourceIdToHex({ type: 'table', namespace: '', name: 'Position' });
+ resourceToHex({ type: 'table', namespace: '', name: 'Position' });
```

```diff
- hexToResourceId('0x...');
+ hexToResource('0x...');
```

Previous methods still exist but are now deprecated to ease migration and reduce breaking changes. These will be removed in a future version.

Also removes the previously deprecated and unused table ID utils (replaced by these resource ID utils).

**[feat(cli): remove .mudtest file in favor of env var (#1722)](https://github.com/latticexyz/mud/commit/25086be5f34d7289f21395595ac8a6aeabfe9b7c)** (@latticexyz/cli, @latticexyz/common, @latticexyz/world)

Replaced temporary `.mudtest` file in favor of `WORLD_ADDRESS` environment variable when running tests with `MudTest` contract

**[feat(faucet,store-indexer): add k8s healthcheck endpoints (#1739)](https://github.com/latticexyz/mud/commit/1d0f7e22b7fb8f6295b149a6584933a3a657ec08)** (@latticexyz/faucet, @latticexyz/store-indexer)

Added `/healthz` and `/readyz` healthcheck endpoints for Kubernetes

**[feat(cli): add retries to deploy (#1766)](https://github.com/latticexyz/mud/commit/e1dc88ebe7f66e4ece13805643e932e038863b6e)** (@latticexyz/cli)

Transactions sent via deploy will now be retried a few times before giving up. This hopefully helps with large deploys on some chains.

### Patch changes

**[fix(cli): don't bail dev-contracts during deploy failure (#1808)](https://github.com/latticexyz/mud/commit/3bfee32cf4d036a73b35f059e0159f1b7a7088e9)** (@latticexyz/cli)

`dev-contracts` will no longer bail when there was an issue with deploying (e.g. typo in contracts) and instead wait for file changes before retrying.

**[feat(store): parallelize table codegen (#1754)](https://github.com/latticexyz/mud/commit/f62c767e7ff3bda807c592d85227221a00dd9353)** (@latticexyz/store)

Parallelized table codegen. Also put logs behind debug flag, which can be enabled using the `DEBUG=mud:*` environment variable.

**[fix(cli): handle module already installed (#1769)](https://github.com/latticexyz/mud/commit/4e2a170f9185a03c2c504912e3d738f06b45137b)** (@latticexyz/cli)

Deploys now continue if they detect a `Module_AlreadyInstalled` revert error.

**[fix(cli): deploy systems/modules before registering/installing them (#1767)](https://github.com/latticexyz/mud/commit/61c6ab70555dc29e8e9428212ee710d7af681cc9)** (@latticexyz/cli)

Changed deploy order so that system/module contracts are fully deployed before registering/installing them on the world.

**[fix(cli): run worldgen with deploy (#1807)](https://github.com/latticexyz/mud/commit/69d55ce3265e10a1ae62ddca9e32e34f1cd52dea)** (@latticexyz/cli)

Deploy commands (`deploy`, `dev-contracts`, `test`) now correctly run `worldgen` to generate system interfaces before deploying.

**[feat(store): parallelize table codegen (#1754)](https://github.com/latticexyz/mud/commit/f62c767e7ff3bda807c592d85227221a00dd9353)** (@latticexyz/common)

Moved some codegen to use `fs/promises` for better parallelism.

**[fix(cli): support enums in deploy, only deploy modules/systems once (#1749)](https://github.com/latticexyz/mud/commit/4fe079309fae04ffd2e611311937906f65bf91e6)** (@latticexyz/cli)

Fixed a few issues with deploys:

- properly handle enums in MUD config
- only deploy each unique module/system once
- waits for transactions serially instead of in parallel, to avoid RPC errors

**[feat(cli,create-mud): use forge cache (#1777)](https://github.com/latticexyz/mud/commit/d844cd441c40264ddc90d023e4354adea617febd)** (@latticexyz/cli, create-mud)

Sped up builds by using more of forge's cache.

Previously we'd build only what we needed because we would check in ABIs and other build artifacts into git, but that meant that we'd get a lot of forge cache misses. Now that we no longer need these files visible, we can take advantage of forge's caching and greatly speed up builds, especially incremental ones.

**[feat(cli): declarative deployment (#1702)](https://github.com/latticexyz/mud/commit/29c3f5087017dbc9dc2c9160e10bfbac5806741f)** (@latticexyz/world)

With [resource types in resource IDs](https://github.com/latticexyz/mud/pull/1544), the World config no longer requires table and system names to be unique.

**[feat(common): clarify resourceId (hex) from resource (object) (#1706)](https://github.com/latticexyz/mud/commit/d2f8e940048e56d9be204bf5b2cbcf8d29cc1dee)** (@latticexyz/cli, @latticexyz/dev-tools, @latticexyz/store-sync)

Moved to new resource ID utils.

---

## Version 2.0.0-next.11

### Major changes

**[feat(cli): remove backup/restore/force options from set-version (#1687)](https://github.com/latticexyz/mud/commit/3d0b3edb46b266fccb40e26e8243d7628bea8baf)** (@latticexyz/cli)

Removes `.mudbackup` file handling and `--backup`, `--restore`, and `--force` options from `mud set-version` command.

To revert to a previous MUD version, use `git diff` to find the version that you changed from and want to revert to and run `pnpm mud set-version <prior-version>` again.

### Minor changes

**[feat(world-modules): add SystemSwitch util (#1665)](https://github.com/latticexyz/mud/commit/9352648b19800f28b1d96ec448283808342a41f7)** (@latticexyz/world-modules)

Since [#1564](https://github.com/latticexyz/mud/pull/1564) the World can no longer call itself via an external call.
This made the developer experience of calling other systems via root systems worse, since calls from root systems are executed from the context of the World.
The recommended approach is to use `delegatecall` to the system if in the context of a root system, and an external call via the World if in the context of a non-root system.
To bring back the developer experience of calling systems from other sysyems without caring about the context in which the call is executed, we added the `SystemSwitch` util.

```diff
- // Instead of calling the system via an external call to world...
- uint256 value = IBaseWorld(_world()).callMySystem();

+ // ...you can now use the `SystemSwitch` util.
+ // This works independent of whether used in a root system or non-root system.
+ uint256 value = abi.decode(SystemSwitch.call(abi.encodeCall(IBaseWorld.callMySystem, ()), (uint256));
```

Note that if you already know your system is always executed as non-root system, you can continue to use the approach of calling other systems via the `IBaseWorld(world)`.

**[refactor(common): move `createContract`'s internal write logic to `writeContract` (#1693)](https://github.com/latticexyz/mud/commit/d075f82f30f4969a353e4ea29ca2a25a04810523)** (@latticexyz/common)

- Moves contract write logic out of `createContract` into its own `writeContract` method so that it can be used outside of the contract instance, and for consistency with viem.
- Deprecates `createContract` in favor of `getContract` for consistency with viem.
- Reworks `createNonceManager`'s `BroadcastChannel` setup and moves out the notion of a "nonce manager ID" to `getNonceManagerId` so we can create an internal cache with `getNonceManager` for use in `writeContract`.

If you were using the `createNonceManager` before, you'll just need to rename `publicClient` argument to `client`:

```diff
  const publicClient = createPublicClient({ ... });
- const nonceManager = createNonceManager({ publicClient, ... });
+ const nonceManager = createNonceManager({ client: publicClient, ... });
```

**[feat(gas-reporter): allow gas-reporter to parse stdin (#1688)](https://github.com/latticexyz/mud/commit/4385c5a4c0e2d5550c041acc4386ae7fc1cb4b7e)** (@latticexyz/gas-report)

Allow the `gas-report` CLI to parse logs via `stdin`, so it can be used with custom test commands (e.g. `mud test`).

Usage:

```sh
# replace `forge test -vvv` with the custom test command
GAS_REPORTER_ENABLED=true forge test -vvv | pnpm gas-report --stdin
```

### Patch changes

**[feat(store-sync): export postgres column type helpers (#1699)](https://github.com/latticexyz/mud/commit/08d7c471f9a2f4d6c237641eea316313d010373c)** (@latticexyz/store-sync)

Export postgres column type helpers from `@latticexyz/store-sync`.

**[fix(common): workaround for zero base fee (#1689)](https://github.com/latticexyz/mud/commit/16b13ea8fc5e7f63ce08bc6baa2087cab9c8089f)** (@latticexyz/common)

Adds viem workaround for zero base fee used by MUD's anvil config

**[fix(world): register store namespace during initialization (#1712)](https://github.com/latticexyz/mud/commit/430e6b29a9207122d48e386925bdb9fc12c201b9)** (@latticexyz/world)

Register the `store` namespace in the `CoreModule`.
Since namespaces are a World concept, registering the Store's internal tables does not automatically register the Store's namespace, so we do this manually during initialization in the `CoreModule`.

**[build: bump viem and abitype (#1684)](https://github.com/latticexyz/mud/commit/f99e889872e6881bf32bcb9a605b8b5c1b05fac4)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/faucet, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/store-indexer, @latticexyz/store-sync, @latticexyz/store, create-mud)

Bump viem to 1.14.0 and abitype to 0.9.8

**[feat(gas-report): add more logs to stdin piping (#1694)](https://github.com/latticexyz/mud/commit/ba17bdab5c8b2a3aa56e86722134174e2799ddfa)** (@latticexyz/gas-report)

Pass through `stdin` logs in `gas-report`. Since the script piping in logs to `gas-report` can be long-running, it is useful to see its logs to know if it's stalling.

**[fix(protocol-parser): allow arbitrary key order when encoding values (#1674)](https://github.com/latticexyz/mud/commit/a2f41ade977a5374c400ef8bfc2cb8c8698f185e)** (@latticexyz/protocol-parser)

Allow arbitrary key order when encoding values

---

## Version 2.0.0-next.10

### Major changes

**[refactor(world): expose library for WorldContextConsumer (#1624)](https://github.com/latticexyz/mud/commit/88b1a5a191b4adadf190de51cd47a5b033b6fb29)** (@latticexyz/world-modules, @latticexyz/world)

We now expose a `WorldContextConsumerLib` library with the same functionality as the `WorldContextConsumer` contract, but the ability to be used inside of internal libraries.
We also renamed the `WorldContextProvider` library to `WorldContextProviderLib` for consistency.

### Minor changes

**[docs: changeset for indexer/store sync table IDs param (#1662)](https://github.com/latticexyz/mud/commit/4081493b84ab5c78a5147d4af8d41fc2d9e027a5)** (@latticexyz/store-indexer, @latticexyz/store-sync)

Added a `tableIds` parameter to store sync methods and indexer to allow filtering data streams by table IDs. Store sync methods automatically include all internal table IDs from Store and World.

```ts
import { syncToRecs } from "@latticexyz/store-sync/recs";
import { resourceIdToHex } from "@latticexyz/common";

syncToRecs({
  ...
  tableIds: [resourceIdToHex(...)],
});
```

```ts
import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";
import { resourceIdToHex } from "@latticexyz/common";

const client = createIndexerClient({ ... });
client.findAll({
  ...
  tableIds: [resourceIdToHex(...)],
});
```

**[feat(world): return world address from WorldFactory (#1675)](https://github.com/latticexyz/mud/commit/7987c94d61a2c759916a708774db9f3cf08edca8)** (@latticexyz/world)

Return address of the newly created World from `WorldFactory.deployWorld`.

### Patch changes

**[fix(cli): fix table IDs for module install (#1663)](https://github.com/latticexyz/mud/commit/87235a21b28fc831b5fb7a1546835ef08bd51655)** (@latticexyz/cli)

Fix table IDs for module install step of deploy

**[fix(cli): register namespace with namespaceId (#1619)](https://github.com/latticexyz/mud/commit/1d403962283c5b5f62410867be01f6adff277f41)** (@latticexyz/cli)

We fixed a bug in the deploy script that would cause the deployment to fail if a non-root namespace was used in the config.

---

## Version 2.0.0-next.9

### Major changes

**[feat(world): move interfaces/factories to root (#1606)](https://github.com/latticexyz/mud/commit/77dce993a12989dc58534ccf1a8928b156be494a)** (@latticexyz/world)

Moves World interfaces and factories files for consistency with our other packages.

If you import any World interfaces or factories directly, you'll need to update the import path:

```diff
- import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
+ import { IBaseWorld } from "@latticexyz/world/src/IBaseWorld.sol";
```

```diff
- import { IBaseWorld } from "@latticexyz/world/src/factories/WorldFactory.sol";
+ import { IBaseWorld } from "@latticexyz/world/src/WorldFactory.sol";
```

**[feat(world): prevent the `World` from calling itself (#1563)](https://github.com/latticexyz/mud/commit/748f4588a218928bca041760448c26991c0d8033)** (@latticexyz/world)

All `World` methods now revert if the `World` calls itself.
The `World` should never need to externally call itself, since all internal table operations happen via library calls, and all root system operations happen via delegate call.

It should not be possible to make the `World` call itself as an external actor.
If it were possible to make the `World` call itself, it would be possible to write to internal tables that only the `World` should have access to.
As this is a very important invariance, we made it explicit in a requirement check in every `World` method, rather than just relying on making it impossible to trigger the `World` to call itself.

This is a breaking change for modules that previously used external calls to the `World` in the `installRoot` method.
In the `installRoot` method, the `World` can only be called via `delegatecall`, and table operations should be performed via the internal table methods (e.g. `_set` instead of `set`).

Example for how to replace external calls to `world` in root systems / root modules (`installRoot`) with `delegatecall`:

```diff
+ import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

- world.grantAccess(tableId, address(hook));
+ (bool success, bytes memory returnData) = address(world).delegatecall(
+   abi.encodeCall(world.grantAccess, (tableId, address(hook)))
+ );

+ if (!success) revertWithBytes(returnData);
```

**[feat: rename schema to valueSchema (#1482)](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9)** (@latticexyz/cli, @latticexyz/protocol-parser, @latticexyz/store-sync, @latticexyz/store, create-mud)

Renamed all occurrences of `schema` where it is used as "value schema" to `valueSchema` to clearly distinguish it from "key schema".
The only breaking change for users is the change from `schema` to `valueSchema` in `mud.config.ts`.

```diff
// mud.config.ts
export default mudConfig({
  tables: {
    CounterTable: {
      keySchema: {},
-     schema: {
+     valueSchema: {
        value: "uint32",
      },
    },
  }
}
```

**[refactor(world): move codegen files (#1592)](https://github.com/latticexyz/mud/commit/c07fa021501ff92be35c0491dd89bbb8161e1c07)** (@latticexyz/cli, @latticexyz/world-modules, @latticexyz/world)

Tables and interfaces in the `world` package are now generated to the `codegen` folder.
This is only a breaking change if you imported tables or codegenerated interfaces from `@latticexyz/world` directly.
If you're using the MUD CLI, the changed import paths are already integrated and no further changes are necessary.

```diff
- import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
+ import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

```

**[refactor(store): always render field methods with suffix and conditionally without (#1550)](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e)** (@latticexyz/common)

- Add `renderWithFieldSuffix` helper method to always render a field function with a suffix, and optionally render the same function without a suffix.
- Remove `methodNameSuffix` from `RenderField` interface, because the suffix is now computed as part of `renderWithFieldSuffix`.

**[feat(store,): add splice events (#1354)](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853)** (@latticexyz/store, @latticexyz/world)

We've updated Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexers and sync strategies.

If you've written your own sync logic or are interacting with Store calls directly, this is a breaking change. We have a few more breaking protocol changes upcoming, so you may hold off on upgrading until those land.

If you are using MUD's built-in tooling (table codegen, indexer, store sync, etc.), you don't have to make any changes except upgrading to the latest versions and deploying a fresh World.

- The `data` field in each `StoreSetRecord` and `StoreEphemeralRecord` has been replaced with three new fields: `staticData`, `encodedLengths`, and `dynamicData`. This better reflects the on-chain state and makes it easier to perform modifications to the raw bytes. We recommend storing each of these fields individually in your off-chain storage of choice (indexer, client, etc.).

  ```diff
  - event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
  + event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData);

  - event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
  + event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData);
  ```

- The `StoreSetField` event is now replaced by two new events: `StoreSpliceStaticData` and `StoreSpliceDynamicData`. Splicing allows us to perform efficient operations like push and pop, in addition to replacing a field value. We use two events because updating a dynamic-length field also requires updating the record's `encodedLengths` (aka PackedCounter).

  ```diff
  - event StoreSetField(bytes32 tableId, bytes32[] keyTuple, uint8 fieldIndex, bytes data);
  + event StoreSpliceStaticData(bytes32 tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data);
  + event StoreSpliceDynamicData(bytes32 tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data, bytes32 encodedLengths);
  ```

Similarly, Store setter methods (e.g. `setRecord`) have been updated to reflect the `data` to `staticData`, `encodedLengths`, and `dynamicData` changes. We'll be following up shortly with Store getter method changes for more gas efficient storage reads.

**[refactor(store): change argument order on `Store_SpliceDynamicData` and hooks for consistency (#1589)](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2)** (@latticexyz/store)

The argument order on `Store_SpliceDynamicData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData` has been changed to match the argument order on `Store_SetRecord`,
where the `PackedCounter encodedLength` field comes before the `bytes dynamicData` field.

```diff
IStore {
  event Store_SpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
+   PackedCounter encodedLengths,
    bytes data,
-   PackedCounter encodedLengths
  );
}

IStoreHook {
  function onBeforeSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
+   PackedCounter encodedLengths,
    bytes memory data,
-   PackedCounter encodedLengths
  ) external;

  function onAfterSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
+   PackedCounter encodedLengths,
    bytes memory data,
-   PackedCounter encodedLengths
  ) external;
}
```

**[feat(store,): add splice events (#1354)](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853)** (@latticexyz/common, @latticexyz/protocol-parser)

`readHex` was moved from `@latticexyz/protocol-parser` to `@latticexyz/common`

**[feat(store,world): move hooks to bit flags (#1527)](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8)** (@latticexyz/store, @latticexyz/world)

Moved the registration of store hooks and systems hooks to bitmaps with bitwise operator instead of a struct.

```diff
- import { StoreHookLib } from "@latticexyz/src/StoreHook.sol";
+ import {
+   BEFORE_SET_RECORD,
+   BEFORE_SET_FIELD,
+   BEFORE_DELETE_RECORD
+ } from "@latticexyz/store/storeHookTypes.sol";

  StoreCore.registerStoreHook(
    tableId,
    subscriber,
-   StoreHookLib.encodeBitmap({
-     onBeforeSetRecord: true,
-     onAfterSetRecord: false,
-     onBeforeSetField: true,
-     onAfterSetField: false,
-     onBeforeDeleteRecord: true,
-     onAfterDeleteRecord: false
-   })
+   BEFORE_SET_RECORD | BEFORE_SET_FIELD | BEFORE_DELETE_RECORD
  );
```

```diff
- import { SystemHookLib } from "../src/SystemHook.sol";
+ import { BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "../src/systemHookTypes.sol";

  world.registerSystemHook(
    systemId,
    subscriber,
-   SystemHookLib.encodeBitmap({ onBeforeCallSystem: true, onAfterCallSystem: true })
+   BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM
  );

```

**[feat(store,world): add splice hooks, expose spliceStaticData, spliceDynamicData (#1531)](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4)** (@latticexyz/store, @latticexyz/world)

- The `IStoreHook` interface was changed to replace `onBeforeSetField` and `onAfterSetField` with `onBeforeSpliceStaticData`, `onAfterSpliceStaticData`, `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData`.

  This new interface matches the new `StoreSpliceStaticData` and `StoreSpliceDynamicData` events, and avoids having to read the entire field from storage when only a subset of the field was updated
  (e.g. when pushing elements to a field).

  ```diff
  interface IStoreHook {
  - function onBeforeSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  - function onAfterSetField(
  -   bytes32 tableId,
  -   bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  -   bytes memory data,
  -   FieldLayout fieldLayout
  - ) external;

  + function onBeforeSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onAfterSpliceStaticData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint48 start,
  +   uint40 deleteCount,
  +   bytes memory data
  + ) external;

  + function onBeforeSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;

  + function onAfterSpliceDynamicData(
  +   bytes32 tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex,
  +   uint40 startWithinField,
  +   uint40 deleteCount,
  +   bytes memory data,
  +   PackedCounter encodedLengths
  + ) external;
  }
  ```

- All `calldata` parameters on the `IStoreHook` interface were changed to `memory`, since the functions are called with `memory` from the `World`.

- `IStore` exposes two new functions: `spliceStaticData` and `spliceDynamicData`.

  These functions provide lower level access to the operations happening under the hood in `setField`, `pushToField`, `popFromField` and `updateInField` and simplify handling
  the new splice hooks.

  `StoreCore`'s internal logic was simplified to use the `spliceStaticData` and `spliceDynamicData` functions instead of duplicating similar logic in different functions.

  ```solidity
  interface IStore {
    // Splice data in the static part of the record
    function spliceStaticData(
      bytes32 tableId,
      bytes32[] calldata keyTuple,
      uint48 start,
      uint40 deleteCount,
      bytes calldata data
    ) external;

    // Splice data in the dynamic part of the record
    function spliceDynamicData(
      bytes32 tableId,
      bytes32[] calldata keyTuple,
      uint8 dynamicFieldIndex,
      uint40 startWithinField,
      uint40 deleteCount,
      bytes calldata data
    ) external;
  }
  ```

**[feat: replace Schema with FieldLayout for contract internals (#1336)](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e)** (@latticexyz/cli, @latticexyz/protocol-parser, @latticexyz/store, @latticexyz/world)

- Add `FieldLayout`, which is a `bytes32` user-type similar to `Schema`.

  Both `FieldLayout` and `Schema` have the same kind of data in the first 4 bytes.

  - 2 bytes for total length of all static fields
  - 1 byte for number of static size fields
  - 1 byte for number of dynamic size fields

  But whereas `Schema` has `SchemaType` enum in each of the other 28 bytes, `FieldLayout` has static byte lengths in each of the other 28 bytes.

- Replace `Schema valueSchema` with `FieldLayout fieldLayout` in Store and World contracts.

  `FieldLayout` is more gas-efficient because it already has lengths, and `Schema` has types which need to be converted to lengths.

- Add `getFieldLayout` to `IStore` interface.

  There is no `FieldLayout` for keys, only for values, because key byte lengths aren't usually relevant on-chain. You can still use `getKeySchema` if you need key types.

- Add `fieldLayoutToHex` utility to `protocol-parser` package.

- Add `constants.sol` for constants shared between `FieldLayout`, `Schema` and `PackedCounter`.

**[refactor: separate data into staticData, encodedLengths, dynamicData in getRecord (#1532)](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623)** (@latticexyz/store, @latticexyz/world)

Store's `getRecord` has been updated to return `staticData`, `encodedLengths`, and `dynamicData` instead of a single `data` blob, to match the new behaviour of Store setter methods.

If you use codegenerated libraries, you will only need to update `encode` calls.

```diff
- bytes memory data = Position.encode(x, y);
+ (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = Position.encode(x, y);
```

**[feat(world): add `FunctionSignatures` offchain table (#1575)](https://github.com/latticexyz/mud/commit/e5d208e40b2b2fae223b48716ce3f62c530ea1ca)** (@latticexyz/cli, @latticexyz/world)

The `registerRootFunctionSelector` function's signature was changed to accept a `string functionSignature` parameter instead of a `bytes4 functionSelector` parameter.
This change enables the `World` to store the function signatures of all registered functions in a `FunctionSignatures` offchain table, which will allow for the automatic generation of interfaces for a given `World` address in the future.

```diff
IBaseWorld {
  function registerRootFunctionSelector(
    ResourceId systemId,
-   bytes4 worldFunctionSelector,
+   string memory worldFunctionSignature,
    bytes4 systemFunctionSelector
  ) external returns (bytes4 worldFunctionSelector);
}
```

**[feat: move forge build + abi + abi-ts to out (#1483)](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab)** (@latticexyz/store, @latticexyz/world)

Store and World contract ABIs are now exported from the `out` directory. You'll need to update your imports like:

```diff
- import IBaseWorldAbi from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorldAbi.json";
+ import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorldAbi.json";
```

`MudTest.sol` was also moved to the World package. You can update your import like:

```diff
- import { MudTest } from "@latticexyz/store/src/MudTest.sol";
+ import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
```

**[feat(common,store): add support for user-defined types (#1566)](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9)** (@latticexyz/store)

These breaking changes only affect store utilities, you aren't affected if you use `@latticexyz/cli` codegen scripts.

- Add `remappings` argument to the `tablegen` codegen function, so that it can read user-provided files.
- In `RenderTableOptions` change the type of `imports` from `RelativeImportDatum` to `ImportDatum`, to allow passing absolute imports to the table renderer.
- Add `solidityUserTypes` argument to several functions that need to resolve user or abi types: `resolveAbiOrUserType`, `importForAbiOrUserType`, `getUserTypeInfo`.
- Add `userTypes` config option to MUD config, which takes user types mapped to file paths from which to import them.

**[refactor(store): always render field methods with suffix and conditionally without (#1550)](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e)** (@latticexyz/store)

- Always render field methods with a suffix in tablegen (they used to not be rendered if field methods without a suffix were rendered).
- Add `withSuffixlessFieldMethods` to `RenderTableOptions`, which indicates that field methods without a suffix should be rendered.

**[refactor(store,world): move around interfaces and base contracts (#1602)](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840)** (@latticexyz/store, @latticexyz/world)

- Moves Store events into its own `IStoreEvents` interface
- Moves Store interfaces to their own files
- Adds a `StoreData` abstract contract to initialize a Store and expose the Store version

If you're using MUD out of the box, you won't have to make any changes. You will only need to update if you're using any of the base Store interfaces.

**[feat(world): change registerFunctionSelector signature to accept system signature as a single string (#1574)](https://github.com/latticexyz/mud/commit/31ffc9d5d0a6d030cc61349f0f8fbcf6748ebc48)** (@latticexyz/cli, @latticexyz/world)

The `registerFunctionSelector` function now accepts a single `functionSignature` string paramemer instead of separating function name and function arguments into separate parameters.

```diff
IBaseWorld {
  function registerFunctionSelector(
    ResourceId systemId,
-   string memory systemFunctionName,
-   string memory systemFunctionArguments
+   string memory systemFunctionSignature
  ) external returns (bytes4 worldFunctionSelector);
}
```

This is a breaking change if you were manually registering function selectors, e.g. in a `PostDeploy.s.sol` script or a module.
To upgrade, simply replace the separate `systemFunctionName` and `systemFunctionArguments` parameters with a single `systemFunctionSignature` parameter.

```diff
  world.registerFunctionSelector(
    systemId,
-   systemFunctionName,
-   systemFunctionArguments,
+   string(abi.encodePacked(systemFunctionName, systemFunctionArguments))
  );
```

**[feat(store,world): replace `ResourceSelector` with `ResourceId` and `WorldResourceId` (#1544)](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae)** (@latticexyz/world)

All `World` methods acting on namespaces as resources have been updated to use `ResourceId namespaceId` as parameter instead of `bytes14 namespace`.
The reason for this change is to make it clearer when a namespace is used as resource, as opposed to being part of another resource's ID.

```diff
+ import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

IBaseWorld {
- function registerNamespace(bytes14 namespace) external;
+ function registerNamespace(ResourceId namespaceId) external;

- function transferOwnership(bytes14 namespace, address newOwner) external;
+ function transferOwnership(ResourceId namespaceId, address newOwner) external;

- function transferBalanceToNamespace(bytes14 fromNamespace, bytes14 toNamespace, uint256 amount) external;
+ function transferBalanceToNamespace(ResourceId fromNamespaceId, ResourceId toNamespaceId, uint256 amount) external;

- function transferBalanceToAddress(bytes14 fromNamespace, address toAddress, uint256 amount) external;
+ function transferBalanceToAddress(ResourceId fromNamespaceId, address toAddress, uint256 amount) external;
}

```

**[feat: bump solidity to 0.8.21 (#1473)](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a)** (@latticexyz/cli, @latticexyz/common, @latticexyz/gas-report, @latticexyz/noise, @latticexyz/schema-type, @latticexyz/store, @latticexyz/world, create-mud)

Bump Solidity version to 0.8.21

**[feat(world): add `batchCallFrom` (#1594)](https://github.com/latticexyz/mud/commit/5741d53d0a39990a0d7b2842f1f012973655e060)** (@latticexyz/world)

- `IBaseWorld` now has a `batchCallFrom` method, which allows system calls via `callFrom` to be executed in batch.

```solidity
import { SystemCallFromData } from "@latticexyz/world/modules/core/types.sol";

interface IBaseWorld {
  function batchCallFrom(SystemCallFromData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
}
```

- The `callBatch` method of `IBaseWorld` has been renamed to `batchCall` to align better with the `batchCallFrom` method.

```diff
interface IBaseWorld {
- function callBatch(SystemCallData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
+ function batchCall(SystemCallData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
}
```

**[feat(store): codegen index and common files (#1318)](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130)** (@latticexyz/cli, @latticexyz/store, create-mud)

Renamed the default filename of generated user types from `Types.sol` to `common.sol` and the default filename of the generated table index file from `Tables.sol` to `index.sol`.

Both can be overridden via the MUD config:

```ts
export default mudConfig({
  /** Filename where common user types will be generated and imported from. */
  userTypesFilename: "common.sol",
  /** Filename where codegen index will be generated. */
  codegenIndexFilename: "index.sol",
});
```

Note: `userTypesFilename` was renamed from `userTypesPath` and `.sol` is not appended automatically anymore but needs to be part of the provided filename.

To update your existing project, update all imports from `Tables.sol` to `index.sol` and all imports from `Types.sol` to `common.sol`, or override the defaults in your MUD config to the previous values.

```diff
- import { Counter } from "../src/codegen/Tables.sol";
+ import { Counter } from "../src/codegen/index.sol";
- import { ExampleEnum } from "../src/codegen/Types.sol";
+ import { ExampleEnum } from "../src/codegen/common.sol";
```

**[feat(store,): add splice events (#1354)](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853)** (@latticexyz/dev-tools, @latticexyz/store-sync, create-mud)

We've updated Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexers and sync strategies.

As such, we've replaced `blockStorageOperations$` with `storedBlockLogs$`, a stream of simplified Store event logs after they've been synced to the configured storage adapter. These logs may not reflect exactly the events that are on chain when e.g. hydrating from an indexer, but they will still allow the client to "catch up" to the on-chain state of your tables.

**[feat(store,world): replace `ephemeral` tables with `offchain` tables (#1558)](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/store-sync, @latticexyz/store, create-mud)

What used to be known as `ephemeral` table is now called `offchain` table.
The previous `ephemeral` tables only supported an `emitEphemeral` method, which emitted a `StoreSetEphemeralRecord` event.

Now `offchain` tables support all regular table methods, except partial operations on dynamic fields (`push`, `pop`, `update`).
Unlike regular tables they don't store data on-chain but emit the same events as regular tables (`StoreSetRecord`, `StoreSpliceStaticData`, `StoreDeleteRecord`), so their data can be indexed by offchain indexers/clients.

```diff
- EphemeralTable.emitEphemeral(value);
+ OffchainTable.set(value);
```

**[refactor(store,world): move store tables to `store` namespace, world tables to `world` namespace (#1601)](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70)** (@latticexyz/store-sync, @latticexyz/store, @latticexyz/world-modules, @latticexyz/world)

Moved `store` tables to the `"store"` namespace (previously "mudstore") and `world` tables to the `"world"` namespace (previously root namespace).

**[feat(store): rename events for readability and consistency with errors (#1577)](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c)** (@latticexyz/block-logs-stream, @latticexyz/dev-tools, @latticexyz/store-sync, @latticexyz/store)

`Store` events have been renamed for consistency and readability.
If you're parsing `Store` events manually, you need to update your ABI.
If you're using the MUD sync stack, the new events are already integrated and no further changes are necessary.

```diff
- event StoreSetRecord(
+ event Store_SetRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    bytes32 encodedLengths,
    bytes dynamicData
  );
- event StoreSpliceStaticData(
+ event Store_SpliceStaticData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data
  );
- event StoreSpliceDynamicData(
+ event Store_SpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data,
    bytes32 encodedLengths
  );
- event StoreDeleteRecord(
+ event Store_DeleteRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple
  );
```

**[feat(store,world): replace `ResourceSelector` with `ResourceId` and `WorldResourceId` (#1544)](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae)** (@latticexyz/cli, @latticexyz/common, @latticexyz/config, @latticexyz/store)

- `ResourceSelector` is replaced with `ResourceId`, `ResourceIdLib`, `ResourceIdInstance`, `WorldResourceIdLib` and `WorldResourceIdInstance`.

  Previously a "resource selector" was a `bytes32` value with the first 16 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.
  Now a "resource ID" is a `bytes32` value with the first 2 bytes reserved for the resource type, the next 14 bytes reserved for the resource's namespace, and the last 16 bytes reserved for the resource's name.

  Previously `ResouceSelector` was a library and the resource selector type was a plain `bytes32`.
  Now `ResourceId` is a user type, and the functionality is implemented in the `ResourceIdInstance` (for type) and `WorldResourceIdInstance` (for namespace and name) libraries.
  We split the logic into two libraries, because `Store` now also uses `ResourceId` and needs to be aware of resource types, but not of namespaces/names.

  ```diff
  - import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";
  + import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
  + import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
  + import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

  - bytes32 systemId = ResourceSelector.from("namespace", "name");
  + ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "namespace", "name");

  - using ResourceSelector for bytes32;
  + using WorldResourceIdInstance for ResourceId;
  + using ResourceIdInstance for ResourceId;

    systemId.getName();
    systemId.getNamespace();
  + systemId.getType();

  ```

- All `Store` and `World` methods now use the `ResourceId` type for `tableId`, `systemId`, `moduleId` and `namespaceId`.
  All mentions of `resourceSelector` were renamed to `resourceId` or the more specific type (e.g. `tableId`, `systemId`)

  ```diff
  import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

  IStore {
    function setRecord(
  -   bytes32 tableId,
  +   ResourceId tableId,
      bytes32[] calldata keyTuple,
      bytes calldata staticData,
      PackedCounter encodedLengths,
      bytes calldata dynamicData,
      FieldLayout fieldLayout
    ) external;

    // Same for all other methods
  }
  ```

  ```diff
  import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

  IBaseWorld {
    function callFrom(
      address delegator,
  -   bytes32 resourceSelector,
  +   ResourceId systemId,
      bytes memory callData
    ) external payable returns (bytes memory);

    // Same for all other methods
  }
  ```

**[feat(store): indexed `tableId` in store events (#1520)](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380)** (@latticexyz/store)

Store events now use an `indexed` `tableId`. This adds ~100 gas per write, but means we our sync stack can filter events by table.

**[feat(world,store): add initialize method, initialize core tables in core module (#1472)](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf)** (@latticexyz/store)

- `StoreCore`'s `initialize` function is split into `initialize` (to set the `StoreSwitch`'s `storeAddress`) and `registerCoreTables` (to register the `Tables` and `StoreHooks` tables).
  The purpose of this is to give consumers more granular control over the setup flow.

- The `StoreRead` contract no longer calls `StoreCore.initialize` in its constructor.
  `StoreCore` consumers are expected to call `StoreCore.initialize` and `StoreCore.registerCoreTable` in their own setup logic.

**[feat(store): add `internalType` property to user types config for type inference (#1587)](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d)** (@latticexyz/cli, @latticexyz/common, @latticexyz/store)

Changed the `userTypes` property to accept `{ filePath: string, internalType: SchemaAbiType }` to enable strong type inference from the config.

**[refactor(world,world-modules): move optional modules from `world` to `world-modules` package (#1591)](https://github.com/latticexyz/mud/commit/251170e1ef0b07466c597ea84df0cb49de7d6a23)** (@latticexyz/cli, @latticexyz/world, @latticexyz/world-modules)

All optional modules have been moved from `@latticexyz/world` to `@latticexyz/world-modules`.
If you're using the MUD CLI, the import is already updated and no changes are necessary.

**[feat(store,world): polish store methods (#1581)](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world, create-mud)

- The external `setRecord` and `deleteRecord` methods of `IStore` no longer accept a `FieldLayout` as input, but load it from storage instead.
  This is to prevent invalid `FieldLayout` values being passed, which could cause the onchain state to diverge from the indexer state.
  However, the internal `StoreCore` library still exposes a `setRecord` and `deleteRecord` method that allows a `FieldLayout` to be passed.
  This is because `StoreCore` can only be used internally, so the `FieldLayout` value can be trusted and we can save the gas for accessing storage.

  ```diff
  interface IStore {
    function setRecord(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
      bytes calldata staticData,
      PackedCounter encodedLengths,
      bytes calldata dynamicData,
  -   FieldLayout fieldLayout
    ) external;

    function deleteRecord(
      ResourceId tableId,
      bytes32[] memory keyTuple,
  -   FieldLayout fieldLayout
    ) external;
  }
  ```

- The `spliceStaticData` method and `Store_SpliceStaticData` event of `IStore` and `StoreCore` no longer include `deleteCount` in their signature.
  This is because when splicing static data, the data after `start` is always overwritten with `data` instead of being shifted, so `deleteCount` is always the length of the data to be written.

  ```diff

  event Store_SpliceStaticData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
  - uint40 deleteCount,
    bytes data
  );

  interface IStore {
    function spliceStaticData(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
      uint48 start,
  -   uint40 deleteCount,
      bytes calldata data
    ) external;
  }
  ```

- The `updateInField` method has been removed from `IStore`, as it's almost identical to the more general `spliceDynamicData`.
  If you're manually calling `updateInField`, here is how to upgrade to `spliceDynamicData`:

  ```diff
  - store.updateInField(tableId, keyTuple, fieldIndex, startByteIndex, dataToSet, fieldLayout);
  + uint8 dynamicFieldIndex = fieldIndex - fieldLayout.numStaticFields();
  + store.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, uint40(startByteIndex), uint40(dataToSet.length), dataToSet);
  ```

- All other methods that are only valid for dynamic fields (`pushToField`, `popFromField`, `getFieldSlice`)
  have been renamed to make this more explicit (`pushToDynamicField`, `popFromDynamicField`, `getDynamicFieldSlice`).

  Their `fieldIndex` parameter has been replaced by a `dynamicFieldIndex` parameter, which is the index relative to the first dynamic field (i.e. `dynamicFieldIndex` = `fieldIndex` - `numStaticFields`).
  The `FieldLayout` parameter has been removed, as it was only used to calculate the `dynamicFieldIndex` in the method.

  ```diff
  interface IStore {
  - function pushToField(
  + function pushToDynamicField(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
  -   uint8 fieldIndex,
  +   uint8 dynamicFieldIndex,
      bytes calldata dataToPush,
  -   FieldLayout fieldLayout
    ) external;

  - function popFromField(
  + function popFromDynamicField(
      ResourceId tableId,
      bytes32[] calldata keyTuple,
  -   uint8 fieldIndex,
  +   uint8 dynamicFieldIndex,
      uint256 byteLengthToPop,
  -   FieldLayout fieldLayout
    ) external;

  - function getFieldSlice(
  + function getDynamicFieldSlice(
      ResourceId tableId,
      bytes32[] memory keyTuple,
  -   uint8 fieldIndex,
  +   uint8 dynamicFieldIndex,
  -   FieldLayout fieldLayout,
      uint256 start,
      uint256 end
    ) external view returns (bytes memory data);
  }
  ```

- `IStore` has a new `getDynamicFieldLength` length method, which returns the byte length of the given dynamic field and doesn't require the `FieldLayout`.

  ```diff
  IStore {
  + function getDynamicFieldLength(
  +   ResourceId tableId,
  +   bytes32[] memory keyTuple,
  +   uint8 dynamicFieldIndex
  + ) external view returns (uint256);
  }

  ```

- `IStore` now has additional overloads for `getRecord`, `getField`, `getFieldLength` and `setField` that don't require a `FieldLength` to be passed, but instead load it from storage.

- `IStore` now exposes `setStaticField` and `setDynamicField` to save gas by avoiding the dynamic inference of whether the field is static or dynamic.

- The `getDynamicFieldSlice` method no longer accepts reading outside the bounds of the dynamic field.
  This is to avoid returning invalid data, as the data of a dynamic field is not deleted when the record is deleted, but only its length is set to zero.

### Minor changes

**[feat(dev-tools): update actions to display function name instead of callFrom (#1497)](https://github.com/latticexyz/mud/commit/24a0dd4440d6fe661640c581ff5348d62eae9302)** (@latticexyz/dev-tools)

Improved rendering of transactions that make calls via World's `call` and `callFrom` methods

**[feat(faucet): add faucet service (#1517)](https://github.com/latticexyz/mud/commit/9940fdb3e036e03aa8ede1ca80cd44d86d3b85b7)** (@latticexyz/faucet)

New package to run your own faucet service. We'll use this soon for our testnet in place of `@latticexyz/services`.

To run the faucet server:

- Add the package with `pnpm add @latticexyz/faucet`
- Add a `.env` file that has a `RPC_HTTP_URL` and `FAUCET_PRIVATE_KEY` (or pass the environment variables into the next command)
- Run `pnpm faucet-server` to start the server

You can also adjust the server's `HOST` (defaults to `0.0.0.0`) and `PORT` (defaults to `3002`). The tRPC routes are accessible under `/trpc`.

To connect a tRPC client, add the package with `pnpm add @latticexyz/faucet` and then use `createClient`:

```ts
import { createClient } from "@latticexyz/faucet";

const faucet = createClient({ url: "http://localhost:3002/trpc" });

await faucet.mutate.drip({ address: burnerAccount.address });
```

**[feat(world): add `registerNamespaceDelegation` for namespace-bound fallback delegation controls (#1590)](https://github.com/latticexyz/mud/commit/1f80a0b52a5c2d051e3697d6e60aad7364b0a925)** (@latticexyz/world)

It is now possible for namespace owners to register a fallback delegation control system for the namespace.
This fallback delegation control system is used to verify a delegation in `IBaseWorld.callFrom`, after the user's individual and fallback delegations have been checked.

```solidity
IBaseWorld {
  function registerNamespaceDelegation(
    ResourceId namespaceId,
    ResourceId delegationControlId,
    bytes memory initCallData
  ) external;
}
```

**[feat: move forge build + abi + abi-ts to out (#1483)](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab)** (create-mud)

Templates now use `out` for their `forge build` artifacts, including ABIs. If you have a project created from a previous template, you can update your `packages/contracts/package.json` with:

```diff
- "build:abi": "rimraf abi && forge build --extra-output-files abi --out abi --skip test script MudTest.sol",
- "build:abi-ts": "mud abi-ts --input 'abi/IWorld.sol/IWorld.abi.json' && prettier --write '**/*.abi.json.d.ts'",
+ "build:abi": "forge clean && forge build --skip test script",
+ "build:abi-ts": "mud abi-ts && prettier --write '**/*.abi.json.d.ts'",
```

And your `packages/client/src/mud/setupNetwork` with:

```diff
- import IWorldAbi from "contracts/abi/IWorld.sol/IWorld.abi.json";
+ import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
```

**[feat(common,store): add support for user-defined types (#1566)](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9)** (@latticexyz/common)

- Add `getRemappings` to get foundry remappings as an array of `[to, from]` tuples.
- Add `extractUserTypes` solidity parser utility to extract user-defined types.
- Add `loadAndExtractUserTypes` helper to load and parse a solidity file, extracting user-defined types.

**[feat(store-indexer): run indexers with npx (#1526)](https://github.com/latticexyz/mud/commit/498d05e3604cd422064e5548dc53bec327e936ee)** (@latticexyz/store-indexer)

You can now install and run `@latticexyz/store-indexer` from the npm package itself, without having to clone/build the MUD repo:

```sh
npm install @latticexyz/store-indexer

npm sqlite-indexer
# or
npm postgres-indexer
```

or

```sh
npx -p @latticexyz/store-indexer sqlite-indexer
# or
npx -p @latticexyz/store-indexer postgres-indexer
```

The binary will also load the nearby `.env` file for easier local configuration.

We've removed the `CHAIN_ID` requirement and instead require just a `RPC_HTTP_URL` or `RPC_WS_URL` or both. You can now also adjust the polling interval with `POLLING_INTERVAL` (defaults to 1000ms, which corresponds to MUD's default block time).

**[feat(store,): add splice events (#1354)](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853)** (@latticexyz/common)

`spliceHex` was added, which has a similar API as JavaScript's [`Array.prototype.splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice), but for `Hex` strings.

```ts
spliceHex("0x123456", 1, 1, "0x0000"); // "0x12000056"
```

**[feat(protoocl-parser): add valueSchemaToFieldLayoutHex (#1476)](https://github.com/latticexyz/mud/commit/9ff4dd955fd6dca36eb15cfe7e46bb522d2e943b)** (@latticexyz/protocol-parser)

Adds `valueSchemaToFieldLayoutHex` helper

**[feat(store,world): emit Store/World versions (#1511)](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7)** (@latticexyz/store, @latticexyz/world)

Add protocol version with corresponding getter and event on deploy

```solidity
world.worldVersion();
world.storeVersion(); // a World is also a Store
```

```solidity
event HelloWorld(bytes32 indexed worldVersion);
event HelloStore(bytes32 indexed storeVersion);
```

**[feat(store): expose `getStaticField` and `getDynamicField` on `IStore` and use it in codegen tables (#1521)](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world)

`StoreCore` and `IStore` now expose specific functions for `getStaticField` and `getDynamicField` in addition to the general `getField`.
Using the specific functions reduces gas overhead because more optimized logic can be executed.

```solidity
interface IStore {
  /**
   * Get a single static field from the given tableId and key tuple, with the given value field layout.
   * Note: the field value is left-aligned in the returned bytes32, the rest of the word is not zeroed out.
   * Consumers are expected to truncate the returned value as needed.
   */
  function getStaticField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) external view returns (bytes32);

  /**
   * Get a single dynamic field from the given tableId and key tuple at the given dynamic field index.
   * (Dynamic field index = field index - number of static fields)
   */
  function getDynamicField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) external view returns (bytes memory);
}
```

**[refactor(store): inline logic in codegenned set method which uses struct (#1542)](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2)** (@latticexyz/store)

Add an optional `namePrefix` argument to `renderRecordData`, to support inlined logic in codegenned `set` method which uses a struct.

**[feat(store): indexed `tableId` in store events (#1520)](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380)** (@latticexyz/cli, @latticexyz/common, @latticexyz/store, @latticexyz/world)

Generated table libraries now have a set of functions prefixed with `_` that always use their own storage for read/write.
This saves gas for use cases where the functionality to dynamically determine which `Store` to use for read/write is not needed, e.g. root systems in a `World`, or when using `Store` without `World`.

We decided to continue to always generate a set of functions that dynamically decide which `Store` to use, so that the generated table libraries can still be imported by non-root systems.

```solidity
library Counter {
  // Dynamically determine which store to write to based on the context
  function set(uint32 value) internal;

  // Always write to own storage
  function _set(uint32 value) internal;

  // ... equivalent functions for all other Store methods
}
```

**[feat(world,store): add initialize method, initialize core tables in core module (#1472)](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf)** (@latticexyz/cli, @latticexyz/world)

- The `World` contract now has an `initialize` function, which can be called once by the creator of the World to install the core module.
  This change allows the registration of all core tables to happen in the `CoreModule`, so no table metadata has to be included in the `World`'s bytecode.

  ```solidity
  interface IBaseWorld {
    function initialize(IModule coreModule) public;
  }
  ```

- The `World` contract now stores the original creator of the `World` in an immutable state variable.
  It is used internally to only allow the original creator to initialize the `World` in a separate transaction.

  ```solidity
  interface IBaseWorld {
    function creator() external view returns (address);
  }
  ```

- The deploy script is updated to use the `World`'s `initialize` function to install the `CoreModule` instead of `registerRootModule` as before.

**[feat(world): add CallBatchSystem to core module (#1500)](https://github.com/latticexyz/mud/commit/95c59b203259c20a6f944c5f9af008b44e2902b6)** (@latticexyz/world)

The `World` now has a `callBatch` method which allows multiple system calls to be batched into a single transaction.

```solidity
import { SystemCallData } from "@latticexyz/world/modules/core/types.sol";

interface IBaseWorld {
  function callBatch(SystemCallData[] calldata systemCalls) external returns (bytes[] memory returnDatas);
}
```

### Patch changes

**[fix(store-indexer): subscribe postgres indexer to stream (#1514)](https://github.com/latticexyz/mud/commit/ed07018b86046fec20786f4752ac98a4175eb5eb)** (@latticexyz/store-indexer)

Fixes postgres indexer stopping sync after it catches up to the latest block.

**[fix: release bytecode on npm and import abi in cli deploy (#1490)](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world)

Include bytecode for `World` and `Store` in npm packages.

**[refactor(store,world): move test table config out of main table config (#1600)](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8)** (@latticexyz/store, @latticexyz/world)

Moved the test tables out of the main config in `world` and `store` and into their own separate config.

**[fix(common): always import relative sol files from ./ (#1585)](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96)** (@latticexyz/common)

Minor fix to resolving user types: `solc` doesn't like relative imports without `./`, but is fine with relative imports from `./../`, so we always append `./` to the relative path.

**[feat(store): compute FieldLayout at compile time (#1508)](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world)

The `FieldLayout` in table libraries is now generated at compile time instead of dynamically in a table library function.
This significantly reduces gas cost in all table library functions.

**[feat(store): add Storage.loadField for optimized loading of 32 bytes or less from storage (#1512)](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c)** (@latticexyz/store)

Added `Storage.loadField` to optimize loading 32 bytes or less from storage (which is always the case when loading data for static fields).

**[refactor(store,world): prefix errors with library/contract name (#1568)](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c)** (@latticexyz/store, @latticexyz/world)

Prefixed all errors with their respective library/contract for improved debugging.

**[refactor(world): remove workaround in mud config (#1501)](https://github.com/latticexyz/mud/commit/4c7fd3eb29e3d3954f2f1f36ace474a436082651)** (@latticexyz/world)

Remove a workaround for the internal `InstalledModules` table that is not needed anymore.

**[feat(world): rename `funcSelectorAndArgs` to `callData` (#1524)](https://github.com/latticexyz/mud/commit/a0341daf9fd87e8072ffa292a33f508dd37b8ca6)** (@latticexyz/world)

Renamed all `funcSelectorAndArgs` arguments to `callData` for clarity.

**[fix(faucet,store-indexer): fix invalid env message (#1546)](https://github.com/latticexyz/mud/commit/301bcb75dd8c15b8ea1a9d0ca8c75c15d7cd92bd)** (@latticexyz/faucet, @latticexyz/store-indexer)

Improves error message when parsing env variables

**[feat(store,world): replace `ResourceSelector` with `ResourceId` and `WorldResourceId` (#1544)](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae)** (@latticexyz/world, @latticexyz/store)

The `ResourceType` table is removed.
It was previously used to store the resource type for each resource ID in a `World`. This is no longer necessary as the [resource type is now encoded in the resource ID](https://github.com/latticexyz/mud/pull/1544).

To still be able to determine whether a given resource ID exists, a `ResourceIds` table has been added.
The previous `ResourceType` table was part of `World` and missed tables that were registered directly via `StoreCore.registerTable` instead of via `World.registerTable` (e.g. when a table was registered as part of a root module).
This problem is solved by the new table `ResourceIds` being part of `Store`.

`StoreCore`'s `hasTable` function was removed in favor of using `ResourceIds.getExists(tableId)` directly.

```diff
- import { ResourceType } from "@latticexyz/world/src/tables/ResourceType.sol";
- import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
+ import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

- bool tableExists = StoreCore.hasTable(tableId);
+ bool tableExists = ResourceIds.getExists(tableId);

- bool systemExists = ResourceType.get(systemId) != Resource.NONE;
+ bool systemExists = ResourceIds.getExists(systemId);
```

**[feat: rename table to tableId (#1484)](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847)** (@latticexyz/block-logs-stream, @latticexyz/store-sync, @latticexyz/store)

Renamed all occurrences of `table` where it is used as "table ID" to `tableId`.
This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

```diff
event StoreSetRecord(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key,
  bytes data
);

event StoreSetField(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key,
  uint8 fieldIndex,
  bytes data
);

event StoreDeleteRecord(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key
);

event StoreEphemeralRecord(
- bytes32 table,
+ bytes32 tableId,
  bytes32[] key,
  bytes data
);
```

**[docs: cli changeset after deploy changes (#1503)](https://github.com/latticexyz/mud/commit/bd9cc8ec2608efcb05ef95df64448b2ec28bcb49)** (@latticexyz/cli)

Refactor `deploy` command to break up logic into modules

**[feat: rename key to keyTuple (#1492)](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96)** (@latticexyz/block-logs-stream, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world)

Renamed all occurrences of `key` where it is used as "key tuple" to `keyTuple`.
This is only a breaking change for consumers who manually decode `Store` events, but not for consumers who use the MUD libraries.

```diff
event StoreSetRecord(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
  bytes data
);

event StoreSetField(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
  uint8 fieldIndex,
  bytes data
);

event StoreDeleteRecord(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
);

event StoreEphemeralRecord(
  bytes32 tableId,
- bytes32[] key,
+ bytes32[] keyTuple,
  bytes data
);
```

**[fix(protocol-parser): export valueSchemaToFieldLayoutHex (#1481)](https://github.com/latticexyz/mud/commit/f8a01a047d73a15326ebf6577ea033674d8e61a9)** (@latticexyz/protocol-parser)

Export `valueSchemaToFieldLayoutHex` helper

**[fix(world): register Delegations table in CoreModule (#1452)](https://github.com/latticexyz/mud/commit/f1cd43bf9264d5a23a3edf2a1ea4212361a72203)** (@latticexyz/world)

Register `Delegations` table in the `CoreModule`

**[fix(store-indexer): catch errors when parsing logs to tables and storage operations (#1488)](https://github.com/latticexyz/mud/commit/7e6e5157bb124f19bd8ed9f02b93afadc97cdf50)** (@latticexyz/store-sync)

Catch errors when parsing logs to tables and storage operations, log and skip

**[refactor(store): rename `Utils.sol` to `leftMask.sol` and minor cleanup (#1599)](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619)** (@latticexyz/store)

Minor `Store` cleanups: renamed `Utils.sol` to `leftMask.sol` since it only contains a single free function, and removed a leftover sanity check.

**[feat(store,world): use user-types for `ResourceId`, `FieldLayout` and `Schema` in table libraries (#1586)](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612)** (@latticexyz/store-sync, @latticexyz/store, @latticexyz/world)

All `Store` and `World` tables now use the appropriate user-types for `ResourceId`, `FieldLayout` and `Schema` to avoid manual `wrap`/`unwrap`.

**[feat(store): optimize storage location hash (#1509)](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87)** (@latticexyz/store, @latticexyz/world)

Optimized the `StoreCore` hash function determining the data location to use less gas.

**[fix(dev-tools): key -> keyTuple (#1505)](https://github.com/latticexyz/mud/commit/e0193e5737fa2148d5d2b888d71df01d1e46b6d5)** (@latticexyz/dev-tools)

Updates store event `key` reference to `keyTuple`

**[fix(dev-tools): table -> tableId (#1502)](https://github.com/latticexyz/mud/commit/e0377761c3a3f83a23de78f6bcb0733c500a0825)** (@latticexyz/dev-tools)

Updates `table` reference to `tableId`

**[feat: move forge build + abi + abi-ts to out (#1483)](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab)** (@latticexyz/cli)

`deploy` and `dev-contracts` CLI commands now use `forge build --skip test script` before deploying and run `mud abi-ts` to generate strong types for ABIs.

**[refactor(store-indexer): add readme, refactor common env (#1533)](https://github.com/latticexyz/mud/commit/b3c22a183c0b288b9eb1487e4fef125bf7dae915)** (@latticexyz/store-indexer)

Added README and refactored handling of common environment variables

**[refactor(store,world): simplify constants (#1569)](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7)** (@latticexyz/store, @latticexyz/world)

Simplified a couple internal constants used for bitshifting.

**[docs(faucet): add readme (#1534)](https://github.com/latticexyz/mud/commit/fa409e83db6b76422d525f7d2e9c947dc3c51262)** (@latticexyz/faucet)

Added README

**[fix(common): fix memory corruption for dynamic to static array conversion (#1598)](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04)** (@latticexyz/cli, @latticexyz/common)

Table libraries now correctly handle uninitialized fixed length arrays.

---

## Version 2.0.0-next.8

### Major changes

**[feat(world,store): add ERC165 checks for all registration methods (#1458)](https://github.com/latticexyz/mud/commit/b9e562d8f7a6051bb1a7262979b268fd2c83daac)** (@latticexyz/store, @latticexyz/world)

The `World` now performs `ERC165` interface checks to ensure that the `StoreHook`, `SystemHook`, `System`, `DelegationControl` and `Module` contracts to actually implement their respective interfaces before registering them in the World.

The required `supportsInterface` methods are implemented on the respective base contracts.
When creating one of these contracts, the recommended approach is to extend the base contract rather than the interface.

```diff
- import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
+ import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";

- contract MyStoreHook is IStoreHook {}
+ contract MyStoreHook is StoreHook {}
```

```diff
- import { ISystemHook } from "@latticexyz/world/src/interfaces/ISystemHook.sol";
+ import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";

- contract MySystemHook is ISystemHook {}
+ contract MySystemHook is SystemHook {}
```

```diff
- import { IDelegationControl } from "@latticexyz/world/src/interfaces/IDelegationControl.sol";
+ import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";

- contract MyDelegationControl is IDelegationControl {}
+ contract MyDelegationControl is DelegationControl {}
```

```diff
- import { IModule } from "@latticexyz/world/src/interfaces/IModule.sol";
+ import { Module } from "@latticexyz/world/src/Module.sol";

- contract MyModule is IModule {}
+ contract MyModule is Module {}
```

**[feat(world): change requireOwnerOrSelf to requireOwner (#1457)](https://github.com/latticexyz/mud/commit/51914d656d8cd8d851ccc8296d249cf09f53e670)** (@latticexyz/world)

- The access control library no longer allows calls by the `World` contract to itself to bypass the ownership check.
  This is a breaking change for root modules that relied on this mechanism to register root tables, systems or function selectors.
  To upgrade, root modules must use `delegatecall` instead of a regular `call` to install root tables, systems or function selectors.

  ```diff
  - world.registerSystem(rootSystemId, rootSystemAddress);
  + address(world).delegatecall(abi.encodeCall(world.registerSystem, (rootSystemId, rootSystemAddress)));
  ```

- An `installRoot` method was added to the `IModule` interface.
  This method is now called when installing a root module via `world.installRootModule`.
  When installing non-root modules via `world.installModule`, the module's `install` function continues to be called.

**[feat(world): add Balance table and BalanceTransferSystem (#1425)](https://github.com/latticexyz/mud/commit/2ca75f9b9063ea33524e6c609b87f5494f678fa0)** (@latticexyz/world)

The World now maintains a balance per namespace.
When a system is called with value, the value stored in the World contract and credited to the system's namespace.

Previously, the World contract did not store value, but passed it on to the system contracts.
However, as systems are expected to be stateless (reading/writing state only via the calling World) and can be registered in multiple Worlds, this could have led to exploits.

Any address with access to a namespace can use the balance of that namespace.
This allows all systems registered in the same namespace to work with the same balance.

There are two new World methods to transfer balance between namespaces (`transferBalanceToNamespace`) or to an address (`transferBalanceToAddress`).

```solidity
interface IBaseWorld {
  function transferBalanceToNamespace(bytes16 fromNamespace, bytes16 toNamespace, uint256 amount) external;

  function transferBalanceToAddress(bytes16 fromNamespace, address toAddress, uint256 amount) external;
}
```

### Minor changes

**[feat(store,world): add ability to unregister hooks (#1422)](https://github.com/latticexyz/mud/commit/1d60930d6d4c9a0bda262e5e23a5f719b9dd48c7)** (@latticexyz/store, @latticexyz/world)

It is now possible to unregister Store hooks and System hooks.

```solidity
interface IStore {
  function unregisterStoreHook(bytes32 table, IStoreHook hookAddress) external;
  // ...
}

interface IWorld {
  function unregisterSystemHook(bytes32 resourceSelector, ISystemHook hookAddress) external;
  // ...
}
```

**[feat(protocol-parser): add keySchema/valueSchema helpers (#1443)](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98)** (@latticexyz/store)

Moved `KeySchema`, `ValueSchema`, `SchemaToPrimitives` and `TableRecord` types into `@latticexyz/protocol-parser`

**[feat(protocol-parser): add keySchema/valueSchema helpers (#1443)](https://github.com/latticexyz/mud/commit/5e71e1cb541b0a18ee414e18dd80f1dd24a92b98)** (@latticexyz/protocol-parser)

Adds `decodeKey`, `decodeValue`, `encodeKey`, and `encodeValue` helpers to decode/encode from key/value schemas. Deprecates previous methods that use a schema object with static/dynamic field arrays, originally attempting to model our on-chain behavior but ended up not very ergonomic when working with table configs.

---

## Version 2.0.0-next.7

### Major changes

**[feat(store,world): more granularity for onchain hooks (#1399)](https://github.com/latticexyz/mud/commit/c4d5eb4e4e4737112b981a795a9c347e3578cb15)** (@latticexyz/store, @latticexyz/world)

- The `onSetRecord` hook is split into `onBeforeSetRecord` and `onAfterSetRecord` and the `onDeleteRecord` hook is split into `onBeforeDeleteRecord` and `onAfterDeleteRecord`.
  The purpose of this change is to allow more fine-grained control over the point in the lifecycle at which hooks are executed.

  The previous hooks were executed before modifying data, so they can be replaced with the respective `onBefore` hooks.

  ```diff
  - function onSetRecord(
  + function onBeforeSetRecord(
      bytes32 table,
      bytes32[] memory key,
      bytes memory data,
      Schema valueSchema
    ) public;

  - function onDeleteRecord(
  + function onBeforeDeleteRecord(
      bytes32 table,
      bytes32[] memory key,
      Schema valueSchema
    ) public;
  ```

- It is now possible to specify which methods of a hook contract should be called when registering a hook. The purpose of this change is to save gas by avoiding to call no-op hook methods.

  ```diff
  function registerStoreHook(
    bytes32 tableId,
  - IStoreHook hookAddress
  + IStoreHook hookAddress,
  + uint8 enabledHooksBitmap
  ) public;

  function registerSystemHook(
    bytes32 systemId,
  - ISystemHook hookAddress
  + ISystemHook hookAddress,
  + uint8 enabledHooksBitmap
  ) public;
  ```

  There are `StoreHookLib` and `SystemHookLib` with helper functions to encode the bitmap of enabled hooks.

  ```solidity
  import { StoreHookLib } from "@latticexyz/store/src/StoreHook.sol";

  uint8 storeHookBitmap = StoreBookLib.encodeBitmap({
    onBeforeSetRecord: true,
    onAfterSetRecord: true,
    onBeforeSetField: true,
    onAfterSetField: true,
    onBeforeDeleteRecord: true,
    onAfterDeleteRecord: true
  });
  ```

  ```solidity
  import { SystemHookLib } from "@latticexyz/world/src/SystemHook.sol";

  uint8 systemHookBitmap = SystemHookLib.encodeBitmap({
    onBeforeCallSystem: true,
    onAfterCallSystem: true
  });
  ```

- The `onSetRecord` hook call for `emitEphemeralRecord` has been removed to save gas and to more clearly distinguish ephemeral tables as offchain tables.

### Patch changes

**[fix(abi-ts): remove cwd join (#1418)](https://github.com/latticexyz/mud/commit/2459e15fc9bf49fff2d769b9efba07b99635f2cc)** (@latticexyz/abi-ts)

Let `glob` handle resolving the glob against the current working directory.

**[feat(world): allow callFrom from own address without explicit delegation (#1407)](https://github.com/latticexyz/mud/commit/18d3aea55b1d7f4b442c21343795c299a56fc481)** (@latticexyz/world)

Allow `callFrom` with the own address as `delegator` without requiring an explicit delegation

---

## Version 2.0.0-next.6

### Major changes

**[style(gas-report): rename mud-gas-report to gas-report (#1410)](https://github.com/latticexyz/mud/commit/9af542d3e29e2699144534dec3430e19294077d4)** (@latticexyz/gas-report)

Renames `mud-gas-report` binary to `gas-report`, since it's no longer MUD specific.

### Minor changes

**[docs: rework abi-ts changesets (#1413)](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)** (@latticexyz/abi-ts, @latticexyz/cli)

Added a new `@latticexyz/abi-ts` package to generate TS type declaration files (`.d.ts`) for each ABI JSON file.

This allows you to import your JSON ABI and use it directly with libraries like [viem](https://npmjs.com/package/viem) and [abitype](https://npmjs.com/package/abitype).

```
pnpm add @latticexyz/abi-ts
pnpm abi-ts
```

By default, `abi-ts` looks for files with the glob `**/*.abi.json`, but you can customize this glob with the `--input` argument, e.g.

```console
pnpm abi-ts --input 'abi/IWorld.sol/IWorld.abi.json'
```

**[docs: rework abi-ts changesets (#1413)](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)** (create-mud)

We now use `@latticexyz/abi-ts` to generate TS type declaration files (`.d.ts`) for each ABI JSON file. This replaces our usage TypeChain everywhere.

If you have a MUD project created from an older template, you can replace TypeChain with `abi-ts` by first updating your contracts' `package.json`:

```diff
-"build": "pnpm run build:mud && pnpm run build:abi && pnpm run build:typechain",
+"build": "pnpm run build:mud && pnpm run build:abi && pnpm run build:abi-ts",
-"build:abi": "forge clean && forge build",
+"build:abi": "rimraf abi && forge build --extra-output-files abi --out abi --skip test script MudTest.sol",
+"build:abi-ts": "mud abi-ts --input 'abi/IWorld.sol/IWorld.abi.json' && prettier --write '**/*.abi.json.d.ts'",
 "build:mud": "mud tablegen && mud worldgen",
-"build:typechain": "rimraf types && typechain --target=ethers-v5 out/IWorld.sol/IWorld.json",
```

And update your client's `setupNetwork.ts` with:

```diff
-import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
+import IWorldAbi from "contracts/abi/IWorld.sol/IWorld.abi.json";

 const worldContract = createContract({
   address: networkConfig.worldAddress as Hex,
-  abi: IWorld__factory.abi,
+  abi: IWorldAbi,
```

**[docs: rework abi-ts changesets (#1413)](https://github.com/latticexyz/mud/commit/8025c3505a7411d8539b1cfd72265aed27e04561)** (@latticexyz/store, @latticexyz/world)

We now use `@latticexyz/abi-ts` to generate TS type declaration files (`.d.ts`) for each ABI JSON file. This replaces our usage TypeChain everywhere.

If you previously relied on TypeChain types from `@latticexyz/store` or `@latticexyz/world`, you will either need to migrate to viem or abitype using ABI JSON imports or generate TypeChain types from our exported ABI JSON files.

```ts
import { getContract } from "viem";
import IStoreAbi from "@latticexyz/store/abi/IStore.sol/IStore.abi.json";

const storeContract = getContract({
  abi: IStoreAbi,
  ...
});

await storeContract.write.setRecord(...);
```

---

## Version 2.0.0-next.5

### Major changes

**[refactor(world): separate call utils into `WorldContextProvider` and `SystemCall` (#1370)](https://github.com/latticexyz/mud/commit/9d0f492a90e5d94c6b38ad732e78fd4b13b2adbe)** (@latticexyz/world)

- The previous `Call.withSender` util is replaced with `WorldContextProvider`, since the usecase of appending the `msg.sender` to the calldata is tightly coupled with `WorldContextConsumer` (which extracts the appended context from the calldata).

  The previous `Call.withSender` utility reverted if the call failed and only returned the returndata on success. This is replaced with `callWithContextOrRevert`/`delegatecallWithContextOrRevert`

  ```diff
  -import { Call } from "@latticexyz/world/src/Call.sol";
  +import { WorldContextProvider } from "@latticexyz/world/src/WorldContext.sol";

  -Call.withSender({
  -  delegate: false,
  -  value: 0,
  -  ...
  -});
  +WorldContextProvider.callWithContextOrRevert({
  +  value: 0,
  +  ...
  +});

  -Call.withSender({
  -  delegate: true,
  -  value: 0,
  -  ...
  -});
  +WorldContextProvider.delegatecallWithContextOrRevert({
  +  ...
  +});
  ```

  In addition there are utils that return a `bool success` flag instead of reverting on errors. This mirrors the behavior of Solidity's low level `call`/`delegatecall` functions and is useful in situations where additional logic should be executed in case of a reverting external call.

  ```solidity
  library WorldContextProvider {
    function callWithContext(
      address target, // Address to call
      bytes memory funcSelectorAndArgs, // Abi encoded function selector and arguments to pass to pass to the contract
      address msgSender, // Address to append to the calldata as context for msgSender
      uint256 value // Value to pass with the call
    ) internal returns (bool success, bytes memory data);

    function delegatecallWithContext(
      address target, // Address to call
      bytes memory funcSelectorAndArgs, // Abi encoded function selector and arguments to pass to pass to the contract
      address msgSender // Address to append to the calldata as context for msgSender
    ) internal returns (bool success, bytes memory data);
  }
  ```

- `WorldContext` is renamed to `WorldContextConsumer` to clarify the relationship between `WorldContextProvider` (appending context to the calldata) and `WorldContextConsumer` (extracting context from the calldata)

  ```diff
  -import { WorldContext } from "@latticexyz/world/src/WorldContext.sol";
  -import { WorldContextConsumer } from "@latticexyz/world/src/WorldContext.sol";
  ```

- The `World` contract previously had a `_call` method to handle calling systems via their resource selector, performing accesss control checks and call hooks registered for the system.

  ```solidity
  library SystemCall {
    /**
     * Calls a system via its resource selector and perform access control checks.
     * Does not revert if the call fails, but returns a `success` flag along with the returndata.
     */
    function call(
      address caller,
      bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs,
      uint256 value
    ) internal returns (bool success, bytes memory data);

    /**
     * Calls a system via its resource selector, perform access control checks and trigger hooks registered for the system.
     * Does not revert if the call fails, but returns a `success` flag along with the returndata.
     */
    function callWithHooks(
      address caller,
      bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs,
      uint256 value
    ) internal returns (bool success, bytes memory data);

    /**
     * Calls a system via its resource selector, perform access control checks and trigger hooks registered for the system.
     * Reverts if the call fails.
     */
    function callWithHooksOrRevert(
      address caller,
      bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs,
      uint256 value
    ) internal returns (bytes memory data);
  }
  ```

- System hooks now are called with the system's resource selector instead of its address. The system's address can still easily obtained within the hook via `Systems.get(resourceSelector)` if necessary.

  ```diff
  interface ISystemHook {
    function onBeforeCallSystem(
      address msgSender,
  -   address systemAddress,
  +   bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs
    ) external;

    function onAfterCallSystem(
      address msgSender,
  -   address systemAddress,
  +   bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs
    ) external;
  }
  ```

### Minor changes

**[feat(world): add support for upgrading systems (#1378)](https://github.com/latticexyz/mud/commit/ce97426c0d70832e5efdb8bad83207a9d840302b)** (@latticexyz/world)

It is now possible to upgrade systems by calling `registerSystem` again with an existing system id (resource selector).

```solidity
// Register a system
world.registerSystem(systemId, systemAddress, publicAccess);

// Upgrade the system by calling `registerSystem` with the
// same system id but a new system address or publicAccess flag
world.registerSystem(systemId, newSystemAddress, newPublicAccess);
```

**[feat(world): add callFrom entry point (#1364)](https://github.com/latticexyz/mud/commit/1ca35e9a1630a51dfd1e082c26399f76f2cd06ed)** (@latticexyz/world)

The `World` has a new `callFrom` entry point which allows systems to be called on behalf of other addresses if those addresses have registered a delegation.
If there is a delegation, the call is forwarded to the system with `delegator` as `msgSender`.

```solidity
interface IBaseWorld {
  function callFrom(
    address delegator,
    bytes32 resourceSelector,
    bytes memory funcSelectorAndArgs
  ) external payable virtual returns (bytes memory);
}
```

A delegation can be registered via the `World`'s `registerDelegation` function.
If `delegatee` is `address(0)`, the delegation is considered to be a "fallback" delegation and is used in `callFrom` if there is no delegation is found for the specific caller.
Otherwise the delegation is registered for the specific `delegatee`.

```solidity
interface IBaseWorld {
  function registerDelegation(
    address delegatee,
    bytes32 delegationControl,
    bytes memory initFuncSelectorAndArgs
  ) external;
}
```

The `delegationControl` refers to the resource selector of a `DelegationControl` system that must have been registered beforehand.
As part of registering the delegation, the `DelegationControl` system is called with the provided `initFuncSelectorAndArgs`.
This can be used to initialize data in the given `DelegationControl` system.

The `DelegationControl` system must implement the `IDelegationControl` interface:

```solidity
interface IDelegationControl {
  function verify(address delegator, bytes32 systemId, bytes calldata funcSelectorAndArgs) external returns (bool);
}
```

When `callFrom` is called, the `World` checks if a delegation is registered for the given caller, and if so calls the delegation control's `verify` function with the same same arguments as `callFrom`.
If the call to `verify` is successful and returns `true`, the delegation is valid and the call is forwarded to the system with `delegator` as `msgSender`.

Note: if `UNLIMITED_DELEGATION` (from `@latticexyz/world/src/constants.sol`) is passed as `delegationControl`, the external call to the delegation control contract is skipped and the delegation is considered valid.

For examples of `DelegationControl` systems, check out the `CallboundDelegationControl` or `TimeboundDelegationControl` systems in the `std-delegations` module.
See `StandardDelegations.t.sol` for usage examples.

**[feat(world): allow transferring ownership of namespaces (#1274)](https://github.com/latticexyz/mud/commit/c583f3cd08767575ce9df39725ec51195b5feb5b)** (@latticexyz/world)

It is now possible to transfer ownership of namespaces!

```solidity
// Register a new namespace
world.registerNamespace("namespace");
// It's owned by the caller of the function (address(this))

// Transfer ownership of the namespace to address(42)
world.transferOwnership("namespace", address(42));
// It's now owned by address(42)
```

### Patch changes

**[fix(services): correctly export typescript types (#1377)](https://github.com/latticexyz/mud/commit/33f50f8a473398dcc19b17d10a17a552a82678c7)** (@latticexyz/services)

Fixed an issue where the TypeScript types for createFaucetService were not exported correctly from the @latticexyz/services package

**[feat: docker monorepo build (#1219)](https://github.com/latticexyz/mud/commit/80a26419f15177333b523bac5d09767487b4ffef)** (@latticexyz/services)

The build phase of services now works on machines with older protobuf compilers

**[refactor: remove v1 network package, remove snap sync module, deprecate std-client (#1311)](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)** (@latticexyz/common, @latticexyz/store, @latticexyz/world)

- Refactor tightcoder to use typescript functions instead of ejs
- Optimize `TightCoder` library
- Add `isLeftAligned` and `getLeftPaddingBits` common codegen helpers

**[fix(cli): make mud test exit with code 1 on test error (#1371)](https://github.com/latticexyz/mud/commit/dc258e6860196ad34bf1d4ac7fce382f70e2c0c8)** (@latticexyz/cli)

The `mud test` cli now exits with code 1 on test failure. It used to exit with code 0, which meant that CIs didn't notice test failures.

---

## Version 2.0.0-next.4

### Major changes

**[docs: changeset for deleted network package (#1348)](https://github.com/latticexyz/mud/commit/42c7d898630c93805a5e345bdc8d87c2674b5110)** (@latticexyz/network)

Removes `network` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

**[chore: delete std-contracts package (#1341)](https://github.com/latticexyz/mud/commit/c32c8e8f2ccac02c4242f715f296bffd5465bd71)** (@latticexyz/cli, @latticexyz/std-contracts)

Removes `std-contracts` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.

**[chore: delete solecs package (#1340)](https://github.com/latticexyz/mud/commit/ce7125a1b97efd3db47c5ea1593d5a37ba143f64)** (@latticexyz/cli, @latticexyz/recs, @latticexyz/solecs, @latticexyz/std-client)

Removes `solecs` package. These were v1 contracts, now entirely replaced by our v2 tooling. See the [MUD docs](https://mud.dev/) for building with v2 or create a new project from our v2 templates with `pnpm create mud@next your-app-name`.

**[feat(recs,std-client): move action system to recs (#1351)](https://github.com/latticexyz/mud/commit/c14f8bf1ec8c199902c12899853ac144aa69bb9c)** (@latticexyz/recs, @latticexyz/std-client)

- Moved `createActionSystem` from `std-client` to `recs` package and updated it to better support v2 sync stack.

  If you want to use `createActionSystem` alongside `syncToRecs`, you'll need to pass in arguments like so:

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";
  import { createActionSystem } from "@latticexyz/recs/deprecated";
  import { from, mergeMap } from "rxjs";

  const { blockLogsStorage$, waitForTransaction } = syncToRecs({
    world,
    ...
  });

  const txReduced$ = blockLogsStorage$.pipe(
    mergeMap(({ operations }) => from(operations.map((op) => op.log?.transactionHash).filter(isDefined)))
  );

  const actionSystem = createActionSystem(world, txReduced$, waitForTransaction);
  ```

- Fixed a bug in `waitForComponentValueIn` that caused the promise to not resolve if the component value was already set when the function was called.

- Fixed a bug in `createActionSystem` that caused optimistic updates to be incorrectly propagated to requirement checks. To fix the bug, you must now pass in the full component object to the action's `updates` instead of just the component name.

  ```diff
    actions.add({
      updates: () => [
        {
  -       component: "Resource",
  +       component: Resource,
          ...
        }
      ],
      ...
    });
  ```

**[chore: delete std-client package (#1342)](https://github.com/latticexyz/mud/commit/c03aff39e9882c8a827a3ed1ee81816231973816)** (@latticexyz/std-client)

Removes `std-client` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

**[chore: delete ecs-browser package (#1339)](https://github.com/latticexyz/mud/commit/6255a314240b1d36a8735f3dc7eb1672e16bac1a)** (@latticexyz/ecs-browser)

Removes `ecs-browser` package. This has now been replaced by `dev-tools`, which comes out-of-the-box when creating a new MUD app from the templates (`pnpm create mud@next your-app-name`). We'll be adding deeper RECS support (querying for entities) in a future release.

**[chore: delete store-cache package (#1343)](https://github.com/latticexyz/mud/commit/e3de1a338fe110ac33ba9fb833366541e4cf4cf1)** (@latticexyz/store-cache)

Removes `store-cache` package. Please see the [changelog](https://mud.dev/changelog) for how to migrate your app to the new `store-sync` package. Or create a new project from an up-to-date template with `pnpm create mud@next your-app-name`.

If you need reactivity, we recommend using `recs` package and `syncToRecs`. We'll be adding reactivity to `syncToSqlite` in a future release.

**[chore: delete store-cache package (#1343)](https://github.com/latticexyz/mud/commit/e3de1a338fe110ac33ba9fb833366541e4cf4cf1)** (@latticexyz/react)

Removes `useRow` and `useRows` hooks, previously powered by `store-cache`, which is now deprecated. Please use `recs` and the corresponding `useEntityQuery` and `useComponentValue` hooks. We'll have more hooks soon for SQL.js sync backends.

---

## Version 2.0.0-next.3

### Major changes

**[feat(world, store): stop loading schema from storage, require schema as an argument (#1174)](https://github.com/latticexyz/mud/commit/952cd534447d08e6231ab147ed1cc24fb49bbb57)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world, create-mud)

All `Store` methods now require the table's value schema to be passed in as an argument instead of loading it from storage.
This decreases gas cost and removes circular dependencies of the Schema table (where it was not possible to write to the Schema table before the Schema table was registered).

```diff
  function setRecord(
    bytes32 table,
    bytes32[] calldata key,
    bytes calldata data,
+   Schema valueSchema
  ) external;
```

The same diff applies to `getRecord`, `getField`, `setField`, `pushToField`, `popFromField`, `updateInField`, and `deleteRecord`.

This change only requires changes in downstream projects if the `Store` methods were accessed directly. In most cases it is fully abstracted in the generated table libraries,
so downstream projects only need to regenerate their table libraries after updating MUD.

**[refactor(world): combine name and namespace to resource selector in World methods (#1208)](https://github.com/latticexyz/mud/commit/c32a9269a30c1898932ebbf7e3b60e25d1bd884c)** (@latticexyz/cli, @latticexyz/world)

- All `World` function selectors that previously had `bytes16 namespace, bytes16 name` arguments now use `bytes32 resourceSelector` instead.
  This includes `setRecord`, `setField`, `pushToField`, `popFromField`, `updateInField`, `deleteRecord`, `call`, `grantAccess`, `revokeAccess`, `registerTable`,
  `registerStoreHook`, `registerSystemHook`, `registerFunctionSelector`, `registerSystem` and `registerRootFunctionSelector`.
  This change aligns the `World` function selectors with the `Store` function selectors, reduces clutter, reduces gas cost and reduces the `World`'s contract size.

- The `World`'s `registerHook` function is removed. Use `registerStoreHook` or `registerSystemHook` instead.

- The `deploy` script is updated to integrate the World interface changes

**[refactor: remove v1 network package, remove snap sync module, deprecate std-client (#1311)](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)** (@latticexyz/world)

The `SnapSyncModule` is removed. The recommended way of loading the initial state of a MUD app is via the new [`store-indexer`](https://mud.dev/indexer). Loading state via contract getter functions is not recommended, as it's computationally heavy on the RPC, can't be cached, and is an easy way to shoot yourself in the foot with exploding RPC costs.

The `@latticexyz/network` package was deprecated and is now removed. All consumers should upgrade to the new sync stack from `@latticexyz/store-sync`.

**[refactor(store): optimize PackedCounter (#1231)](https://github.com/latticexyz/mud/commit/433078c54c22fa1b4e32d7204fb41bd5f79ca1db)** (@latticexyz/cli, @latticexyz/protocol-parser, @latticexyz/services, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world)

Reverse PackedCounter encoding, to optimize gas for bitshifts.
Ints are right-aligned, shifting using an index is straightforward if they are indexed right-to-left.

- Previous encoding: (7 bytes | accumulator),(5 bytes | counter 1),...,(5 bytes | counter 5)
- New encoding: (5 bytes | counter 5),...,(5 bytes | counter 1),(7 bytes | accumulator)

**[feat(store,world): combine schema and metadata registration, rename getSchema to getValueSchema, change Schema table id (#1182)](https://github.com/latticexyz/mud/commit/afaf2f5ffb36fe389a3aba8da2f6d8c84bdb26ab)** (@latticexyz/cli, @latticexyz/store, @latticexyz/world, @latticexyz/store-sync, create-mud)

- `Store`'s internal schema table is now a normal table instead of using special code paths. It is renamed to Tables, and the table ID changed from `mudstore:schema` to `mudstore:Tables`
- `Store`'s `registerSchema` and `setMetadata` are combined into a single `registerTable` method. This means metadata (key names, field names) is immutable and indexers can create tables with this metadata when a new table is registered on-chain.

  ```diff
  -  function registerSchema(bytes32 table, Schema schema, Schema keySchema) external;
  -
  -  function setMetadata(bytes32 table, string calldata tableName, string[] calldata fieldNames) external;

  +  function registerTable(
  +    bytes32 table,
  +    Schema keySchema,
  +    Schema valueSchema,
  +    string[] calldata keyNames,
  +    string[] calldata fieldNames
  +  ) external;
  ```

- `World`'s `registerTable` method is updated to match the `Store` interface, `setMetadata` is removed
- The `getSchema` method is renamed to `getValueSchema` on all interfaces
  ```diff
  - function getSchema(bytes32 table) external view returns (Schema schema);
  + function getValueSchema(bytes32 table) external view returns (Schema valueSchema);
  ```
- The `store-sync` and `cli` packages are updated to integrate the breaking protocol changes. Downstream projects only need to manually integrate these changes if they access low level `Store` or `World` functions. Otherwise, a fresh deploy with the latest MUD will get you these changes.

**[refactor: remove v1 network package, remove snap sync module, deprecate std-client (#1311)](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)** (@latticexyz/services, create-mud)

Move `createFaucetService` from `@latticexyz/network` to `@latticexyz/services/faucet`.

```diff
- import { createFaucetService } from "@latticexyz/network";
+ import { createFaucetService } from "@latticexyz/services/faucet";
```

**[refactor: remove v1 network package, remove snap sync module, deprecate std-client (#1311)](https://github.com/latticexyz/mud/commit/331f0d636f6f327824307570a63fb301d9b897d1)** (@latticexyz/std-client, @latticexyz/common, create-mud)

Deprecate `@latticexyz/std-client` and remove v1 network dependencies.

- `getBurnerWallet` is replaced by `getBurnerPrivateKey` from `@latticexyz/common`. It now returns a `Hex` string instead of an `rxjs` `BehaviorSubject`.

  ```
  - import { getBurnerWallet } from "@latticexyz/std-client";
  + import { getBurnerPrivateKey } from "@latticexyz/common";

  - const privateKey = getBurnerWallet().value;
  - const privateKey = getBurnerPrivateKey();
  ```

- All functions from `std-client` that depended on v1 network code are removed (most notably `setupMUDNetwork` and `setupMUDV2Network`). Consumers should upgrade to v2 networking code from `@latticexyz/store-sync`.

- The following functions are removed from `std-client` because they are very use-case specific and depend on deprecated code: `getCurrentTurn`, `getTurnAtTime`, `getGameConfig`, `isUntraversable`, `getPlayerEntity`, `resolveRelationshipChain`, `findEntityWithComponentInRelationshipChain`, `findInRelationshipChain`. Consumers should vendor these functions if they are still needed.

- Remaining exports from `std-client` are moved to `/deprecated`. The package will be removed in a future release (once there are replacements for the deprecated exports).

  ```diff
  - import { ... } from "@latticexyz/std-client";
  + import { ... } from "@latticexyz/std-client/deprecated";
  ```

### Patch changes

**[feat(common,store-sync): improve initial sync to not block returned promise (#1315)](https://github.com/latticexyz/mud/commit/bb6ada74016bdd5fdf83c930008c694f2f62505e)** (@latticexyz/common, @latticexyz/store-sync)

Initial sync from indexer no longer blocks the promise returning from `createStoreSync`, `syncToRecs`, and `syncToSqlite`. This should help with rendering loading screens using the `SyncProgress` RECS component and avoid the long flashes of no content in templates.

By default, `syncToRecs` and `syncToSqlite` will start syncing (via observable subscription) immediately after called.

If your app needs to control when syncing starts, you can use the `startSync: false` option and then `blockStoreOperations$.subscribe()` to start the sync yourself. Just be sure to unsubscribe to avoid memory leaks.

```ts
const { blockStorageOperations$ } = syncToRecs({
  ...
  startSync: false,
});

// start sync manually by subscribing to `blockStorageOperation$`
const subcription = blockStorageOperation$.subscribe();

// clean up subscription
subscription.unsubscribe();
```

**[refactor(store): optimize table libraries (#1303)](https://github.com/latticexyz/mud/commit/d5b73b12666699c442d182ee904fa8747b78fefd)** (@latticexyz/store)

Optimize autogenerated table libraries

**[feat(store-sync): add more logging to waitForTransaction (#1317)](https://github.com/latticexyz/mud/commit/3e024fcf395a1c1b38d12362fc98472290eb7cf1)** (@latticexyz/store-sync)

add retry attempts and more logging to `waitForTransaction`

**[refactor(store): optimize Schema (#1252)](https://github.com/latticexyz/mud/commit/0d12db8c2170905f5116111e6bc417b6dca8eb61)** (@latticexyz/store, @latticexyz/world)

Optimize Schema methods.
Return `uint256` instead of `uint8` in SchemaInstance numFields methods

---

## Version 2.0.0-next.2

### Major changes

**[feat(store-indexer): use fastify, move trpc to /trpc (#1232)](https://github.com/latticexyz/mud/commit/b621fb97731a0ceed9b67d741f40648a8aa64817)** (@latticexyz/store-indexer)

Adds a [Fastify](https://fastify.dev/) server in front of tRPC and puts tRPC endpoints under `/trpc` to make way for other top-level endpoints (e.g. [tRPC panel](https://github.com/iway1/trpc-panel) or other API frontends like REST or gRPC).

If you're using `@latticexyz/store-sync` packages with an indexer (either `createIndexerClient` or `indexerUrl` argument of `syncToRecs`), then you'll want to update your indexer URL:

```diff
 createIndexerClient({
-  url: "https://indexer.dev.linfra.xyz",
+  url: "https://indexer.dev.linfra.xyz/trpc",
 });
```

```diff
 syncToRecs({
   ...
-  indexerUrl: "https://indexer.dev.linfra.xyz",
+  indexerUrl: "https://indexer.dev.linfra.xyz/trpc",
 });
```

**[refactor(store): remove TableId library (#1279)](https://github.com/latticexyz/mud/commit/a25881160cb3283e11d218be7b8a9fe38ee83062)** (@latticexyz/store)

Remove `TableId` library to simplify `store` package

**[feat(create-mud): infer recs components from config (#1278)](https://github.com/latticexyz/mud/commit/48c51b52acab147a2ed97903c43bafa9b6769473)** (@latticexyz/cli, @latticexyz/std-client, @latticexyz/store-sync, @latticexyz/store, @latticexyz/world, create-mud)

RECS components are now dynamically created and inferred from your MUD config when using `syncToRecs`.

To migrate existing projects after upgrading to this MUD version:

1. Remove `contractComponents.ts` from `client/src/mud`
2. Remove `components` argument from `syncToRecs`
3. Update `build:mud` and `dev` scripts in `contracts/package.json` to remove tsgen

   ```diff
   - "build:mud": "mud tablegen && mud worldgen && mud tsgen --configPath mud.config.ts --out ../client/src/mud",
   + "build:mud": "mud tablegen && mud worldgen",
   ```

   ```diff
   - "dev": "pnpm mud dev-contracts --tsgenOutput ../client/src/mud",
   + "dev": "pnpm mud dev-contracts",
   ```

**[feat: bump viem to 1.6.0 (#1308)](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)** (@latticexyz/block-logs-stream)

- removes our own `getLogs` function now that viem's `getLogs` supports using multiple `events` per RPC call.
- removes `isNonPendingBlock` and `isNonPendingLog` helpers now that viem narrows `Block` and `Log` types based on inputs
- simplifies `groupLogsByBlockNumber` types and tests

**[feat(dev-tools): use new sync stack (#1284)](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad)** (@latticexyz/dev-tools, create-mud)

MUD dev tools is updated to latest sync stack. You must now pass in all of its data requirements rather than relying on magic globals.

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

### Minor changes

**[feat(dev-tools): use new sync stack (#1284)](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad)** (@latticexyz/common)

`createContract` now has an `onWrite` callback so you can observe writes. This is useful for wiring up the transanction log in MUD dev tools.

```ts
import { createContract, ContractWrite } from "@latticexyz/common";
import { Subject } from "rxjs";

const write$ = new Subject<ContractWrite>();
creactContract({
  ...
  onWrite: (write) => write$.next(write),
});
```

**[feat: bump viem to 1.6.0 (#1308)](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)** (@latticexyz/common)

- adds `defaultPriorityFee` to `mudFoundry` for better support with MUD's default anvil config and removes workaround in `createContract`
- improves nonce error detection using viem's custom errors

**[feat(store-sync,store-indexer): consolidate sync logic, add syncToSqlite (#1240)](https://github.com/latticexyz/mud/commit/753bdce41597200641daba60727ff1b53d2b512e)** (@latticexyz/dev-tools, @latticexyz/store-indexer, @latticexyz/store-sync)

Store sync logic is now consolidated into a `createStoreSync` function exported from `@latticexyz/store-sync`. This simplifies each storage sync strategy to just a simple wrapper around the storage adapter. You can now sync to RECS with `syncToRecs` or SQLite with `syncToSqlite` and PostgreSQL support coming soon.

There are no breaking changes if you were just using `syncToRecs` from `@latticexyz/store-sync` or running the `sqlite-indexer` binary from `@latticexyz/store-indexer`.

**[feat(dev-tools): use new sync stack (#1284)](https://github.com/latticexyz/mud/commit/939916bcd5c9f3caf0399e9ab7689e77e6bef7ad)** (@latticexyz/react)

Adds a `usePromise` hook that returns a [native `PromiseSettledResult` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled).

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

### Patch changes

**[feat: bump viem to 1.6.0 (#1308)](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)** (@latticexyz/block-logs-stream, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/network, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/std-client, @latticexyz/store-indexer, @latticexyz/store-sync, create-mud)

bump viem to 1.6.0

**[feat(dev-tools): improve support for non-store recs components (#1302)](https://github.com/latticexyz/mud/commit/5294a7d5983c52cb336373566afd6a8ec7fc4bfb)** (@latticexyz/dev-tools, @latticexyz/store-sync)

Improves support for internal/client-only RECS components

**[feat: bump viem to 1.6.0 (#1308)](https://github.com/latticexyz/mud/commit/b8a6158d63738ebfc1e7eb221909436d050c7e39)** (@latticexyz/store-sync)

remove usages of `isNonPendingBlock` and `isNonPendingLog` (fixed with more specific viem types)

---

## Version 2.0.0-next.1

### Major changes

**[chore: fix changeset type (#1220)](https://github.com/latticexyz/mud/commit/2f6cfef91daacf09db82a4b7c69cff3af583b8f6)** (@latticexyz/store-indexer, @latticexyz/store-sync)

Adds store indexer service package with utils to query the indexer service.

You can run the indexer locally by checking out the MUD monorepo, installing/building everything, and running `pnpm start:local` from `packages/store-indexer`.

To query the indexer in the client, you can create a tRPC client with a URL pointing to the indexer service and call the available tRPC methods:

```ts
import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";

const indexer = createIndexerClient({ url: indexerUrl });
const result = await indexer.findAll.query({
  chainId: publicClient.chain.id,
  address,
});
```

If you're using `syncToRecs`, you can just pass in the `indexerUrl` option as a shortcut to the above:

```ts
import { syncToRecs } from "@latticexyz/store-sync/recs";

syncToRecs({
  ...
  indexerUrl: "https://your.indexer.service",
});
```

**[fix: changeset package name (#1270)](https://github.com/latticexyz/mud/commit/9a7c9009a43bc5691bb33996bcf669711cc51503)** (@latticexyz/cli, @latticexyz/common, @latticexyz/recs, @latticexyz/store-indexer, create-mud)

Templates and examples now use MUD's new sync packages, all built on top of [viem](https://viem.sh/). This greatly speeds up and stabilizes our networking code and improves types throughout.

These new sync packages come with support for our `recs` package, including `encodeEntity` and `decodeEntity` utilities for composite keys.

If you're using `store-cache` and `useRow`/`useRows`, you should wait to upgrade until we have a suitable replacement for those libraries. We're working on a [sql.js](https://github.com/sql-js/sql.js/)-powered sync module that will replace `store-cache`.

**Migrate existing RECS apps to new sync packages**

As you migrate, you may find some features replaced, removed, or not included by default. Please [open an issue](https://github.com/latticexyz/mud/issues/new) and let us know if we missed anything.

1. Add `@latticexyz/store-sync` package to your app's `client` package and make sure `viem` is pinned to version `1.3.1` (otherwise you may get type errors)

2. In your `supportedChains.ts`, replace `foundry` chain with our new `mudFoundry` chain.

   ```diff
   - import { foundry } from "viem/chains";
   - import { MUDChain, latticeTestnet } from "@latticexyz/common/chains";
   + import { MUDChain, latticeTestnet, mudFoundry } from "@latticexyz/common/chains";

   - export const supportedChains: MUDChain[] = [foundry, latticeTestnet];
   + export const supportedChains: MUDChain[] = [mudFoundry, latticeTestnet];
   ```

3. In `getNetworkConfig.ts`, remove the return type (to let TS infer it for now), remove now-unused config values, and add the viem `chain` object.

   ```diff
   - export async function getNetworkConfig(): Promise<NetworkConfig> {
   + export async function getNetworkConfig() {
   ```

   ```diff
     const initialBlockNumber = params.has("initialBlockNumber")
       ? Number(params.get("initialBlockNumber"))
   -   : world?.blockNumber ?? -1; // -1 will attempt to find the block number from RPC
   +   : world?.blockNumber ?? 0n;
   ```

   ```diff
   + return {
   +   privateKey: getBurnerWallet().value,
   +   chain,
   +   worldAddress,
   +   initialBlockNumber,
   +   faucetServiceUrl: params.get("faucet") ?? chain.faucetUrl,
   + };
   ```

4. In `setupNetwork.ts`, replace `setupMUDV2Network` with `syncToRecs`.

   ```diff
   - import { setupMUDV2Network } from "@latticexyz/std-client";
   - import { createFastTxExecutor, createFaucetService, getSnapSyncRecords } from "@latticexyz/network";
   + import { createFaucetService } from "@latticexyz/network";
   + import { createPublicClient, fallback, webSocket, http, createWalletClient, getContract, Hex, parseEther, ClientConfig } from "viem";
   + import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
   + import { createBurnerAccount, createContract, transportObserver } from "@latticexyz/common";
   ```

   ```diff
   - const result = await setupMUDV2Network({
   -   ...
   - });

   + const clientOptions = {
   +   chain: networkConfig.chain,
   +   transport: transportObserver(fallback([webSocket(), http()])),
   +   pollingInterval: 1000,
   + } as const satisfies ClientConfig;

   + const publicClient = createPublicClient(clientOptions);

   + const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
   + const burnerWalletClient = createWalletClient({
   +   ...clientOptions,
   +   account: burnerAccount,
   + });

   + const { components, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
   +   world,
   +   config: storeConfig,
   +   address: networkConfig.worldAddress as Hex,
   +   publicClient,
   +   components: contractComponents,
   +   startBlock: BigInt(networkConfig.initialBlockNumber),
   +   indexerUrl: networkConfig.indexerUrl ?? undefined,
   + });

   + const worldContract = createContract({
   +   address: networkConfig.worldAddress as Hex,
   +   abi: IWorld__factory.abi,
   +   publicClient,
   +   walletClient: burnerWalletClient,
   + });
   ```

   ```diff
     // Request drip from faucet
   - const signer = result.network.signer.get();
   - if (networkConfig.faucetServiceUrl && signer) {
   -   const address = await signer.getAddress();
   + if (networkConfig.faucetServiceUrl) {
   +   const address = burnerAccount.address;
   ```

   ```diff
     const requestDrip = async () => {
   -   const balance = await signer.getBalance();
   +   const balance = await publicClient.getBalance({ address });
       console.info(`[Dev Faucet]: Player balance -> ${balance}`);
   -   const lowBalance = balance?.lte(utils.parseEther("1"));
   +   const lowBalance = balance < parseEther("1");
   ```

   You can remove the previous ethers `worldContract`, snap sync code, and fast transaction executor.

   The return of `setupNetwork` is a bit different than before, so you may have to do corresponding app changes.

   ```diff
   + return {
   +   world,
   +   components,
   +   playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
   +   publicClient,
   +   walletClient: burnerWalletClient,
   +   latestBlock$,
   +   blockStorageOperations$,
   +   waitForTransaction,
   +   worldContract,
   + };
   ```

5. Update `createSystemCalls` with the new return type of `setupNetwork`.

   ```diff
     export function createSystemCalls(
   -   { worldSend, txReduced$, singletonEntity }: SetupNetworkResult,
   +   { worldContract, waitForTransaction }: SetupNetworkResult,
       { Counter }: ClientComponents
     ) {
        const increment = async () => {
   -      const tx = await worldSend("increment", []);
   -      await awaitStreamValue(txReduced$, (txHash) => txHash === tx.hash);
   +      const tx = await worldContract.write.increment();
   +      await waitForTransaction(tx);
          return getComponentValue(Counter, singletonEntity);
        };
   ```

6. (optional) If you still need a clock, you can create it with:

   ```ts
   import { map, filter } from "rxjs";
   import { createClock } from "@latticexyz/network";

   const clock = createClock({
     period: 1000,
     initialTime: 0,
     syncInterval: 5000,
   });

   world.registerDisposer(() => clock.dispose());

   latestBlock$
     .pipe(
       map((block) => Number(block.timestamp) * 1000), // Map to timestamp in ms
       filter((blockTimestamp) => blockTimestamp !== clock.lastUpdateTime), // Ignore if the clock was already refreshed with this block
       filter((blockTimestamp) => blockTimestamp !== clock.currentTime), // Ignore if the current local timestamp is correct
     )
     .subscribe(clock.update); // Update the local clock
   ```

If you're using the previous `LoadingState` component, you'll want to migrate to the new `SyncProgress`:

```ts
import { SyncStep, singletonEntity } from "@latticexyz/store-sync/recs";

const syncProgress = useComponentValue(SyncProgress, singletonEntity, {
  message: "Connecting",
  percentage: 0,
  step: SyncStep.INITIALIZE,
});

if (syncProgress.step === SyncStep.LIVE) {
  // we're live!
}
```

**[feat(common): replace TableId with tableIdToHex/hexToTableId (#1258)](https://github.com/latticexyz/mud/commit/6c6733256f91cddb0e913217cbd8e02e6bc484c7)** (@latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/network, @latticexyz/std-client, @latticexyz/store-sync)

Add `tableIdToHex` and `hexToTableId` pure functions and move/deprecate `TableId`.

**[feat(common): add createContract, createNonceManager utils (#1261)](https://github.com/latticexyz/mud/commit/cd5abcc3b4744fab9a45c322bc76ff013355ffcb)** (@latticexyz/common)

Add utils for using viem with MUD

- `createContract` is a wrapper around [viem's `getContract`](https://viem.sh/docs/contract/getContract.html) but with better nonce handling for faster executing of transactions. It has the same arguments and return type as `getContract`.
- `createNonceManager` helps track local nonces, used by `createContract`.

Also renames `mudTransportObserver` to `transportObserver`.

### Minor changes

**[feat(common): add viem utils (#1245)](https://github.com/latticexyz/mud/commit/3fb9ce2839271a0dcfe97f86394195f7a6f70f50)** (@latticexyz/common)

Add utils for using viem with MUD

- `mudFoundry` chain with a transaction request formatter that temporarily removes max fees to work better with anvil `--base-fee 0`
- `createBurnerAccount` that also temporarily removes max fees during transaction signing to work better with anvil `--base-fee 0`
- `mudTransportObserver` that will soon let MUD Dev Tools observe transactions

You can use them like:

```ts
import { createBurnerAccount, mudTransportObserver } from "@latticexyz/common";
import { mudFoundry } from "@latticexyz/common/chains";

createWalletClient({
  account: createBurnerAccount(privateKey),
  chain: mudFoundry,
  transport: mudTransportObserver(http()),
  pollingInterval: 1000,
});
```

**[feat(store-indexer,store-sync): make chain optional, configure indexer with RPC (#1234)](https://github.com/latticexyz/mud/commit/131c63e539a8e9947835dcc323c8b37562aed9ca)** (@latticexyz/store-indexer, @latticexyz/store-sync)

- Accept a plain viem `PublicClient` (instead of requiring a `Chain` to be set) in `store-sync` and `store-indexer` functions. These functions now fetch chain ID using `publicClient.getChainId()` when no `publicClient.chain.id` is present.
- Allow configuring `store-indexer` with a set of RPC URLs (`RPC_HTTP_URL` and `RPC_WS_URL`) instead of `CHAIN_ID`.

**[feat(store-sync): export singletonEntity as const, allow startBlock in syncToRecs (#1235)](https://github.com/latticexyz/mud/commit/582388ba5f95c3efde56779058220dbd7aedee0b)** (@latticexyz/store-sync)

Export `singletonEntity` as const rather than within the `syncToRecs` result.

```diff
- const { singletonEntity, ... } = syncToRecs({ ... });
+ import { singletonEntity, syncToRecs } from "@latticexyz/store-sync/recs";
+ const { ... } = syncToRecs({ ... });
```

**[feat(schema-type): add type narrowing isStaticAbiType (#1196)](https://github.com/latticexyz/mud/commit/b02f9d0e43089e5f9b46d817ea2032ce0a1b0b07)** (@latticexyz/schema-type)

add type narrowing `isStaticAbiType`

**[feat(common): move zero gas fee override to `createContract` (#1266)](https://github.com/latticexyz/mud/commit/6071163f70599384c5034dd772ef6fc7cdae9983)** (@latticexyz/common)

- Moves zero gas fee override to `createContract` until https://github.com/wagmi-dev/viem/pull/963 or similar feature lands
- Skip simulation if `gas` is provided

### Patch changes

**[fix(cli): add support for legacy transactions in deploy script (#1178)](https://github.com/latticexyz/mud/commit/168a4cb43ce4f7bfbdb7b1b9d4c305b912a0d3f2)** (@latticexyz/cli)

Add support for legacy transactions in deploy script by falling back to `gasPrice` if `lastBaseFeePerGas` is not available

**[feat: protocol-parser in go (#1116)](https://github.com/latticexyz/mud/commit/3236f799e501be227da6e42e7b41a4928750115c)** (@latticexyz/services)

protocol-parser in Go

**[refactor(store): optimize Storage library (#1194)](https://github.com/latticexyz/mud/commit/c963b46c7eaceebc652930936643365b8c48a021)** (@latticexyz/store)

Optimize storage library

**[feat(common): remove need for tx queue in `createContract` (#1271)](https://github.com/latticexyz/mud/commit/35c9f33dfb84b0bb94e0f7a8b0c9830761795bdb)** (@latticexyz/common)

- Remove need for tx queue in `createContract`

**[feat(store-sync): add block numbers to SyncProgress (#1228)](https://github.com/latticexyz/mud/commit/57a5260830401c9ad93196a895a50b0fc4a86183)** (@latticexyz/store-sync)

Adds `latestBlockNumber` and `lastBlockNumberProcessed` to internal `SyncProgress` component

**[feat(store-sync): sync to RECS (#1197)](https://github.com/latticexyz/mud/commit/9e5baf4fff0c60615b8f2b4645fb11cb78cb0bd8)** (@latticexyz/store-sync)

Add RECS sync strategy and corresponding utils

```ts
import { createPublicClient, http } from 'viem';
import { syncToRecs } from '@latticexyz/store-sync';
import storeConfig from 'contracts/mud.config';
import { defineContractComponents } from './defineContractComponents';

const publicClient = createPublicClient({
  chain,
  transport: http(),
  pollingInterval: 1000,
});

const { components, singletonEntity, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
  world,
  config: storeConfig,
  address: '0x...',
  publicClient,
  components: defineContractComponents(...),
});
```

**[fix(store): align Store event names between IStoreWrite and StoreCore (#1237)](https://github.com/latticexyz/mud/commit/5c965a919355bf98d7ea69463890fe605bcde206)** (@latticexyz/store)

Align Store events parameter naming between IStoreWrite and StoreCore

**[fix(cli): explicit import of world as type (#1206)](https://github.com/latticexyz/mud/commit/e259ef79f4d9026353176d0f74628cae50c2f69b)** (@latticexyz/cli, @latticexyz/std-client)

Generated `contractComponents` now properly import `World` as type

**[feat(store-sync): export singletonEntity as const, allow startBlock in syncToRecs (#1235)](https://github.com/latticexyz/mud/commit/582388ba5f95c3efde56779058220dbd7aedee0b)** (@latticexyz/store-sync)

Add `startBlock` option to `syncToRecs`.

```ts
import { syncToRecs } from "@latticexyz/store-sync/recs";
import worlds from "contracts/worlds.json";

syncToRecs({
  startBlock: worlds['31337'].blockNumber,
  ...
});
```

**[chore: pin node to 18.16.1 (#1200)](https://github.com/latticexyz/mud/commit/0d1a7e03a0c8258c76d0b4b76a1a558ae07bbf85)** (@latticexyz/network)

Remove devEmit function when sending network events from SyncWorker because they can't be serialized across the web worker boundary.

**[feat(cli,recs,std-client): update RECS components with v2 key/value schemas (#1195)](https://github.com/latticexyz/mud/commit/afdba793fd84abf17eef5ef59dd56fabe353c8bd)** (@latticexyz/cli, @latticexyz/recs, @latticexyz/std-client)

Update RECS components with v2 key/value schemas. This helps with encoding/decoding composite keys and strong types for keys/values.

This may break if you were previously dependent on `component.id`, `component.metadata.componentId`, or `component.metadata.tableId`:

- `component.id` is now the on-chain `bytes32` hex representation of the table ID
- `component.metadata.componentName` is the table name (e.g. `Position`)
- `component.metadata.tableName` is the namespaced table name (e.g. `myworld:Position`)
- `component.metadata.keySchema` is an object with key names and their corresponding ABI types
- `component.metadata.valueSchema` is an object with field names and their corresponding ABI types

**[refactor(store): update tightcoder codegen, optimize TightCoder library (#1210)](https://github.com/latticexyz/mud/commit/cc2c8da000c32c02a82a1a0fd17075d11eac56c3)** (@latticexyz/common, @latticexyz/store, @latticexyz/world)

- Refactor tightcoder to use typescript functions instead of ejs
- Optimize `TightCoder` library
- Add `isLeftAligned` and `getLeftPaddingBits` common codegen helpers

---

## Version 2.0.0-next.0

### Minor changes

**[feat(store-sync): add store sync package (#1075)](https://github.com/latticexyz/mud/commit/904fd7d4ee06a86e481e3e02fd5744224376d0c9)** (@latticexyz/block-logs-stream, @latticexyz/protocol-parser, @latticexyz/store-sync, @latticexyz/store)

Add store sync package

**[feat(protocol-parser): add abiTypesToSchema (#1100)](https://github.com/latticexyz/mud/commit/b98e51808aaa29f922ac215cf666cf6049e692d6)** (@latticexyz/protocol-parser)

feat: add abiTypesToSchema, a util to turn a list of abi types into a Schema by separating static and dynamic types

**[chore(protocol-parser): add changeset for #1099 (#1111)](https://github.com/latticexyz/mud/commit/ca50fef8108422a121d03571fb4679060bd4891a)** (@latticexyz/protocol-parser)

feat: add `encodeKeyTuple`, a util to encode key tuples in Typescript (equivalent to key tuple encoding in Solidity and inverse of `decodeKeyTuple`).
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

**[feat(store-sync): rework blockLogsToStorage (#1176)](https://github.com/latticexyz/mud/commit/eeb15cc06fcbe80c37ba3926d9387f6bd5947234)** (@latticexyz/block-logs-stream, @latticexyz/store-sync)

- Replace `blockEventsToStorage` with `blockLogsToStorage` that exposes a `storeOperations` callback to perform database writes from store operations. This helps encapsulates database adapters into a single wrapper/instance of `blockLogsToStorage` and allows for wrapping a block of store operations in a database transaction.
- Add `toBlock` option to `groupLogsByBlockNumber` and remove `blockHash` from results. This helps track the last block number for a given set of logs when used in the context of RxJS streams.

**[feat(block-logs-stream): add block logs stream package (#1070)](https://github.com/latticexyz/mud/commit/72b806979db6eb2880772193898351d657b94f75)** (@latticexyz/block-logs-stream)

Add block logs stream package

```ts
import { filter, map, mergeMap } from "rxjs";
import { createPublicClient, parseAbi } from "viem";
import {
  createBlockStream,
  isNonPendingBlock,
  groupLogsByBlockNumber,
  blockRangeToLogs,
} from "@latticexyz/block-logs-stream";

const publicClient = createPublicClient({
  // your viem public client config here
});

const latestBlock$ = await createBlockStream({ publicClient, blockTag: "latest" });

const latestBlockNumber$ = latestBlock$.pipe(
  filter(isNonPendingBlock),
  map((block) => block.number),
);

latestBlockNumber$
  .pipe(
    map((latestBlockNumber) => ({ startBlock: 0n, endBlock: latestBlockNumber })),
    blockRangeToLogs({
      publicClient,
      address,
      events: parseAbi([
        "event StoreDeleteRecord(bytes32 table, bytes32[] key)",
        "event StoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data)",
        "event StoreSetRecord(bytes32 table, bytes32[] key, bytes data)",
        "event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data)",
      ]),
    }),
    mergeMap(({ logs }) => from(groupLogsByBlockNumber(logs))),
  )
  .subscribe((block) => {
    console.log("got events for block", block);
  });
```

**[feat(gas-report): create package, move relevant files to it (#1147)](https://github.com/latticexyz/mud/commit/66cc35a8ccb21c50a1882d6c741dd045acd8bc11)** (@latticexyz/cli, @latticexyz/gas-report, @latticexyz/store)

Create gas-report package, move gas-report cli command and GasReporter contract to it

**[refactor(store,world): replace isStore with storeAddress (#1061)](https://github.com/latticexyz/mud/commit/a7b30c79bcc78530d2d01858de46a0fb87954fda)** (@latticexyz/std-contracts, @latticexyz/store, @latticexyz/world)

Rename `MudV2Test` to `MudTest` and move from `@latticexyz/std-contracts` to `@latticexyz/store`.

```solidity
// old import
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
// new import
import { MudTest } from "@latticexyz/store/src/MudTest.sol";
```

Refactor `StoreSwitch` to use a storage slot instead of `function isStore()` to determine which contract is Store:

- Previously `StoreSwitch` called `isStore()` on `msg.sender` to determine if `msg.sender` is a `Store` contract. If the call succeeded, the `Store` methods were called on `msg.sender`, otherwise the data was written to the own storage.
- With this change `StoreSwitch` instead checks for an `address` in a known storage slot. If the address equals the own address, data is written to the own storage. If it is an external address, `Store` methods are called on this address. If it is unset (`address(0)`), store methods are called on `msg.sender`.
- In practice this has the same effect as before: By default the `World` contracts sets its own address in `StoreSwitch`, while `System` contracts keep the Store address undefined, so `Systems` write to their caller (`World`) if they are executed via `call` or directly to the `World` storage if they are executed via `delegatecall`.
- Besides gas savings, this change has two additional benefits:
  1. it is now possible for `Systems` to explicitly set a `Store` address to make them exclusive to that `Store` and
  2. table libraries can now be used in tests without having to provide an explicit `Store` argument, because the `MudTest` base contract redirects reads and writes to the internal `World` contract.

**[feat(store-sync): sync to sqlite (#1185)](https://github.com/latticexyz/mud/commit/69a96f109065ae2564a340208d5f9a0be3616747)** (@latticexyz/store-sync)

`blockLogsToStorage(sqliteStorage(...))` converts block logs to SQLite operations. You can use it like:

```ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createPublicClient } from "viem";
import { blockLogsToStorage } from "@latticexyz/store-sync";
import { sqliteStorage } from "@latticexyz/store-sync/sqlite";

const database = drizzle(new Database('store.db')) as any as BaseSQLiteDatabase<"sync", void>;
const publicClient = createPublicClient({ ... });

blockLogs$
  .pipe(
    concatMap(blockLogsToStorage(sqliteStorage({ database, publicClient }))),
    tap(({ blockNumber, operations }) => {
      console.log("stored", operations.length, "operations for block", blockNumber);
    })
  )
  .subscribe();
```

**[feat(common): new utils, truncate table ID parts (#1173)](https://github.com/latticexyz/mud/commit/0c4f9fea9e38ba122316cdd52c3d158c62f8cfee)** (@latticexyz/common)

`TableId.toHex()` now truncates name/namespace to 16 bytes each, to properly fit into a `bytes32` hex string.

Also adds a few utils we'll need in the indexer:

- `bigIntMin` is similar to `Math.min` but for `bigint`s
- `bigIntMax` is similar to `Math.max` but for `bigint`s
- `bigIntSort` for sorting an array of `bigint`s
- `chunk` to split an array into chunks
- `wait` returns a `Promise` that resolves after specified number of milliseconds

**[feat(cli): update set-version to match new release structure, add `--tag`, `--commit` (#1157)](https://github.com/latticexyz/mud/commit/c36ffd13c3d859d9a4eadd0e07f6f73ad96b54aa)** (@latticexyz/cli)

- update the `set-version` cli command to work with the new release process by adding two new options:
  - `--tag`: install the latest version of the given tag. For snapshot releases tags correspond to the branch name, commits to `main` result in an automatic snapshot release, so `--tag main` is equivalent to what used to be `-v canary`
  - `--commit`: install a version based on a given commit hash. Since commits from `main` result in an automatic snapshot release it works for all commits on main, and it works for manual snapshot releases from branches other than main
- `set-version` now updates all `package.json` nested below the current working directory (expect `node_modules`), so no need for running it each workspace of a monorepo separately.

Example:

```bash
pnpm mud set-version --tag main && pnpm install
pnpm mud set-version --commit db19ea39 && pnpm install
```

### Patch changes

**[fix(protocol-parser): properly decode empty records (#1177)](https://github.com/latticexyz/mud/commit/4bb7e8cbf0da45c85b70532dc73791e0e2e1d78c)** (@latticexyz/protocol-parser)

`decodeRecord` now properly decodes empty records

**[refactor(store): clean up Memory, make mcopy pure (#1153)](https://github.com/latticexyz/mud/commit/8d51a03486bc20006d8cc982f798dfdfe16f169f)** (@latticexyz/cli, @latticexyz/common, @latticexyz/store, @latticexyz/world)

Clean up Memory.sol, make mcopy pure

**[fix(recs): improve messages for v2 components (#1167)](https://github.com/latticexyz/mud/commit/1e2ad78e277b551dd1b8efb0e4438fb10441644c)** (@latticexyz/recs)

improve RECS error messages for v2 components

**[test: bump forge-std and ds-test (#1168)](https://github.com/latticexyz/mud/commit/48909d151b3dfceab128c120bc6bb77de53c456b)** (@latticexyz/cli, @latticexyz/gas-report, @latticexyz/noise, @latticexyz/schema-type, @latticexyz/solecs, @latticexyz/std-contracts, @latticexyz/store, @latticexyz/world, create-mud)

bump forge-std and ds-test dependencies

**[fix(schema-type): fix byte lengths for uint64/int64 (#1175)](https://github.com/latticexyz/mud/commit/f03531d97c999954a626ef63bc5bbae51a7b90f3)** (@latticexyz/schema-type)

Fix byte lengths for `uint64` and `int64`.

**[build: bump TS (#1165)](https://github.com/latticexyz/mud/commit/4e4a34150aeae988c8e61e25d55c227afb6c2d4b)** (@latticexyz/cli, create-mud, @latticexyz/utils, @latticexyz/world)

bump to latest TS version (5.1.6)

**[build: bump viem, abitype (#1179)](https://github.com/latticexyz/mud/commit/535229984565539e6168042150b45fe0f9b48b0f)** (@latticexyz/block-logs-stream, @latticexyz/cli, @latticexyz/common, @latticexyz/dev-tools, @latticexyz/network, @latticexyz/protocol-parser, @latticexyz/schema-type, @latticexyz/std-client, @latticexyz/store-cache, @latticexyz/store-sync, @latticexyz/store)

- bump to viem 1.3.0 and abitype 0.9.3
- move `@wagmi/chains` imports to `viem/chains`
- refine a few types

**[test(e2e): add more test cases (#1074)](https://github.com/latticexyz/mud/commit/086be4ef4f3c1ecb3eac0e9554d7d4eb64531fc2)** (@latticexyz/services)

fix a bug related to encoding negative bigints in MODE

**[fix: remove devEmit when sending events from SyncWorker (#1109)](https://github.com/latticexyz/mud/commit/e019c77619f0ace6b7ee01f6ce96498446895934)** (@latticexyz/network)

Remove devEmit function when sending network events from SyncWorker because they can't be serialized across the web worker boundary.

---
