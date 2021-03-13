# `useKeyPress`

Vue UI sensor hook that detects when the user is pressing a specific key on their keyboard.

## Usage

```vue
<template>
  <div style="text-align: center;">Try pressing numbers<br/>{{ states }}</div>
</template>
<script>
import {computed, ref, unref} from "vue";
import {useKeyPress} from 'vue-next-use'

export default {
  setup() {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const states = ref([]);

    for (const key of keys) {
      states.value.push(useKeyPress(key)[0]);
    }

    return {
      keys,
      states: computed(() => {
        return states.value.reduce((s, pressed, index) => {
          return s + (unref(pressed) ? (s ? ' + ' : '') + keys[index] : '')
        }, '')
      })
    }
  }
}
</script>
```

## Examples

```js
const [isPressed, keyboardEvent] = useKeyPress('a');

const predicate = (event) => event.key === 'a';
const [isPressed, keyboardEvent] = useKeyPress(predicate);
```