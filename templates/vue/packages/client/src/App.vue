<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { setup } from "./mud/setup";
import mudConfig from "contracts/mud.config";

const mudContext = reactive<any>({
  components: null,
  systemCalls: null,
  network: null,
});

const value = ref(0);

const incrementFun = async () => {
  const { increment } = mudContext.systemCalls;
  await increment();
};

onMounted(async () => {
  const {
    components,
    systemCalls,
    network,
  } = await setup();
  mudContext.components = components;
  mudContext.systemCalls = systemCalls;
  mudContext.network = network;
});

watch(() => mudContext.components, async (components) => {
  console.log("Components updated", mudContext);
  if (components) {
    const { Counter } = components;
    Counter.update$.subscribe((update: any) => {
      const [nextValue, prevValue] = update.value;
      console.log("Counter updated", update, { nextValue, prevValue });
      value.value = nextValue?.value ?? "unset";
    });
  }
}, { immediate: true });

watch(() => mudContext.network, async (network) => {
  console.log("Network updated", mudContext);
  if (network) {
    if (import.meta.env.DEV) {
      const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
      mountDevTools({
        config: mudConfig,
        publicClient: network.publicClient,
        walletClient: network.walletClient,
        latestBlock$: network.latestBlock$,
        storedBlockLogs$: network.storedBlockLogs$,
        worldAddress: network.worldContract.address,
        worldAbi: network.worldContract.abi,
        write$: network.write$,
        recsWorld: network.world,
      });
    }
  }
}, { immediate: true });


</script>

<template>
  <h2>MUD template with vue</h2>
  <div>Counter: <span>{{ value }}</span></div>
  <button @click="incrementFun">Increment</button>
</template>