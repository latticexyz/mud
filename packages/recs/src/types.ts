import { IComputedValue } from "mobx";
import { ValueOf } from "@latticexyz/utils";
import { Subject } from "rxjs";
import { Type } from "./constants";
import { SuperSet, SuperSetMap } from "./Utils";

export type Unpacked<T> = T extends (infer U)[] ? U : never;

export type Entity = string;

export type Schema = {
  [key: string]: Type;
};

export { Type };

export type ValueType = {
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

export type ComponentValue<T extends Schema> = {
  [key in keyof T]: ValueType[T[key]];
};

export interface Component<T extends Schema> {
  id: string;
  values: { [key in keyof T]: Map<Entity, ValueType[T[key]]> };
  entities: Set<Entity>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream$: Subject<any>;
  schema: Schema;
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
  entities: SuperSetMap<Entity, AnyComponent>;
  components: SuperSet<AnyComponent>;
  registerComponent: <T extends AnyComponent>(component: T) => T;
  registerEntity: (id?: string) => Entity;
  getEntityComponents: (entity: Entity) => Set<AnyComponent>;
  registerDisposer: (disposer: () => void) => void;
  disposeAll: () => void;
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

export type QueryFragment<T extends Schema> =
  | HasQueryFragment<T>
  | HasValueQueryFragment<T>
  | NotQueryFragment<T>
  | NotValueQueryFragment<T>
  | ProxyReadQueryFragment
  | ProxyExpandQueryFragment;

export type EntityQueryFragment<T extends Schema> =
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

export type OverridableComponent<T extends Schema> = Component<T> & {
  addOverride: (id: string, update: Override<T>) => void;
  removeOverride: (id: string) => void;
};
