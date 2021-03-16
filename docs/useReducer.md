# `useReducer`

A lot like the standardreact `useReducer`, but with vue implementation.

## Usage
```jsx
import { useReducer } from 'vue-next-use';

const Demo = {
    setup() {

        const initializer = (initialState) => {
            return isNaN(initialState) ? 0 : initialState;
        };

        const [state, dispatch] = useReducer((preState, action) => {
            switch (action) {
                case "increment":
                    return preState + 1;
                case "decrement":
                    return preState - 1;
            }
            return preState;
        }, undefined, initializer);

        return () => (
            <div>
                <button onClick={() => dispatch('increment')}>increment</button>
                <button onClick={() => dispatch('decrement')}>decrement</button>
                <span style={{margin: "0 5px"}}>count: {state.value}</span>
            </div>
        );
    },
};
```

## Reference
```ts
const [state, dispatch] = useReducer<R extends (Reducer<any, any> | ReducerWithoutAction<any>), I>(
    reducer: R,
    initialState: I | ReducerState<R>,
    initializer?: (arg: I | ReducerState<R>) => ReducerState<R>
): [ComputedRef<I>, Dispatch<ReducerAction<R>> | DispatchWithoutAction]
```