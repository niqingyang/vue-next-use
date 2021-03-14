# `useState`

Vue state hook with `ref` that creates `setState` method which works similar to how
`this.setState` works in class components&mdash;it set object changes into
current state.


## Usage

```jsx
import {useState} from 'vue-next-use';

const Demo = () => {
  const [state, setState] = useState({});

  return (
    <div>
      <pre>{JSON.stringify(state.value, null, 2)}</pre>
      <button onClick={() => setState({hello: 'world'})}>hello</button>
      <button onClick={() => setState({foo: 'bar'})}>foo</button>
      <button 
        onClick={() => {
          setState((prevState) => ({
            count: (prevState.count || 0) + 1,
          }))
        }}
      >
        count
      </button>
    </div>
  );
};
```

## Reference

```js
const [state, setState] = useState({cnt: 0});

setState({cnt: state.value.cnt + 1});
setState((prevState) => ({
  cnt: prevState + 1,
}));
```
