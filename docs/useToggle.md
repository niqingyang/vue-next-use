# `useToggle`

Vue state hook that tracks value of a boolean.

`useBoolean` is an alias for `useToggle`.

## Usage

```jsx
import {useToggle} from 'vue-next-use';

const Demo = {
  setup(){
      const [on, toggle] = useToggle(true);

      return () => (
          <div>
              <div>{on.value ? 'ON' : 'OFF'}</div>
              <button onClick={toggle}>Toggle</button>
              <button onClick={() => toggle(true)}>set ON</button>
              <button onClick={() => toggle(false)}>set OFF</button>
          </div>
      );
  }
};
```
