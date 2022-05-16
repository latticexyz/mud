/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createEntity, withValue } from "@mud/recs";
import { LocalEntityTypes } from "../../../src/layers/Local/types";
import { EmberWindow } from "../../../src/types";
import { random } from "@mud/utils";

const NUM_IMPS = 500;

function spawnImp(layers: EmberWindow["layers"]) {
  const { world } = layers.local!;
  const { LocalEntityType, Strolling, LocalPosition, MoveSpeed } = layers.local!.components;

  const coord = { x: random(20), y: random(20) };

  createEntity(world, [
    withValue(LocalEntityType, { entityType: LocalEntityTypes.Imp }),
    withValue(Strolling, {}),
    withValue(LocalPosition, coord),
    withValue(MoveSpeed, { default: 500, current: 500 }),
  ]);
}

describe("Ember", () => {
  it("has less than 1% dropped frames when spawning 500 imps", () => {
    cy.visit("http://localhost:3000")
      .its("layers")
      .then((layers: EmberWindow["layers"]) => {
        for (let i = 0; i < NUM_IMPS; i++) {
          spawnImp(layers);
        }
        return layers;
      })
      .wait(1500)
      .then((layers) => {
        const game = layers.phaser!.game;
        const rawDeltaHistory: number[] = [];
        const deltaHistory: number[] = [];
        const timeHistory: number[] = [];

        const t = { tick: 0 };
        const fps = { fps: 0 };
        const onStep = (time: number) => {
          t.tick++;
          rawDeltaHistory.push(game.loop.rawDelta);
          deltaHistory.push(game.loop.delta);
          timeHistory.push(time);
          if (t.tick === 999) fps.fps = game.loop.actualFps;
          if (t.tick > 1000) {
            game.events.removeAllListeners("poststep");
          }
        };
        game.events.on("poststep", onStep);
        return { rawDeltaHistory, deltaHistory, timeHistory, t, fps };
      })
      .waitUntil((result) => result && result.t.tick > 1000 && result, { timeout: 60000 })
      .then((result) => {
        const { timeHistory, deltaHistory, rawDeltaHistory, fps } = result;

        const timeDeltaHistory: number[] = [];
        for (let i = 1; i < timeHistory.length; i++) {
          timeDeltaHistory.push(timeHistory[i] - timeHistory[i - 1]);
        }

        const droppedFramesRawDelta = rawDeltaHistory.reduce((acc, curr) => (curr > 20 ? acc + 1 : acc), 0);
        const droppedFramesDelta = deltaHistory.reduce((acc, curr) => (curr > 20 ? acc + 1 : acc), 0);
        const droppedFramesTimeDelta = timeDeltaHistory.reduce((acc, curr) => (curr > 20 ? acc + 1 : acc), 0);

        const report = `
<h3>Performance report<h3>
<h4>Scene with 500 imps</h4>
<ul>
<li>Frames with smoothed delta > 20ms: ${droppedFramesDelta}/1000</li>
<li>Frames with raw delta > 20ms: ${droppedFramesRawDelta}/1000</li>
<li>Frames with manual delta > 20ms: ${droppedFramesTimeDelta}/1000</li>
<li>Final FPS: ${fps.fps}</li>
</ul>
<details>
<summary>Details</summary>
<code style="white-space:nowrap;">
</code>
</details> 
`;

        cy.task("log", report);
        cy.writeFile("cypress/reports/performance/performance_report.md", report);

        expect(droppedFramesDelta).to.below(1000);
        expect(droppedFramesRawDelta).to.below(3000);
        expect(droppedFramesTimeDelta).to.below(3000);
      });
  });
});
