# `useIdle`

Vue sensor hook that tracks if user on the page is idle.


## Usage

```vue
<template>
  <div>
    <div>User is idle: {isIdle ? 'Yes 😴' : 'Nope'}</div>
  </div>
</template>

<script>
import { useIdle } from "vue-next-use";

export default {
  setup() {
    const isIdle = useIdle(3e3);

    return {
      isIdle,
    };
  },
};
</script>
```


## Reference

```js
useIdle(ms, initialState);
```

- `ms` &mdash; time in milliseconds after which to consider use idle, defaults to `60e3` &mdash; one minute.
- `initialState` &mdash; whether to consider user initially idle, defaults to false.