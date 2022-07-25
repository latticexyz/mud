import { registerComponentBrowser } from "./ComponentBrowser";
import { registerJoinGame } from "./JoinGame";
import { registerGameOutcome } from "./GameOutcome";
import { registerSelection } from "./Selection";
import { registerTurnTimer } from "./TurnTimer";
import { registerActionQueue } from "./ActionQueue";
import { registerFactoryView } from "./Factory";

export function registerUIComponents() {
  registerTurnTimer();
  registerJoinGame();
  registerGameOutcome();
  registerComponentBrowser();
  registerActionQueue();
  registerFactoryView();
  registerSelection();
}
