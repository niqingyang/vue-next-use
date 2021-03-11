# `useAsyncFn`

Vue hook that returns state and a callback for an `async` function or a
function that returns a promise. The state is of the same shape as `useAsync`.

## Usage

```vue
<template>
    <div>
      <div v-if="state.loading">Loading...</div>
      <div v-if="state.error">Error: {{state.error.message}}</div>
      <div v-if="state.value">Value: {{state.value}}</div>
      <button @click="request">Start loading</button>
    </div>
</template>

<script>
import {useAsyncFn} from 'vue-next-use';

export default {
    setup(props){

        const {url} = reactive(props);

        const [state, request] = useAsyncFn(async () => {
            const response = await fetch(url);
            const result = await response.text();
            return result
        });

        return {
            state,
            request
        }
    }
}
</script>

```

## Reference

```ts
useAsyncFn<Result, Args>(fn, initialState?: AsyncState<Result>);
```
