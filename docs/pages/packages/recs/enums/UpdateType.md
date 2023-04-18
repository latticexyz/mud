[@latticexyz/recs](../README.md) / UpdateType

# Enumeration: UpdateType

Used to specify type of [ComponentUpdate](../README.md#componentupdate).

- Enter: Update added a value to an entity that did not have a value before
- Exit: Update removed a value from an entity that had a value before
- Update: Update changed a value of an entity that already had a value before. Note: the value doesn't need to be different from the previous value.
- Noop: Update did nothing (removed a value from an entity that did not have a value)

## Table of contents

### Enumeration Members

- [Enter](UpdateType.md#enter)
- [Exit](UpdateType.md#exit)
- [Noop](UpdateType.md#noop)
- [Update](UpdateType.md#update)

## Enumeration Members

### Enter

• **Enter** = `0`

#### Defined in

[constants.ts:35](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/constants.ts#L35)

---

### Exit

• **Exit** = `1`

#### Defined in

[constants.ts:36](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/constants.ts#L36)

---

### Noop

• **Noop** = `3`

#### Defined in

[constants.ts:38](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/constants.ts#L38)

---

### Update

• **Update** = `2`

#### Defined in

[constants.ts:37](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/constants.ts#L37)
