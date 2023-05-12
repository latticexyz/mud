/**
 * Type enum is used to specify value types in {@link ComponentSchema} to be able
 * to access type values in JavaScript in addition to TypeScript type checks.
 */
export enum Type {
  Boolean,
  Number,
  OptionalNumber,
  BigInt,
  OptionalBigInt,
  String,
  OptionalString,
  NumberArray,
  OptionalNumberArray,
  BigIntArray,
  OptionalBigIntArray,
  StringArray,
  OptionalStringArray,
  Entity,
  OptionalEntity,
  EntityArray,
  OptionalEntityArray,
  T,
  OptionalT,
}

/**
 * Used to specify type of {@link ComponentUpdate}.
 * - Enter: Update added a value to an entity that did not have a value before
 * - Exit: Update removed a value from an entity that had a value before
 * - Update: Update changed a value of an entity that already had a value before. Note: the value doesn't need to be different from the previous value.
 * - Noop: Update did nothing (removed a value from an entity that did not have a value)
 */
export enum UpdateType {
  Enter,
  Exit,
  Update,
  Noop,
}

/**
 * Helper constant with all optional {@link Type}s.
 */
export const OptionalTypes = [
  Type.OptionalEntity,
  Type.OptionalEntityArray,
  Type.OptionalNumber,
  Type.OptionalNumberArray,
  Type.OptionalBigInt,
  Type.OptionalBigIntArray,
  Type.OptionalString,
  Type.OptionalStringArray,
  Type.OptionalT,
];
