# `useKey`

Vue UI sensor hook that executes a `handler` when a keyboard key is used.

## Usage

```vue
<template>
  <div>Press the key <input v-model="key"/> to increment: {{count}}</div>
</template>

<script>
import {useKey, useState} from "vue-next-use";

export default {
  setup() {
    const [key] = useState('ArrowUp');
    const [count] = useState(0);
    const increment = () => {
      count.value += 1;
    };
    useKey(key, increment);

    return {
      key,
      count,
    }
  },
};
</script>
```

Or as render-prop:

```jsx
import UseKey from 'vue-next-use';

<UseKey filter='a' fn={() => alert('"a" key pressed!')}/>
```

## Reference

```js
useKey(filter, handler, options ?)
```

## Examples

```js
useKey('a', () => alert('"a" pressed'));

const predicate = (event) => event.key === 'a'
useKey(predicate, handler, {event: 'keyup'});
```
