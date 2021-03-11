<template>
  <pre>
      {{ state }}
  </pre>
</template>

<script>
import { useGeolocation } from "../src/index";

export default {
  setup() {
    const state = useGeolocation();

    return {
      state,
    };
  },
};
</script>

<style scoped>
</style>