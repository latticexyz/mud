# Animations from system calls

As you develop your game you may hit the point when you want to add animations in response to specific events. This is difficult when the only information we receive from system execution is component updates. We know **what** happened, but not **why**.

The solution to this is system call streams. System call streams chunk together all of the component updates that occur during a specific system call and allow you to react to them.

In this guide we will go into why system call streams are needed, a small example where they are helpful, and some sample code to start you off.

## Example: Animating a combat system

Let's say we are making a simple game where I control a character that attacks monsters with their sword. We have a `CombatSystem` that receives two arguments: `(uint256 playerEntity, uint256 targetEntity)`. We have a `HealthComponent` which stores a `uint32` representation of the entity's current health. We also have a `StrengthComponent` which stores a `uint32` representation of the entity's power in combat.

The logic of the `CombatSystem` states that when we engage in combat each entity deals it's strength in damage to each other. We wire up our `CombatSystem` to our client and render a health bar based on the value of the `HealthComponent`. Our entities engage in combat and we watch their respective health bars go down. Great, everything is working!

Now we want to add some animations to our game. We want to see our character swing their sword when they attack and we want to see the monster take damage when they are attacked. We can start by playing an animation when an entity's health changes. But what if we want the player to swing their sword in the direction of the monster they attacked? The situation is simple if there are only two entities involved in combat (we can infer that we attacked the monster that was standing next to us), but what if there are more? What if there are multiple monsters attacking the player? What if the player is attacking multiple monsters? How do we know which entity is attacking which entity?

**In this context `HealthComponent` updates alone do not provide the information we need.**

## System call streams

System call streams chunk together all of the component updates that occur during a specific system call so that you can react to them in a context-specific way. In our example we can use a system call stream to react to the changes that occur during the `CombatSystem` call.

The first step to enable this feature is to enable system call streams when setting up the MUD network by passing `fetchSystemCalls: true` inside of the configuration object.

```typescript
const networkSetup = await setupMUDNetwork(networkConfig, world, components, SystemAbis, {
  fetchSystemCalls: true,
});
```

We now have access to the system call stream on our `networkSetup` object.

```typescript
const { systemCallStream } = networkSetup;
```

The keys of this object are the IDs of the systems you have registered on your `World` contract. In our case we have a `CombatSystem` so we can access the stream by calling `systemCallStream["system.Combat"]`. The value of this stream is an RxJS Observable that emits [DecodedSystemCall](/packages/std-client/api/#decodedsystemcall) objects.

Now we can create a client system that react to these combat system calls and animates the appropriate entities.

```typescript
// imports and setup omitted for brevity

defineRxSystem(world, systemCallStream["system.Combat"], (systemCall) => {
  const { args } = systemCall;

  // args is an array of the arguments passed to the system call
  // the names will be the same as the names of the arguments in the system definition
  const { playerEntity, targetEntity } = args;

  // a function that plays an attack animation in the direction of the target
  playAttackAnimation(playerEntity, targetEntity);
  playAttackAnimation(targetEntity, playerEntity);
});
```

Great! Our player correctly swings their sword in the direction of the monster they attacked. But there is a problem. The health bars of the combatants do not update in sync with the animations we've played. This is because we are rendering `HealthComponent` updates directly. While not incorrect, this is jarring for the player. We want the health bars to update the moment that the sword makes contact.

One solution is to **unhook `HealthComponent` updates from rendering entirely by creating a separate `HealthDisplayComponent`.** First we define a client only component:

```typescript
const HealthDisplay = defineComponent(
  world,
  {
    value: Type.Number,
  },
  { id: "HealthDisplay" }
);
```

Then we modify our health bar display system to only render `HealthDisplayComponent` updates. Once that is in place we need to apply `HealthDisplayComponent` updates when we react to the `CombatSystem` call.

```typescript
// imports and setup omitted for brevity

defineRxSystem(world, systemCallStream["system.Combat"], (systemCall) => {
  const { args, updates } = systemCall;

  // args is an array of the arguments passed to the system call
  // the names will be the same as the names of the arguments in the system definition
  const { playerEntity, targetEntity } = args;

  // updates is an array of all of the component updates that occurred during the system call
  // we can use this to find the health updates for the entities involved in combat
  const playerHealthUpdate = updates.find(
    (update) => update.entityId === playerEntity && update.componentId === "component.Health"
  );
  const targetHealthUpdate = updates.find(
    (update) => update.entityId === targetEntity && update.componentId === "component.Health"
  );

  // a function that plays an attack animation in the direction of the target
  playAttackAnimation(playerEntity, targetEntity);
  setComponent(DisplayHealth, playerEntity, { value: playerHealthUpdate.value });

  playAttackAnimation(targetEntity, playerEntity);
  setComponent(DisplayHealth, targetEntity, { value: targetHealthUpdate.value });
});
```

Now our health bars update in sync with the animations we've played! However, one side effect is that **`HealthComponent` updates now need to be applied inside of reactions to system call streams everywhere in our client. If we don't things will appear visually out of sync.** This is a tradeoff we have to make when we want to animate in response to system calls. It is more work, but is worth it if we want to create a more engaging experience for our players.

## Conclusion

System call streams are a powerful tool that allow you to react to system calls in a context-specific way. They are especially useful when you want to animate in response to system calls. In this guide we went over a small example of how they can be used to animate a combat system. We also went over some of the tradeoffs you need to consider when using system call streams.

That being said, there is a lot of work involved in using them effectively. We encourage new MUD developers to prototype their games without them and only start adding them when they start polishing their game.
