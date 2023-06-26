import { MergeReturnType } from "@latticexyz/common/type-utils";
import { ExpandConfig, expandConfig } from "@latticexyz/config";

import config from "../mud.config";

const _typedExpandConfig = expandConfig as ExpandConfig<typeof config>;
type ExpandedConfig = MergeReturnType<typeof _typedExpandConfig<typeof config>>;
export default expandConfig(config) as ExpandedConfig;
