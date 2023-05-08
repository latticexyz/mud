import { DynamicResolution, ValueWithType } from "@latticexyz/config";

export type ModuleConfig = {
  /** The name of the module */
  name: string;
  /** Should this module be installed as a root module? */
  root?: boolean;
  /** Arguments to be passed to the module's install method */
  args?: (ValueWithType | DynamicResolution)[];
};
