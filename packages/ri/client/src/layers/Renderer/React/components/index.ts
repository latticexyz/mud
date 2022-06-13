import { registerAppearance } from "./Appearance";
import { registerComponentBrowser } from "./ComponentBrowser";
import { registerSelectedCoords } from "./SelectedCoords";
import { registerSelection } from "./Selection";

export function registerUIComponents() {
  registerSelection();
  registerAppearance();
  registerSelectedCoords();
  registerComponentBrowser();
}
