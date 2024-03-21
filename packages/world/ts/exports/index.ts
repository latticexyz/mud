/**
 * External exports.
 *
 * Be sure we're ready to commit to these being supported and changes made backward compatible!
 */

export { helloWorldEvent, worldDeployedEvent } from "../worldEvents";

export { defineWorldWithShorthands as defineWorld } from "../config/v2/worldWithShorthands";
export type { World } from "../config/v2/output";
