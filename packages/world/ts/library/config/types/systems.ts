import { OrDefault } from "@latticexyz/common/type-utils";
import { SYSTEM_DEFAULTS } from "../defaults";

export type SystemConfig =
  | {
      /** The full resource selector consists of namespace and name */
      name?: string;
      /**
       * Register function selectors for the system in the World.
       * Defaults to true.
       * Note:
       * - For root systems all World function selectors will correspond to the system's function selectors.
       * - For non-root systems, the World function selectors will be <namespace>_<system>_<function>.
       */
      registerFunctionSelectors?: boolean;
    } & (
      | {
          /** If openAccess is true, any address can call the system */
          openAccess: true;
        }
      | {
          /** If openAccess is false, only the addresses or systems in `access` can call the system */
          openAccess: false;
          /** An array of addresses or system names that can access the system */
          accessList: string[];
        }
    );

export type ExpandedSystemConfig<C extends SystemConfig, DefaultName = string> = {
  name: OrDefault<C["name"], DefaultName>;
  registerFunctionSelectors: OrDefault<C["registerFunctionSelectors"], typeof SYSTEM_DEFAULTS.registerFunctionSelector>;
  openAccess: OrDefault<C["openAccess"], typeof SYSTEM_DEFAULTS.openAccess>;
  accessList: C extends { accessList: boolean }
    ? OrDefault<C["accessList"], typeof SYSTEM_DEFAULTS.accessList>
    : typeof SYSTEM_DEFAULTS.accessList;
};
