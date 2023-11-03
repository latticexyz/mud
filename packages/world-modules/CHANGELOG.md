# Change Log

## 2.0.0-next.13

### Minor Changes

- d7325e51: Added the `ERC721Module` to `@latticexyz/world-modules`.
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

- 35348f83: Added the `PuppetModule` to `@latticexyz/world-modules`. The puppet pattern allows an external contract to be registered as an external interface for a MUD system.
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

- 83638373: Added the `ERC20Module` to `@latticexyz/world-modules`.
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

### Patch Changes

- Updated dependencies [3e057061]
- Updated dependencies [b1d41727]
  - @latticexyz/common@2.0.0-next.13
  - @latticexyz/config@2.0.0-next.13
  - @latticexyz/store@2.0.0-next.13
  - @latticexyz/world@2.0.0-next.13
  - @latticexyz/schema-type@2.0.0-next.13

## 2.0.0-next.12

### Major Changes

- 6ca1874e: Modules now revert with `Module_AlreadyInstalled` if attempting to install more than once with the same calldata.

  This is a temporary workaround for our deploy pipeline. We'll make these install steps more idempotent in the future.

### Patch Changes

- 7ce82b6f: Store config now defaults `storeArgument: false` for all tables. This means that table libraries, by default, will no longer include the extra functions with the `_store` argument. This default was changed to clear up the confusion around using table libraries in tests, `PostDeploy` scripts, etc.

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

- Updated dependencies [7ce82b6f]
- Updated dependencies [7fa2ca18]
- Updated dependencies [6ca1874e]
- Updated dependencies [06605615]
- Updated dependencies [f62c767e]
- Updated dependencies [f62c767e]
- Updated dependencies [d2f8e940]
- Updated dependencies [25086be5]
- Updated dependencies [29c3f508]
  - @latticexyz/store@2.0.0-next.12
  - @latticexyz/world@2.0.0-next.12
  - @latticexyz/common@2.0.0-next.12
  - @latticexyz/config@2.0.0-next.12
  - @latticexyz/schema-type@2.0.0-next.12

## 2.0.0-next.11

### Minor Changes

