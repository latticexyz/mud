[@latticexyz/network](../README.md) / NetworkConfig

# Interface: NetworkConfig

## Table of contents

### Properties

- [blockExplorer](NetworkConfig.md#blockexplorer)
- [cacheAgeThreshold](NetworkConfig.md#cacheagethreshold)
- [cacheInterval](NetworkConfig.md#cacheinterval)
- [chainId](NetworkConfig.md#chainid)
- [clock](NetworkConfig.md#clock)
- [encoders](NetworkConfig.md#encoders)
- [initialBlockNumber](NetworkConfig.md#initialblocknumber)
- [privateKey](NetworkConfig.md#privatekey)
- [provider](NetworkConfig.md#provider)
- [pruneOptions](NetworkConfig.md#pruneoptions)
- [snapshotServiceUrl](NetworkConfig.md#snapshotserviceurl)
- [streamServiceUrl](NetworkConfig.md#streamserviceurl)

## Properties

### blockExplorer

• `Optional` **blockExplorer**: `string`

#### Defined in

[types.ts:18](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L18)

---

### cacheAgeThreshold

• `Optional` **cacheAgeThreshold**: `number`

#### Defined in

[types.ts:19](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L19)

---

### cacheInterval

• `Optional` **cacheInterval**: `number`

#### Defined in

[types.ts:20](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L20)

---

### chainId

• **chainId**: `number`

#### Defined in

[types.ts:11](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L11)

---

### clock

• **clock**: [`ClockConfig`](ClockConfig.md)

#### Defined in

[types.ts:13](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L13)

---

### encoders

• `Optional` **encoders**: `boolean`

#### Defined in

[types.ts:21](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L21)

---

### initialBlockNumber

• `Optional` **initialBlockNumber**: `number`

#### Defined in

[types.ts:17](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L17)

---

### privateKey

• `Optional` **privateKey**: `string`

#### Defined in

[types.ts:12](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L12)

---

### provider

• **provider**: [`ProviderConfig`](ProviderConfig.md)

#### Defined in

[types.ts:14](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L14)

---

### pruneOptions

• `Optional` **pruneOptions**: `Object`

#### Type declaration

| Name                | Type     |
| :------------------ | :------- |
| `hashedComponentId` | `string` |
| `playerAddress`     | `string` |

#### Defined in

[types.ts:22](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L22)

---

### snapshotServiceUrl

• `Optional` **snapshotServiceUrl**: `string`

#### Defined in

[types.ts:15](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L15)

---

### streamServiceUrl

• `Optional` **streamServiceUrl**: `string`

#### Defined in

[types.ts:16](https://github.com/latticexyz/mud/blob/28a579f35/packages/network/src/types.ts#L16)
