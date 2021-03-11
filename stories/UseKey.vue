<template>
  <div>
    Idle delay ms：<input type="number" v-model="delay"/>
    <div>User is idle: {{isIdle ? 'Yes 😴' : 'Nope'}}</div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useIdle } from "../src/index";

export default {
  setup() {
    const delay = ref(1000);
    const isIdle = useIdle(delay);

    return {
      delay,
      isIdle,
    };
  },
};
</script>

<style scoped>
</style>