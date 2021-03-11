# `useEvent`

Vue sensor hook that subscribes a `handler` to events.

## Usage

```vue
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
import { useList, useEvent } from "vue-next-use";

export default {
  components: {},
  props: {},
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
```

## Examples

```js
useEvent('keydown', handler)
useEvent('scroll', handler, window, {capture: true})
```
