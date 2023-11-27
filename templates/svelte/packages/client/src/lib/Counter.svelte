<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    useComponents,
    useSystemCalls,
    subscribeToComponentUpdate,
  } from "../MUDAccessor";
  import { writable } from "svelte/store";

  const counter = writable(0);
  const components = useComponents();
  const systemCalls = useSystemCalls();

  let unsubscribeCounter = () => {};

  onMount(() => {
    unsubscribeCounter = subscribeToComponentUpdate(
      components?.Counter,
      counter
    );
  });

  onDestroy(() => {
    unsubscribeCounter();
  });

  async function incrementCounter() {
    if (systemCalls?.increment) {
      await systemCalls.increment();
    }
  }
</script>

<main>
  <button on:click={incrementCounter}>Increment Counter</button>
  <h1>Counter Value: {$counter}</h1>
</main>
