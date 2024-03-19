import { mergeIfUndefined, isObject } from "@latticexyz/store/config/v2";
import { DEPLOYMENT_DEFAULTS } from "./defaults";

export type resolveDeployment<deployment> = deployment extends {}
  ? mergeIfUndefined<deployment, typeof DEPLOYMENT_DEFAULTS>
  : typeof DEPLOYMENT_DEFAULTS;

export function resolveDeployment<deployment>(deployment: deployment): resolveDeployment<deployment> {
  return (
    isObject(deployment) ? mergeIfUndefined(deployment, DEPLOYMENT_DEFAULTS) : DEPLOYMENT_DEFAULTS
  ) as resolveDeployment<deployment>;
}
