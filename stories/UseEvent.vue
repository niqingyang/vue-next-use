<template>
  <div>
    <p>
      Press some keys on your keyboard, <code style="color: tomato">r</code> key
      resets the list
    </p>
    <pre>
      {{ JSON.stringify(list, null, 4) }}
    </pre>
  </div>
</template>

<script>
import { useList, useEvent } from "../src/index";

export default {
  setup() {
    const [list, { push, clear }] = useList();

    const onKeyDown = ({ key }) => {
      if (key === "r") {
        clear();
      }
      push(key);
    };

    useEvent("keydown", onKeyDown);

    return {
      list,
    };
  },
};
</script>

<style scoped>
</style>