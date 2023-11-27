<script lang="ts">
  import { onMount } from "svelte";
  import { getSetup } from "../main";
  import { writable } from "svelte/store";

  const counter = writable(0);
  let systemCalls: any;

  onMount(async () => {
    const setup = getSetup();
    systemCalls = setup.systemCalls;

    if (setup.components) {
      setup.components.Counter.update$.subscribe((update: any) => {
        const [nextValue, prevValue] = update.value;
        console.log("Counter updated", update, {
          nextValue,
          prevValue,
        });
        counter.set(nextValue.value);
      });
    }
  });

  async function incrementCounter() {
    if (systemCalls && systemCalls.increment) {
      await systemCalls.increment();
    }
  }
</script>

<main>
  <button on:click={incrementCounter}>Increment Counter</button>
  <h1>Counter Value: {$counter}</h1>
</main>
