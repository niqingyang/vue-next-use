# `useMemo`

Vue memory hook with `watch` which works similar to how React.useMemo works; 


## Usage

```jsx
import {useMemo, useState} from 'vue-next-use';

const Demo = () => {
  const [count, setCount] = useState(0);

  const state =  useMemo(()=>{
      return count.value;
  }, count);
  
  setInterval(()=>{
      setCount(c => c + 1);
  }, 1000);

  return (
    <div>
      <pre>{JSON.stringify(state.value, null, 2)}</pre>
    </div>
  );
};
```

## Reference

```js
useMemo<T>(factory: () => T, deps: MultiWatchSources | WatchSource | null | undefined = undefined): Ref<T>
```
