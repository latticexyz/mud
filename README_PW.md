# MUD

<div align="center">
<img src="docs/public/logo512-black-w-background.png" width="200" style="margin: 0 0 30px 0;" alt="MUD logo" />
<p>MUD - Engine for Autonomous Worlds</p>
</div>

## Compile `CoreModule.sol`

> Compile with `--is-system` flag
> Compile with `-r` flag to remap locally imported contracts

```bash
zkforge zkb --match-contract CoreModule.sol -r --is-system
```

Output:

```r
Compiling smart contracts...
System mode enabled
CoreModule -> Bytecode Hash: 01000cb97bb3e8940901d20fd39ff5c4dd088171423992c5445d9f49d9b5259c
Compiled Successfully
```

## Deploy CoreModule.sol

```bash
zkforge zkc src/zk_remapped_local/CoreModule/CoreModule.sol:CoreModule
 --rpc-url https://testnet.era.zksync.dev --private-key <PRIVATE_KEY> --chain 280
```

Output:

```r
Factory Dependency Detected - Path: "src/zk_remapped_local/CoreModule/CoreSystem.sol:CoreSystem"
Contract deployed at: 0x42dc3b26eceb561eee9c5e9f699a41709b7be992
+-------------------------------------------------+
Contract successfully deployed to address: 0x59935d420ff0d84a43fcf27930254e8de549c5f4
Transaction Hash: 0x9f8c56f08cb8c46b5720516a34110e75a38255a71c659dc3531e4029fcd4c250
Gas used: 232492
Effective gas price: 250000000
Block Number: 12984317
+-------------------------------------------------+
```

Output file stored at `src/zk_deploys/CoreModule/latest.json`:

```json
{
  "contract_name": "CoreModule",
  "timestamp": "1698259516",
  "chain_id": "280",
  "block_number": "12984317",
  "deployed address": "0x59935d420ff0d84a43fcf27930254e8de549c5f4",
  "transaction_hash": "0x9f8c56f08cb8c46b5720516a34110e75a38255a71c659dc3531e4029fcd4c250",
  "gas_price": "250000000",
  "gas_used": "232492"
}
```

## Compile `WorldFactory.sol`

> Compile with `--is-system` flag
> Compile with `-r` flag to remap locally imported contracts

```bash
zkforge zkb --match-contract WorldFactory.sol -r --is-system
```

Output:

```r
Compiling smart contracts...
System mode enabled
WorldFactory -> Bytecode Hash: 0100008d094ff78422379624a1b740a26c27cdff5390ef8e6b93cc23a4dcfead
Compiled Successfully
```

## Deploy `WorldFactory.sol`

> Constructor arg - `CoreModule` deployed address

```bash
zkforge zkc src/zk_remapped_local/WorldFactory/WorldFactory.sol:WorldF
actory --constructor-args 0x59935d420ff0d84a43fcf27930254e8de549c5f4 --rpc-url https://testnet.era.zksync.dev --private-key <PRIVATE_KEY> --chain 280
```

Output:

```r
Factory Dependency Detected - Path: "src/zk_remapped_local/WorldFactory/World.sol:World"
Contract deployed at: 0x372a98a8f173bf2042533b87f2047e4e09e14b9a
+-------------------------------------------------+
Contract successfully deployed to address: 0x20c98852063fb271c7c6639902ec7104f3475986
Transaction Hash: 0xffa5928c09f20aa485b79a50977c8298c0831c25f6781e2af25108f0d7626130
Gas used: 160775
Effective gas price: 250000000
Block Number: 12984354
+-------------------------------------------------+
```

Output file stored at `src/zk_deploys/WorldFactory/latest.json`:

```json
{
  "contract_name": "WorldFactory",
  "timestamp": "1698259670",
  "chain_id": "280",
  "block_number": "12984354",
  "deployed address": "0x20c98852063fb271c7c6639902ec7104f3475986",
  "transaction_hash": "0xffa5928c09f20aa485b79a50977c8298c0831c25f6781e2af25108f0d7626130",
  "gas_price": "250000000",
  "gas_used": "160775"
}
```

## Deploy `World.sol`

```bash
zkcast zks 0x20c98852063fb271c7c6639902ec7104f3475986 "deployWorld()(a
ddress)" --rpc-url https://testnet.era.zksync.dev --private-key <PRIVATE_KEY> --cha
in 280
```
