# `useLocalStorage`

Vue side-effect hook that manages a single `localStorage` key.

## Usage

```jsx
import { useLocalStorage } from 'vue-next-use';

const Demo = {
    setup() {

        const [value, setValue, remove] = useLocalStorage('my-key', 'foo');
        const [state, setState, removeState] = useLocalStorage('object-key', {count: 0});

        return () => (
            <div>
                <div>
                    <div>Value: {JSON.stringify(value.value)}</div>
                    <button onClick={() => setValue('bar')}>bar</button>
                    <button onClick={() => setValue('baz')}>baz</button>
                    <button onClick={() => remove()}>Remove</button>
                </div>
                <div style="margin-top: 10px;">
                    <div>Object: {JSON.stringify(state.value)}</div>
                    <button onClick={() => setState({count: 1})}>set count</button>
                    <button onClick={() => setState({count: 1, key: 'key'})}>set key</button>
                    <button onClick={() => removeState()}>Remove</button>
                </div>
            </div>
        );
    }
};
```

## Reference

```js
useLocalStorage(key);
useLocalStorage(key, initialValue);
useLocalStorage(key, initialValue, { raw: true });
useLocalStorage(key, initialValue, {
  raw: false,
  serializer: (value: T) => string,
  deserializer: (value: string) => T,
});
```

- `key` &mdash; `localStorage` key to manage.
- `initialValue` &mdash; initial value to set, if value in `localStorage` is empty.
- `raw` &mdash; boolean, if set to `true`, hook will not attempt to JSON serialize stored values.
- `serializer` &mdash; custom serializer (defaults to `JSON.stringify`)
- `deserializer` &mdash; custom deserializer (defaults to `JSON.parse`)
