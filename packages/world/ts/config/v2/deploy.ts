import { mergeIfUndefined, isObject } from "@latticexyz/store/config/v2";
import { DEPLOY_DEFAULTS } from "./defaults";

export type resolveDeploy<deploy> = deploy extends {}
  ? mergeIfUndefined<deploy, typeof DEPLOY_DEFAULTS>
  : typeof DEPLOY_DEFAULTS;

export function resolveDeploy<deploy>(deploy: deploy): resolveDeploy<deploy> {
  return (isObject(deploy) ? mergeIfUndefined(deploy, DEPLOY_DEFAULTS) : DEPLOY_DEFAULTS) as resolveDeploy<deploy>;
}
