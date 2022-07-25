export enum Type {
  Boolean,
  Number,
  OptionalNumber,
  String,
  OptionalString,
  NumberArray,
  OptionalNumberArray,
  StringArray,
  OptionalStringArray,
  Entity,
  OptionalEntity,
  EntityArray,
  OptionalEntityArray,
}

export enum UpdateType {
  Enter,
  Exit,
  Update,
  Noop,
}

export const OptionalTypes = [
  Type.OptionalEntity,
  Type.OptionalEntityArray,
  Type.OptionalNumber,
  Type.OptionalNumberArray,
  Type.OptionalString,
  Type.OptionalStringArray,
];
