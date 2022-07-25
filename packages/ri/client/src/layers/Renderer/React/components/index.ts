import { registerComponentBrowser } from "./ComponentBrowser";
import { registerJoinGame } from "./JoinGame";
import { registerGameOutcome } from "./GameOutcome";
import { registerSelection } from "./Selection";
import { registerTurnTimer } from "./TurnTimer";
import { registerActionQueue } from "./ActionQueue";

export function registerUIComponents() {
  registerSelection();
  registerTurnTimer();
  registerJoinGame();
  registerGameOutcome();
  registerComponentBrowser();
  registerActionQueue();
}
