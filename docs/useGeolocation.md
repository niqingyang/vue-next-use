# `useGeolocation`

Vue sensor hook that tracks user's geographic location. This hook accepts [position options](https://developer.mozilla.org/docs/Web/API/PositionOptions).

## Usage

```vue
<template>
  <pre>
      {{JSON.stringify(state, null, 2)}}
    </pre
  >
</template>

<script>
import { useGeolocation } from "vue-next-use";

export default {
  components: {},
  props: {},
  setup() {
    const state = useGeolocation();

    return {
      state,
    };
  },
};
</script>
```

## Reference

```ts
useGeolocation(options: PositionOptions)
```
