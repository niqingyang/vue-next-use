<template>
  <div>
    <Hoverable @mouseenter="enter" @mouseleave="leave" />
    <div>{{ hovered ? "HOVERED" : "" }}</div>
  </div>
</template>

<script>
import { h, unref } from "vue";
import { useHover } from "../src/index";

export default {
  setup() {
    const element = (hovered) => {
      return h({
        render() {
          return h("div", "Hover me! " + (unref(hovered) ? "Thanks" : ""));
        },
      });
    };

    const [Hoverable, hovered] = useHover(element);

    return {
      Hoverable,
      hovered,
      enter: () => {
        console.log("mouseenter");
      },
      leave: () => {
        console.log("mouseleave");
      },
    };
  },
};
</script>

<style scoped>
</style>