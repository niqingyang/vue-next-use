# `useDebounce`

Vue hook that delays invoking a function until after wait milliseconds have elapsed since the last time the debounced function was invoked.

The third argument is the array of values that the debounce depends on, in the same manner as useEffect. The debounce timeout will start when one of the values changes.

## Usage

```jsx
const Demo = {
  setup() {

    const [state, setState] = useState('Typing stopped');
    const [val, setVal] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');

    const [_, cancel] = useDebounce(
            () => {
              setState('Typing stopped');
              setDebouncedValue(val.value);
            },
            2000,
            [val]
    );

    return () => (
            <div>
              <input
                      type="text"
                      value={val.value}
                      placeholder="Debounced input"
                      onInput={({currentTarget}) => {
                        setState('Waiting for typing to stop...');
                        setVal(currentTarget.value);
                      }}
              />
              <div>{state.value}</div>
              <div>
                Debounced value: {debouncedValue.value}
                <button onClick={cancel}>Cancel debounce</button>
              </div>
            </div>
    );
  }
};
```

## Reference

```ts
const [
    isReady: () => boolean | null,
    cancel: () => void,
] = useDebounce(fn: Function, ms: number, deps: DependencyList = []);
```

- **`fn`**_`: Function`_ - function that will be called;
- **`ms`**_`: number`_ - delay in milliseconds;
- **`deps`**_`: DependencyList`_ - array of values that the debounce depends on, in the same manner as useEffect;
- **`isReady`**_`: ComputedRef<boolean|null>`_ - the current debounce state:
    - `false` - pending
    - `true` - called
    - `null` - cancelled
- **`cancel`**_`: ()=>void`_ - cancel the debounce
