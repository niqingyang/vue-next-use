# `useSize`

Vue sensor hook that tracks size of an HTML element.

## Usage

```jsx
import {useSize} from 'vue-next-use';

const Demo = {
  setup(){
      const [Sized, state] = useSize({ width: 100, height: 100 });

      return () => {
          const {width, height} = state;
          return (
              <div>
                  <div style={{background: 'red'}}>
                      <Sized/>
                      Size me up! ({width}px)
                  </div>
                  <div>width: {width}</div>
                  <div>height: {height}</div>
              </div>
          )
      };
  }
};
```

## Reference

```js
const [SizedComponent, sizeState] = useSize(initialSize);
```

- `initialSize` &mdash; initial size containing a `width` and `height` key.

## Related hooks

- [useMeasure](./useMeasure.md)
