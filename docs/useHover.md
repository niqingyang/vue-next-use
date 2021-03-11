# `useHover` and `useHoverDirty`

Vue UI sensor hooks that track if some element is being hovered
by a mouse.

- `useHover` accepts a React element or a function that returns one,
`useHoverDirty` accepts React ref.
- `useHover` sets react `onMouseEnter` and `onMouseLeave` events,
`useHoverDirty` sets DOM `onmouseover` and `onmouseout` events.


## Usage

```vue
<template>
  <div>
    <Hoverable @mouseenter="enter" @mouseleave="leave"/>
    <div>{{ hovered ? "HOVERED" : "" }}</div>
  </div>
</template>

<script>
import {h, unref} from "vue";
import {useHover} from "../src/index";

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