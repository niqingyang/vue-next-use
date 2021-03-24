# `useThrottleFn`

Vue hook that invokes a function and then delays subsequent function calls until after wait milliseconds have elapsed since the last time the throttled function was invoked.

The third argument is the array of values that the throttle depends on, in the same manner as useEffect. The throttle timeout will start when one of the values changes.

## Usage

```jsx
import { useThrottleFn, useState } from 'vue-next-use';

const Demo = {
  setup(){
        const [status, setStatus] = useState('Updating stopped');
        const [value, setValue] = useState('');
        const [throttledValue, setThrottledValue] = useState('');

        useThrottleFn(
            () => {
                setStatus('Waiting for input...');
                setThrottledValue(value);
            },
            2000,
            [value]
        );

        return () => (
            <div>
                <input
                    type="text"
                    value={value}
                    placeholder="Throttled input"
                    onChange={({ currentTarget }) => {
                        setStatus('Updating stopped');
                        setValue(currentTarget.value);
                    }}
                />
                <div>{status}</div>
                <div>Throttled value: {throttledValue}</div>
            </div>
        );
    }
};
```

## Reference

```ts
useThrottleFn(fn, ms: number, args: any[]);
```
