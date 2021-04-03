# `useQueue`

Vue state hook implements simple FIFO queue.

## Usage

```jsx
import { useQueue } from 'vue-next-use';

const Demo = {
  setup(){
      const {add, remove, first, last, size} = useQueue();
      return () => (
          <div>
              <ul>
                  <li>first: {first.value}</li>
                  <li>last: {last.value}</li>
                  <li>size: {size.value}</li>
              </ul>
              <button onClick={() => add((last.value || 0) + 1)}>Add</button>
              <button onClick={() => remove()}>Remove</button>
          </div>
      );
  }
};
```
