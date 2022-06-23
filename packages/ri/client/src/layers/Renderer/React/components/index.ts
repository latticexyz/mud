import { registerAppearance } from "./Appearance";
import { registerComponentBrowser } from "./ComponentBrowser";
import { registerSelectedCoords } from "./SelectedCoords";
import { registerSelection } from "./Selection";
import { registerTurnTimer } from "./TurnTimer";

export function registerUIComponents() {
  registerSelection();
  registerAppearance();
  registerSelectedCoords();
  registerTurnTimer();
  registerComponentBrowser();
}
