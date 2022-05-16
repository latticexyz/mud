import { registerAppearance } from "./Appearance";
import { registerSelectedCoords } from "./SelectedCoords";
import { registerSelection } from "./Selection";

export function registerUIComponents() {
  registerSelection();
  registerAppearance();
  registerSelectedCoords();
}
