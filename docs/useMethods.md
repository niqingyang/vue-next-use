# `useMethods`

Vue hook that simplifies the `useReducer` implementation.

## Usage

```jsx
import { useMethods } from 'vue-next-use';

const Demo = {
    setup(props) {
        const initialState = {
            count: 0,
        };

        function createMethods(state) {
            return {
                reset() {
                    return initialState;
                },
                increment() {
                    return {...state, count: state.count + 1};
                },
                decrement() {
                    return {...state, count: state.count - 1};
                },
            };
        }

        const [state, methods] = useMethods(createMethods, initialState);

        return () => (
            <>
                <p>Count: {state.value.count}</p>
                <button onClick={methods.decrement}>-</button>
                <button onClick={methods.increment}>+</button>
                <button onClick={methods.reset}>reset</button>
            </>
        );
    }
};
```

## Reference

```js
const [state, methods] = useMethods(createMethods, initialState);
```

- `createMethods` &mdash; function that takes current state and return an object containing methods that return updated state.
- `initialState` &mdash; initial value of the state.
