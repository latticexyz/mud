import { registerComponentBrowser } from "./ComponentBrowser";
import { registerJoinGame } from "./JoinGame";
import { registerSelection } from "./Selection";
import { registerTurnTimer } from "./TurnTimer";

export function registerUIComponents() {
  registerSelection();
  registerTurnTimer();
  registerJoinGame();
  registerComponentBrowser();
}
