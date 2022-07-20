import { registerComponentBrowser } from "./ComponentBrowser";
import { registerActionQueue } from "./ActionQueue";
import { registerInventory } from "./Inventory";

export function registerUIComponents() {
  registerComponentBrowser();
  registerActionQueue();
  registerInventory();
}
