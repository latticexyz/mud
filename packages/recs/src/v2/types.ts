import { IComputedValue } from "mobx";
import { ValueOf } from "@latticexyz/utils";
import { Subject } from "rxjs";
import { Type } from "./constants";

export type Entity = number;

export type Schema = {
  [key: string]: Type;
};

export type ValueType = {
  [Type.Boolean]: boolean;
  [Type.Number]: number;
  [Type.String]: string;
  [Type.NumberArray]: number[];
  [Type.StringArray]: string[];
  [Type.Entity]: Entity;
  [Type.EntityArray]: Entity[];
  [Type.OptionalNumber]: number | null;
  [Type.OptionalString]: string | null;
  [Type.OptionalNumberArray]: number[] | null;
  [Type.OptionalStringArray]: string[] | null;
  [Type.OptionalEntity]: Entity | null;
  [Type.OptionalEntityArray]: Entity[] | null;
};

export type ComponentValue<S extends Schema = Schema> = {
  [key in keyof S]: ValueType[S[key]];
};

export type ComponentUpdate<S extends Schema = Schema> = {
  entity: Entity;
  value: [ComponentValue<S> | undefined, ComponentValue<S> | undefined];
  component: Component;
};
export interface Component<S extends Schema = Schema> {
  id: string;
  values: { [key in keyof S]: Map<Entity, ValueType[S[key]]> };
  schema: Schema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update$: Subject<ComponentUpdate<S>> & { observers: any };
}

export type Components = {
  [key: string]: Component<Schema>;
};

export interface ComponentWithStream<T extends Schema> extends Component<T> {
  stream$: Subject<{ entity: Entity; value: ComponentValue<T> | undefined }>;
}

export type ComponentWithValue<T extends Schema> = { component: Component<T>; value: ComponentValue<T> };

export type AnyComponentValue = ComponentValue<Schema>;

export type AnyComponent = Component<Schema>;

export type World = {
  registerEntity: (options?: { id?: string; idSuffix?: string }) => Entity;
  registerComponent: (component: Component) => void;
  components: Component[];
  entities: string[];
  entityToIndex: Map<string, number>;
};

export type Query = IComputedValue<Set<Entity>>;

export enum QueryFragmentType {
  Has,
  HasValue,
  Not,
  NotValue,
  ProxyRead,
  ProxyExpand,
}

export type HasQueryFragment<T extends Schema> = {
  type: QueryFragmentType.Has;
  component: Component<T>;
};

export type HasValueQueryFragment<T extends Schema> = {
  type: QueryFragmentType.HasValue;
  component: Component<T>;
  value: Partial<ComponentValue<T>>;
};

export type NotQueryFragment<T extends Schema> = {
  type: QueryFragmentType.Not;
  component: Component<T>;
};

export type NotValueQueryFragment<T extends Schema> = {
  type: QueryFragmentType.NotValue;
  component: Component<T>;
  value: Partial<ComponentValue<T>>;
};

export type ProxyReadQueryFragment = {
  type: QueryFragmentType.ProxyRead;
  component: Component<{ entity: Type.Entity }>;
  depth: number;
};

export type ProxyExpandQueryFragment = {
  type: QueryFragmentType.ProxyExpand;
  component: Component<{ entity: Type.Entity }>;
  depth: number;
};

export type QueryFragment<T extends Schema = Schema> =
  | HasQueryFragment<T>
  | HasValueQueryFragment<T>
  | NotQueryFragment<T>
  | NotValueQueryFragment<T>
  | ProxyReadQueryFragment
  | ProxyExpandQueryFragment;

export type EntityQueryFragment<T extends Schema = Schema> =
  | HasQueryFragment<T>
  | HasValueQueryFragment<T>
  | NotQueryFragment<T>
  | NotValueQueryFragment<T>;

export type SettingQueryFragment = ProxyReadQueryFragment | ProxyExpandQueryFragment;

export type QueryFragments = QueryFragment<Schema>[];

export type SchemaOf<C extends Component<Schema>> = C extends Component<infer S> ? S : never;

export type ExtendableECSEvent<C extends Components, E> = ValueOf<{
  [key in keyof C]: {
    component: key;
    entity: Entity | number;
    value: ComponentValue<SchemaOf<C[key]>>;
  } & E;
}>;

export type ECSEvent<C extends Components> = ExtendableECSEvent<C, unknown>;

export type Override<T extends Schema> = {
  entity: Entity;
  value: ComponentValue<T>;
};

export type OverridableComponent<T extends Schema = Schema> = Component<T> & {
  addOverride: (id: string, update: Override<T>) => void;
  removeOverride: (id: string) => void;
};

export type OptionalType =
  | Type.OptionalNumber
  | Type.OptionalString
  | Type.OptionalEntity
  | Type.OptionalNumberArray
  | Type.OptionalStringArray
  | Type.OptionalEntityArray;

export function isOptionalType(t: Type): t is OptionalType {
  return [
    Type.OptionalNumber,
    Type.OptionalString,
    Type.OptionalEntity,
    Type.OptionalEntityArray,
    Type.OptionalNumberArray,
    Type.OptionalStringArray,
  ].includes(t);
}

export type ArrayType =
  | Type.NumberArray
  | Type.OptionalNumberArray
  | Type.StringArray
  | Type.OptionalStringArray
  | Type.EntityArray
  | Type.OptionalEntityArray;

export function isArrayType(t: Type): t is ArrayType {
  return [
    Type.NumberArray,
    Type.OptionalNumberArray,
    Type.StringArray,
    Type.OptionalStringArray,
    Type.EntityArray,
    Type.OptionalEntityArray,
  ].includes(t);
}

export type NumberType = Type.Number | Type.OptionalNumber;
export function isNumberType(t: Type): t is NumberType {
  return [Type.Number, Type.OptionalNumber].includes(t);
}

export type EntityType = Type.Entity | Type.OptionalEntity;
export function isEntityType(t: Type): t is EntityType {
  return [Type.Entity, Type.OptionalEntity].includes(t);
}
