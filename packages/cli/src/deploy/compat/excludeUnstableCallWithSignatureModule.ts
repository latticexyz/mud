import { Module } from "@latticexyz/world/internal";

/** @internal For use with `config.modules.filter(...)` */
export function excludeCallWithSignatureModule(mod: Module): boolean {
  if (
    mod.artifactPath ===
    "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json"
  ) {
    console.warn(
      [
        "",
        `⚠️ Your \`mud.config.ts\` is using \`Unstable_CallWithSignatureModule\`. This module can be removed from your config as it is now installed by default during deploy.`,
        "",
      ].join("\n"),
    );
    return false;
  }
  return true;
}
