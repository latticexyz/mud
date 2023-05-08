import { Subject } from "rxjs";
import { Type } from "./constants";
import { Opaque } from "type-fest";

/**
 * Entities are represented as symbols internally for memory efficiency.
 * To get the entity's string representation, use `getEntityString(entitySymbol)`
 */
export type EntitySymbol = Opaque<symbol, "EntitySymbol">;

export type Entity = Opaque<string, "Entity">;

/**
 * Used to define the schema of a {@link Component}.
 * Uses {@link Type} enum to be able to access the component type in JavaScript as well as have TypeScript type checks.
 */
export type Schema = {
  [key: string]: Type;
};

/**
 * Used to add arbitrary metadata to components.
 * (Eg `contractId` for components that have a corresponding solecs component contract.)
 */
export type Metadata =
  | {
      [key: string]: unknown;
    }
  | undefined;

/**
 * Mapping between JavaScript {@link Type} enum and corresponding TypeScript type.
 */
export type ValueType<T = undefined> = {
  [Type.Boolean]: boolean;
  [Type.Number]: number;
  [Type.BigInt]: bigint;
  [Type.String]: string;
  [Type.NumberArray]: number[];
  [Type.BigIntArray]: bigint[];
  [Type.StringArray]: string[];
  [Type.Entity]: Entity;
  [Type.EntityArray]: Entity[];
  [Type.OptionalNumber]: number | undefined;
  [Type.OptionalBigInt]: bigint | undefined;
  [Type.OptionalBigIntArray]: bigint[] | undefined;
  [Type.OptionalString]: string | undefined;
  [Type.OptionalNumberArray]: number[] | undefined;
  [Type.OptionalStringArray]: string[] | undefined;
  [Type.OptionalEntity]: Entity | undefined;
  [Type.OptionalEntityArray]: Entity[] | undefined;
  [Type.T]: T;
  [Type.OptionalT]: T | undefined;
};

/**
 * Used to infer the TypeScript type of a component value corresponding to a given {@link Schema}.
 */
export type ComponentValue<S extends Schema = Schema, T = undefined> = {
  [key in keyof S]: ValueType<T>[S[key]];
};

/**
 * Type of a component update corresponding to a given {@link Schema}.
 */
export type ComponentUpdate<S extends Schema = Schema, T = undefined> = {
  entity: Entity;
  value: [ComponentValue<S, T> | undefined, ComponentValue<S, T> | undefined];
  component: Component<S, Metadata, T>;
};

/**
 * Type of component returned by {@link defineComponent}.
 */
export interface Component<S extends Schema = Schema, M extends Metadata = Metadata, T = undefined> {
  id: string;
  values: { [key in keyof S]: Map<EntitySymbol, ValueType<T>[S[key]]> };
  schema: S;
  metadata: M;
  entities: () => IterableIterator<Entity>;
  world: World;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update$: Subject<ComponentUpdate<S, T>> & { observers: any };
}

/**
 * Type of indexer returned by {@link createIndexer}.
 */
export type Indexer<S extends Schema, M extends Metadata = Metadata, T = undefined> = Component<S, M, T> & {
  getEntitiesWithValue: (value: ComponentValue<S, T>) => Set<Entity>;
};

export type Components = {
  [key: string]: Component;
};

export interface ComponentWithStream<S extends Schema, T = undefined> extends Component<S, Metadata, T> {
  stream$: Subject<{ entity: Entity; value: ComponentValue<S, T> | undefined }>;
}

export type AnyComponentValue = ComponentValue<Schema>;

export type AnyComponent = Component<Schema>;

/**
 * Type of World returned by {@link createWorld}.
 */
export type World = {
  registerEntity: (options?: { id?: string; idSuffix?: string }) => Entity;
  registerComponent: (component: Component) => void;
  components: Component[];
  getEntities: () => IterableIterator<Entity>;
  dispose: () => void;
  registerDisposer: (disposer: () => void) => void;
  hasEntity: (entity: Entity) => boolean;
  deleteEntity: (entity: Entity) => void;
  entitySymbols: Set<EntitySymbol>;
};

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
  component: Component<{ value: Type.Entity }>;
  depth: number;
};

export type ProxyExpandQueryFragment = {
  type: QueryFragmentType.ProxyExpand;
  component: Component<{ value: Type.Entity }>;
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

export type Override<S extends Schema, T = undefined> = {
  entity: Entity;
  value: Partial<ComponentValue<S, T>> | null;
};

/**
 * Type of overridable component returned by {@link overridableComponent}.
 */
export type OverridableComponent<S extends Schema = Schema, M extends Metadata = Metadata, T = undefined> = Component<
  S,
  M,
  T
> & {
  addOverride: (overrideId: string, update: Override<S, T>) => void;
  removeOverride: (overrideId: string) => void;
};

export type OptionalType =
  | Type.OptionalNumber
  | Type.OptionalBigInt
  | Type.OptionalString
  | Type.OptionalEntity
  | Type.OptionalNumberArray
  | Type.OptionalBigIntArray
  | Type.OptionalStringArray
  | Type.OptionalEntityArray;

export function isOptionalType(t: Type): t is OptionalType {
  return [
    Type.OptionalNumber,
    Type.OptionalBigInt,
    Type.OptionalString,
    Type.OptionalEntity,
    Type.OptionalEntityArray,
    Type.OptionalNumberArray,
    Type.OptionalBigIntArray,
    Type.OptionalStringArray,
  ].includes(t);
}

export type ArrayType =
  | Type.NumberArray
  | Type.OptionalNumberArray
  | Type.BigIntArray
  | Type.OptionalBigIntArray
  | Type.StringArray
  | Type.OptionalStringArray
  | Type.EntityArray
  | Type.OptionalEntityArray;

export function isArrayType(t: Type): t is ArrayType {
  return [
    Type.NumberArray,
    Type.OptionalNumberArray,
    Type.BigIntArray,
    Type.OptionalBigIntArray,
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

export type Layer = {
  world: World;
  components: Record<string, Component<Schema>>;
};

export type Layers = Record<string, Layer>;
