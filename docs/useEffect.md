# `useEffect`

Vue effect hook with `onMounted` `onUnMounted` `watch` which works similar to how
React.useEffect works without update; 


## Usage

```jsx
import {useEffect} from 'vue-next-use';

const Demo = () => {
  const [state, setState] = useState({});
  
  useEffect(()=>{
      console.log('state changed', state.value);
      
      return () => {
          console.log('clean');
      }
  }, state);

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
useEffect(create: () => (() => void) | void, deps?: MultiWatchSources | WatchSource | null | undefined = undefined)
```
