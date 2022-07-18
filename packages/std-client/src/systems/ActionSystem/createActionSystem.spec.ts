/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  createEntity,
  withValue,
  setComponent,
  World,
  createWorld,
  Component,
  Type,
  defineComponent,
  getComponentValueStrict,
  HasValue,
  runQuery,
  EntityID,
  EntityIndex,
} from "@latticexyz/recs";
import { deferred } from "@latticexyz/utils";
import { ReplaySubject } from "rxjs";
import { ActionState, createActionSystem } from ".";
import { waitForComponentValueIn } from "../../utils";
import { waitForActionCompletion } from "./utils";
import { ContractTransaction } from "ethers";

describe("ActionSystem", () => {
  let world: World;
  let Resource: Component<{ amount: Type.Number }>;
  let Action: Component<{ state: Type.Number; on: Type.OptionalEntity }>;
  let actions: ReturnType<typeof createActionSystem>;
  let txReduced$: ReplaySubject<string>;

  const getEntityId = (idx: EntityIndex) => world.entities[idx];

  beforeEach(async () => {
    world = createWorld();
    txReduced$ = new ReplaySubject<string>();
    actions = createActionSystem(world, txReduced$);
    Action = actions.Action;
    Resource = defineComponent(world, { amount: Type.Number });
  });

  afterEach(() => {
    world.dispose();
  });

  it("should immediately execute actions if their requirement is met and set the Action component", async () => {
    const mockFn = jest.fn();
    const entity = actions.add({
      id: "action" as EntityID,
      components: {},
      requirement: () => true,
      updates: () => [] as [],
      execute: () => {
        mockFn();
      },
    }) as EntityIndex;

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(getComponentValueStrict(Action, entity).state).toBe(ActionState.Executing);
    await waitForActionCompletion(Action, entity);
    expect(getComponentValueStrict(Action, entity).state).toBe(ActionState.Complete);
  });

  it("should not execute actions if their requirement is not met and set the Action component", () => {
    const mockFn = jest.fn();
    const entity = actions.add({
      id: "action" as EntityID,
      components: {},
      requirement: () => false,
      updates: () => [] as [],
      execute: () => {
        mockFn();
      },
    }) as EntityIndex;

    expect(mockFn).toHaveBeenCalledTimes(0);
    expect(getComponentValueStrict(Action, entity).state).toBe(ActionState.Requested);
  });

  it("should set the Action component of failed actions", async () => {
    const [, reject, promise] = deferred<void>();
    const entity = actions.add({
      id: "action" as EntityID,
      components: {},
      requirement: () => true,
      updates: () => [] as [],
      execute: () => promise,
    }) as EntityIndex;

    reject(new Error("Error"));

    await waitForActionCompletion(Action, entity);

    expect(getComponentValueStrict(Action, entity).state).toBe(ActionState.Failed);
  });

  it("should set the Action component of cancelled actions", async () => {
    const entity = actions.add({
      id: "action" as EntityID,
      components: {},
      requirement: () => false,
      updates: () => [] as [],
      execute: () => void 0,
    }) as EntityIndex;

    const cancelled = actions.cancel("action" as EntityID);
    await waitForActionCompletion(Action, entity);

    expect(getComponentValueStrict(Action, entity).state).toBe(ActionState.Cancelled);
    expect(cancelled).toBe(true);
  });

  it("should not be possible to cancel actions that are already executing", async () => {
    const [resolve, , promise] = deferred<void>();
    const entity = actions.add({
      id: "action" as EntityID,
      components: {},
      requirement: () => true,
      updates: () => [] as [],
      execute: () => promise,
    }) as EntityIndex;

    const cancelled = actions.cancel("action" as EntityID);
    resolve();
    await waitForActionCompletion(Action, entity);
    expect(getComponentValueStrict(Action, entity).state).toBe(ActionState.Complete);
    expect(cancelled).toBe(false);
  });

  it("should execute actions if components it depends on changed and the requirement is met now", () => {
    const mockFn = jest.fn();
    const player = createEntity(world, [withValue(Resource, { amount: 0 })]);

    actions.add({
      id: "action" as EntityID,
      components: { Resource },
      requirement: ({ Resource }) => getComponentValueStrict(Resource, player).amount > 100,
      updates: () => [],
      execute: () => {
        mockFn();
      },
    });

    expect(mockFn).toHaveBeenCalledTimes(0);
    setComponent(Resource, player, { amount: 99 });
    expect(mockFn).toHaveBeenCalledTimes(0);
    setComponent(Resource, player, { amount: 101 });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should return all actions related to a given entity", () => {
    const settlement1 = createEntity(world);
    const settlement2 = createEntity(world);

    const entity1 = actions.add({
      id: "action1" as EntityID,
      on: settlement1,
      components: { Resource },
      requirement: () => false,
      updates: () => [],
      execute: () => void 0,
    });

    const entity2 = actions.add({
      id: "action2" as EntityID,
      on: settlement2,
      components: { Resource },
      requirement: () => false,
      updates: () => [],
      execute: () => void 0,
    });

    const entity3 = actions.add({
      id: "action3" as EntityID,
      components: { Resource },
      requirement: () => false,
      updates: () => [],
      execute: () => void 0,
    });

    expect(runQuery([HasValue(Action, { on: getEntityId(settlement1) })])).toEqual(new Set([entity1]));
    expect(runQuery([HasValue(Action, { on: getEntityId(settlement2) })])).toEqual(new Set([entity2]));
    expect(runQuery([HasValue(Action, { state: ActionState.Requested })])).toEqual(
      new Set([entity1, entity2, entity3])
    );
  });

  it("should not remove pending update until all corresponding tx have been reduced", async () => {
    const player = createEntity(world, [withValue(Resource, { amount: 100 })]);

    const entity1 = actions.add({
      id: "action1" as EntityID,
      components: { Resource },
      requirement: () => true,
      updates: ({ Resource }) => [
        {
          component: "Resource",
          entity: player,
          value: { amount: getComponentValueStrict(Resource, player).amount - 1 },
        },
      ],
      execute: async () => Promise.resolve({ hash: "tx1", wait: () => void 0 } as ContractTransaction),
    }) as EntityIndex;

    const entity2 = actions.add({
      id: "action2" as EntityID,
      components: { Resource },
      // Resource needs to be 100 in order for this action to be executed
      requirement: ({ Resource }) => getComponentValueStrict(Resource, player).amount === 100,
      updates: () => [],
      execute: () => void 0,
    }) as EntityIndex;

    await waitForComponentValueIn(Action, entity1, [{ state: ActionState.WaitingForTxEvents }]);
    // While action1 is waiting for tx, action 2 is not executed yet
    expect(getComponentValueStrict(Action, entity1).state).toBe(ActionState.WaitingForTxEvents);
    expect(getComponentValueStrict(Action, entity2).state).toBe(ActionState.Requested);

    txReduced$.next("tx1");
    // Now it's done
    await waitForComponentValueIn(Action, entity1, [{ state: ActionState.Complete }]);
    expect(getComponentValueStrict(Action, entity1).state).toBe(ActionState.Complete);
    expect(getComponentValueStrict(Action, entity2).state).toBe(ActionState.Complete);
  });

  it("should execute actions if the requirement is met while taking into account pending updates", async () => {
    const requirementSpy1 = jest.fn();
    const requirementSpy2 = jest.fn();
    const requirementSpy3 = jest.fn();

    const executeSpy1 = jest.fn();
    const executeSpy2 = jest.fn();
    const executeSpy3 = jest.fn();

    const player = createEntity(world, [withValue(Resource, { amount: 0 })]);

    let nonce = 0;

    // First schedule action1
    const [resolveAction1, , action1Promise] = deferred<void>();
    const entity1 = actions.add({
      id: "action1" as EntityID,
      components: { Resource },
      // This action requires a resource amount of 100 to be executed
      requirement: ({ Resource }) => {
        requirementSpy1();
        return getComponentValueStrict(Resource, player).amount >= 100;
      },
      // When this action is executed it will subtract 100 from the resource amount
      updates: ({ Resource }) => [
        {
          component: "Resource",
          entity: player,
          value: { amount: getComponentValueStrict(Resource, player).amount - 100 },
        },
      ],
      execute: async () => {
        executeSpy1(nonce++);
        await action1Promise;
        const { amount } = getComponentValueStrict(Resource, player);
        setComponent(Resource, player, { amount: amount - 100 });
      },
    }) as EntityIndex;

    // Action1 is not executed yet because requirement is not met
    expect(executeSpy1).toHaveBeenCalledTimes(0);

    // The requirement was checked once when adding the action
    expect(requirementSpy1).toHaveBeenCalledTimes(1);

    // Then shedule action3
    actions.add({
      id: "action3" as EntityID,
      components: { Resource },
      // This action also requires a resource amount of 100 to be executed
      requirement: ({ Resource }) => {
        requirementSpy3();
        const amount = getComponentValueStrict(Resource, player).amount;
        return amount >= 100;
      },
      updates: ({ Resource }) => [
        {
          component: "Resource",
          entity: player,
          value: { amount: getComponentValueStrict(Resource, player).amount - 100 },
        },
      ],
      execute: () => {
        executeSpy3(nonce++);
      },
    });

    // Action3 is also not executed yet because the requirement is not met
    expect(executeSpy3).toHaveBeenCalledTimes(0);

    // The requirement was cheecked once when adding the action
    expect(requirementSpy3).toHaveBeenCalledTimes(1);

    // Action 1's requirement was not checked again, because neither pending updates nor components changed.
    expect(requirementSpy1).toHaveBeenCalledTimes(1);

    // Now schedule action2.
    // This action declares it will update the Resource component to be 100
    const [resolveAction2, , action2Promise] = deferred<void>();
    const entity2 = actions.add({
      id: "action2" as EntityID,
      components: { Resource },
      requirement: () => {
        requirementSpy2();
        return true;
      },
      updates: () => [{ component: "Resource", entity: player, value: { amount: 100 } }],
      execute: async () => {
        executeSpy2(nonce++);
        await action2Promise;
        const { amount } = getComponentValueStrict(Resource, player);
        setComponent(Resource, player, { amount: amount + 100 });
      },
    }) as EntityIndex;

    // action2 is executed immediately
    expect(executeSpy2).toHaveBeenCalledTimes(1);
    expect(executeSpy2).toHaveBeenCalledWith(0);

    // But it is not done yet, because the promise is not resolved
    await waitForComponentValueIn(Action, entity2, [{ state: ActionState.Executing }]);
    expect(getComponentValueStrict(Action, entity2).state).toBe(ActionState.Executing);

    // action 2's requirement was checked only once
    expect(requirementSpy2).toHaveBeenCalledTimes(1);

    // Executing action 2 added pending updates and thereby triggered rechecking the requirements of action 1 and action 3
    expect(requirementSpy1).toHaveBeenCalledTimes(2);
    expect(requirementSpy3).toHaveBeenCalledTimes(2);

    // Action 1 is already executed before action 2 resolves because it trusts action 2's update declaration
    expect(executeSpy1).toHaveBeenCalledTimes(1);

    // Action 1 should be executed after action 2
    expect(executeSpy1).toHaveBeenCalledWith(1);

    // action 3 should not have been executed, because action 1 declared it will reduce the resource amount, such that action3's requirement is not met
    expect(executeSpy3).toHaveBeenCalledTimes(0);

    // Now resolve action2
    resolveAction2();
    await waitForActionCompletion(Action, entity2!);

    // The real component amount should be at 100 now
    expect(getComponentValueStrict(Resource, player).amount).toBe(100);

    // Removing action 2's pending updates and modifying the component state should have triggered two requirement checks on action 3
    expect(requirementSpy3).toHaveBeenCalledTimes(4);

    // action3 should still not have been executed because action2 is not resolved yet and declared an update
    expect(executeSpy3).toHaveBeenCalledTimes(0);

    // Now resolve action1
    resolveAction1();
    await waitForActionCompletion(Action, entity1);

    // The real component amount should be at 0 now
    expect(getComponentValueStrict(Resource, player).amount).toBe(0);

    // Removing action 1's pending updates and modifying the component state should have triggered two requirement checks on action 3
    expect(requirementSpy3).toHaveBeenCalledTimes(6);

    // action3 should still not have been executed
    expect(executeSpy3).toHaveBeenCalledTimes(0);

    // Setting the resource amount to 100 should trigger a requirement check on action 3
    setComponent(Resource, player, { amount: 100 });
    expect(requirementSpy3).toHaveBeenCalledTimes(7);

    // Now action3 should finally have been executed
    expect(executeSpy3).toHaveBeenCalledTimes(1);
    expect(executeSpy3).toHaveBeenCalledWith(2);

    // In total action 1's requirements should have been checked 2 times
    expect(requirementSpy1).toHaveBeenCalledTimes(2);

    // In total action 2's requirements should have been checked 1 time
    expect(requirementSpy2).toHaveBeenCalledTimes(1);

    // In total action 3's requirements should have been checked 7 times
    expect(requirementSpy3).toHaveBeenCalledTimes(7);
  });

  it("declaring component updates should not modify real components", async () => {
    const player = createEntity(world, [withValue(Resource, { amount: 0 })]);

    expect(getComponentValueStrict(Resource, player)).toEqual({ amount: 0 });

    const [resolve, , promise] = deferred<void>();
    const entity = actions.add({
      id: "action" as EntityID,
      components: { Resource },
      requirement: () => true,
      updates: () => [{ component: "Resource", entity: player, value: { amount: 1000 } }],
      execute: async () => {
        await promise;
      },
    }) as EntityIndex;

    expect(getComponentValueStrict(Resource, player)).toEqual({ amount: 0 });

    resolve();
    await waitForActionCompletion(Action, entity);

    expect(getComponentValueStrict(Resource, player)).toEqual({ amount: 0 });
  });

  it("should rerun the requirement function only if a component value accessed in the requirement changed", () => {
    const player = createEntity(world, [withValue(Resource, { amount: 0 })]);
    const requirementSpy = jest.fn();

    actions.add({
      id: "action" as EntityID,
      components: { Resource },
      requirement: ({ Resource }) => {
        requirementSpy();
        return getComponentValueStrict(Resource, player).amount >= 100;
      },
      updates: () => [],
      execute: async () => void 0,
    });

    // The requirement should be checked once when adding the action
    expect(requirementSpy).toHaveBeenCalledTimes(1);

    // Setting unrelated values in the component should not retrigger a requirement check
    const player2 = createEntity(world, [withValue(Resource, { amount: 0 })]);
    setComponent(Resource, player2, { amount: 10 });
    expect(requirementSpy).toHaveBeenCalledTimes(1);

    // Setting a relevant value in the component should trigger a requirement check
    setComponent(Resource, player, { amount: 10 });
    expect(requirementSpy).toHaveBeenCalledTimes(2);
  });

  it("should rerun the requirement function only if a pending update relevant to a value accessed in the requirement changed", () => {
    const player1 = createEntity(world, [withValue(Resource, { amount: 0 })]);
    const player2 = createEntity(world);

    const requirementSpy = jest.fn();

    actions.add({
      id: "action1" as EntityID,
      components: { Resource },
      requirement: ({ Resource }) => {
        requirementSpy();
        return getComponentValueStrict(Resource, player1).amount >= 100;
      },
      updates: () => [],
      execute: () => void 0,
    });

    // The requirement should be checked once when adding the action
    expect(requirementSpy).toHaveBeenCalledTimes(1);

    // Another action is executed, which does not declare any updates
    actions.add({
      id: "action2" as EntityID,
      components: { Resource },
      requirement: () => true,
      updates: () => [],
      execute: () => void 0,
    });

    // Executing actions with no pending updates that don't modify component states should not trigger a requirement check
    expect(requirementSpy).toHaveBeenCalledTimes(1);

    // Another action declares an update to the resource amount of player2, which is unrelated to action1's requirement
    actions.add({
      id: "action3" as EntityID,
      components: { Resource },
      requirement: () => true,
      updates: () => [{ component: "Resource", entity: player2, value: { amount: 1000 } }],
      execute: () => void 0,
    });

    // Unrelated pending updates should not retrigger a requirement check
    expect(requirementSpy).toHaveBeenCalledTimes(1);

    const [resolve, , promise] = deferred<void>();
    // Another action declares an update to the resource amount of player1, which is relevant to action1's requirement
    actions.add({
      id: "action4" as EntityID,
      components: { Resource },
      requirement: () => true,
      updates: () => [{ component: "Resource", entity: player1, value: { amount: 10000 } }],
      execute: async () => {
        await promise;
      },
    });

    // Relevant pending updates should trigger a requirement check
    expect(requirementSpy).toHaveBeenCalledTimes(2);
    resolve();
  });
});
