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
  <span ref="faceNode" style="font-size: 32px; cursor: pointer;">{{isHovering ? '😀' : '🙁'}}</span>
</template>

<script>
import {h, reactive, ref, unref} from "vue";
import {useHoverDirty} from "vue-next-use";

export default {
  props: {
    enabled: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  setup(props) {

    const {enabled} = reactive(props);

    const faceNode = ref();

    const isHovering = useHoverDirty(faceNode, enabled);

    return {
      faceNode,
      isHovering
    };
  },
};
</script>
```


## Reference

```js
const [newVNode, isHovering] = useHoverDirty(reactElement);
const [newVNode, isHovering] = useHoverDirty((isHovering) => reactElement);
const isHovering = useHoverDirty(ref, enabled);
```