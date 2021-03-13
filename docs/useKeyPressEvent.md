# `useKeyPressEvent`

This hook fires `keydown` and `keyup` callbacks, similar to how [`useKey`](/?path=/story/sensors-usekey--docs)
hook does, but it only triggers each callback once per press cycle. For example, if you press and hold a key, it will
fire `keydown` callback only once.

## Usage

```vue
<script>
import {useKeyPressEvent, useState} from 'vue-next-use';

export default {
  setup() {
    const [count, setCount] = useState(0);

    const increment = () => setCount(count => ++count);
    const decrement = () => setCount(count => --count);
    const reset = () => setCount(0);

    useKeyPressEvent(']', increment, increment);
    useKeyPressEvent('[', decrement, decrement);
    useKeyPressEvent('r', reset);

    return () => {
      return (
          <div className="markdown-body">
            <p>
              Try pressing <code>[</code>, <code>]</code>, and <code>r</code> to
              see the count incremented and decremented.</p>
            <p>Count: {count.value}</p>
          </div>
      )
    }
  },
}
</script>
```

## Reference

```js
useKeyPressEvent('<key>', keydown);
useKeyPressEvent('<key>', keydown, keyup);
useKeyPressEvent('<key>', keydown, keyup, useKeyPress);
```