- 9352648b: Since [#1564](https://github.com/latticexyz/mud/pull/1564) the World can no longer call itself via an external call.
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

### Patch Changes

- Updated dependencies [16b13ea8]
- Updated dependencies [430e6b29]
- Updated dependencies [f99e8898]
- Updated dependencies [d075f82f]
  - @latticexyz/common@2.0.0-next.11
  - @latticexyz/world@2.0.0-next.11
  - @latticexyz/schema-type@2.0.0-next.11
  - @latticexyz/store@2.0.0-next.11
  - @latticexyz/config@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- [#1624](https://github.com/latticexyz/mud/pull/1624) [`88b1a5a1`](https://github.com/latticexyz/mud/commit/88b1a5a191b4adadf190de51cd47a5b033b6fb29) Thanks [@alvrs](https://github.com/alvrs)! - We now expose a `WorldContextConsumerLib` library with the same functionality as the `WorldContextConsumer` contract, but the ability to be used inside of internal libraries.
  We also renamed the `WorldContextProvider` library to `WorldContextProviderLib` for consistency.
- Updated dependencies [[`88b1a5a1`](https://github.com/latticexyz/mud/commit/88b1a5a191b4adadf190de51cd47a5b033b6fb29), [`7987c94d`](https://github.com/latticexyz/mud/commit/7987c94d61a2c759916a708774db9f3cf08edca8)]:
  - @latticexyz/world@2.0.0-next.10
  - @latticexyz/common@2.0.0-next.10
  - @latticexyz/config@2.0.0-next.10
  - @latticexyz/schema-type@2.0.0-next.10
  - @latticexyz/store@2.0.0-next.10

## 2.0.0-next.9

### Major Changes

- [#1591](https://github.com/latticexyz/mud/pull/1591) [`251170e1`](https://github.com/latticexyz/mud/commit/251170e1ef0b07466c597ea84df0cb49de7d6a23) Thanks [@alvrs](https://github.com/alvrs)! - All optional modules have been moved from `@latticexyz/world` to `@latticexyz/world-modules`.
  If you're using the MUD CLI, the import is already updated and no changes are necessary.

### Patch Changes

- [#1592](https://github.com/latticexyz/mud/pull/1592) [`c07fa021`](https://github.com/latticexyz/mud/commit/c07fa021501ff92be35c0491dd89bbb8161e1c07) Thanks [@alvrs](https://github.com/alvrs)! - Tables and interfaces in the `world` package are now generated to the `codegen` folder.
  This is only a breaking change if you imported tables or codegenerated interfaces from `@latticexyz/world` directly.
  If you're using the MUD CLI, the changed import paths are already integrated and no further changes are necessary.

  ```diff
  - import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";
  + import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

  ```

- [#1601](https://github.com/latticexyz/mud/pull/1601) [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70) Thanks [@alvrs](https://github.com/alvrs)! - Moved `store` tables to the `"store"` namespace (previously "mudstore") and `world` tables to the `"world"` namespace (previously root namespace).

- Updated dependencies [[`77dce993`](https://github.com/latticexyz/mud/commit/77dce993a12989dc58534ccf1a8928b156be494a), [`748f4588`](https://github.com/latticexyz/mud/commit/748f4588a218928bca041760448c26991c0d8033), [`aea67c58`](https://github.com/latticexyz/mud/commit/aea67c5804efb2a8b919f5aa3a053d9b04184e84), [`07dd6f32`](https://github.com/latticexyz/mud/commit/07dd6f32c9bb9f0e807bac3586c5cc9833f14ab9), [`c07fa021`](https://github.com/latticexyz/mud/commit/c07fa021501ff92be35c0491dd89bbb8161e1c07), [`90e4161b`](https://github.com/latticexyz/mud/commit/90e4161bb8574a279d9edb517ce7def3624adaa8), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`f9f9609e`](https://github.com/latticexyz/mud/commit/f9f9609ef69d7fa58cad6a9af3fe6d2eed6d8aa2), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`759514d8`](https://github.com/latticexyz/mud/commit/759514d8b980fa5fe49a4ef919d8008b215f2af8), [`d5094a24`](https://github.com/latticexyz/mud/commit/d5094a2421cf2882a317e3ad9600c8de004b20d4), [`0b8ce3f2`](https://github.com/latticexyz/mud/commit/0b8ce3f2c9b540dbd1c9ba21354f8bf850e72a96), [`de151fec`](https://github.com/latticexyz/mud/commit/de151fec07b63a6022483c1ad133c556dd44992e), [`ae340b2b`](https://github.com/latticexyz/mud/commit/ae340b2bfd98f4812ed3a94c746af3611645a623), [`e5d208e4`](https://github.com/latticexyz/mud/commit/e5d208e40b2b2fae223b48716ce3f62c530ea1ca), [`211be2a1`](https://github.com/latticexyz/mud/commit/211be2a1eba8600ad53be6f8c70c64a8523113b9), [`0f3e2e02`](https://github.com/latticexyz/mud/commit/0f3e2e02b5114e08fe700c18326db76816ffad3c), [`1f80a0b5`](https://github.com/latticexyz/mud/commit/1f80a0b52a5c2d051e3697d6e60aad7364b0a925), [`d0878928`](https://github.com/latticexyz/mud/commit/d08789282c8b8d4c12897e2ff5a688af9115fb1c), [`4c7fd3eb`](https://github.com/latticexyz/mud/commit/4c7fd3eb29e3d3954f2f1f36ace474a436082651), [`a0341daf`](https://github.com/latticexyz/mud/commit/a0341daf9fd87e8072ffa292a33f508dd37b8ca6), [`83583a50`](https://github.com/latticexyz/mud/commit/83583a5053de4e5e643572e3b1c0f49467e8e2ab), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`6573e38e`](https://github.com/latticexyz/mud/commit/6573e38e9064121540aa46ce204d8ca5d61ed847), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`6e66c5b7`](https://github.com/latticexyz/mud/commit/6e66c5b745a036c5bc5422819de9c518a6f6cc96), [`65c9546c`](https://github.com/latticexyz/mud/commit/65c9546c4ee8a410b21d032f02b0050442152e7e), [`44a5432a`](https://github.com/latticexyz/mud/commit/44a5432acb9c5af3dca1447c50219a00894c45a9), [`672d05ca`](https://github.com/latticexyz/mud/commit/672d05ca130649bd90df337c2bf03204a5878840), [`f1cd43bf`](https://github.com/latticexyz/mud/commit/f1cd43bf9264d5a23a3edf2a1ea4212361a72203), [`31ffc9d5`](https://github.com/latticexyz/mud/commit/31ffc9d5d0a6d030cc61349f0f8fbcf6748ebc48), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`63831a26`](https://github.com/latticexyz/mud/commit/63831a264b6b09501f380a4601f82ba7bf07a619), [`331dbfdc`](https://github.com/latticexyz/mud/commit/331dbfdcbbda404de4b0fd4d439d636ae2033853), [`92de5998`](https://github.com/latticexyz/mud/commit/92de59982fb9fc4e00e50c4a5232ed541f3ce71a), [`5741d53d`](https://github.com/latticexyz/mud/commit/5741d53d0a39990a0d7b2842f1f012973655e060), [`22ee4470`](https://github.com/latticexyz/mud/commit/22ee4470047e4611a3cae62e9d0af4713aa1e612), [`be313068`](https://github.com/latticexyz/mud/commit/be313068b158265c2deada55eebfd6ba753abb87), [`ac508bf1`](https://github.com/latticexyz/mud/commit/ac508bf189b098e66b59a725f58a2008537be130), [`bfcb293d`](https://github.com/latticexyz/mud/commit/bfcb293d1931edde7f8a3e077f6f555a26fd1d2f), [`1890f1a0`](https://github.com/latticexyz/mud/commit/1890f1a0603982477bfde1b7335969f51e2dce70), [`9b43029c`](https://github.com/latticexyz/mud/commit/9b43029c3c888f8e82b146312f5c2e92321c28a7), [`55ab88a6`](https://github.com/latticexyz/mud/commit/55ab88a60adb3ad72ebafef4d50513eb71e3c314), [`af639a26`](https://github.com/latticexyz/mud/commit/af639a26446ca4b689029855767f8a723557f62c), [`5e723b90`](https://github.com/latticexyz/mud/commit/5e723b90e6b18bc70d357ff4b0a1b217611236ae), [`99ab9cd6`](https://github.com/latticexyz/mud/commit/99ab9cd6fff1a732b47d63ead894292661682380), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`80dd6992`](https://github.com/latticexyz/mud/commit/80dd6992e98c90a91d417fc785d0d53260df6ce2), [`24a6cd53`](https://github.com/latticexyz/mud/commit/24a6cd536f0c31cab93fb7644751cb9376be383d), [`708b49c5`](https://github.com/latticexyz/mud/commit/708b49c50e05f7b67b596e72ebfcbd76e1ff6280), [`22ba7b67`](https://github.com/latticexyz/mud/commit/22ba7b675bd50d1bb18b8a71c0de17c6d70d78c7), [`c049c23f`](https://github.com/latticexyz/mud/commit/c049c23f48b93ac7881fb1a5a8417831611d5cbf), [`251170e1`](https://github.com/latticexyz/mud/commit/251170e1ef0b07466c597ea84df0cb49de7d6a23), [`c4f49240`](https://github.com/latticexyz/mud/commit/c4f49240d7767c3fa7a25926f74b4b62ad67ca04), [`cea754dd`](https://github.com/latticexyz/mud/commit/cea754dde0d8abf7392e93faa319b260956ae92b), [`95c59b20`](https://github.com/latticexyz/mud/commit/95c59b203259c20a6f944c5f9af008b44e2902b6)]:
  - @latticexyz/world@2.0.0-next.9
  - @latticexyz/store@2.0.0-next.9
  - @latticexyz/common@2.0.0-next.9
  - @latticexyz/schema-type@2.0.0-next.9
  - @latticexyz/config@2.0.0-next.9
