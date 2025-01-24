import { mergeIfUndefined, isObject } from "@latticexyz/store/internal";
import { DEPLOY_DEFAULTS } from "./defaults";

export type resolveDeploy<deploy> = deploy extends {} ? mergeIfUndefined<deploy, DEPLOY_DEFAULTS> : DEPLOY_DEFAULTS;

export function resolveDeploy<deploy>(deploy: deploy): resolveDeploy<deploy> {
  return (isObject(deploy) ? mergeIfUndefined(deploy, DEPLOY_DEFAULTS) : DEPLOY_DEFAULTS) as never;
}
