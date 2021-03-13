# `useHover` and `useHoverDirty`

Vue UI sensor hooks that track if some element is being hovered
by a mouse.

- `useHover` accepts a vue VNode or a function that returns one,
  `useHoverDirty` accepts Vue ref.
- `useHover` sets vue `onmouseenter` and `onmouseleave` events,
  `useHoverDirty` sets DOM `onmouseover` and `onmouseout` events.


## Usage

```vue
<template>
  <div>
    <Hoverable onMouseEnter="enter" onMouseLeave="leave"/>
    <div>{{ hovered ? "HOVERED" : "" }}</div>
  </div>
</template>

<script>
import {h, unref} from "vue";
import {useHover} from "vue-next-use";

export default {
  setup() {
    const element = (hovered) => h({
      render() {
        return h("div", "Hover me! " + (unref(hovered) ? "Thanks" : ""));
      },
    });

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
```


## Reference

```js
const [newReactElement, isHovering] = useHover(reactElement);
const [newReactElement, isHovering] = useHover((isHovering) => reactElement);
const isHovering = useHoverDirty(ref);
```