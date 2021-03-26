# `useThrottle` and `useThrottleFn`

Vue hooks that throttle.

## Usage

```jsx
import { useThrottle, useThrottleFn, useState } from 'vue-next-use';

const Demo = {
  setup(){
      const throttledValue = useThrottle(value);
      // const throttledValue = useThrottleFn(value => value, 200);

      return () => (
          <>
              <div>Value: {value}</div>
              <div>Throttled value: {throttledValue}</div>
          </>
      );
  }
};
```

## Reference

```ts
useThrottle(value, ms?: number);
useThrottleFn(fn, ms, args);
```
