# `useScroll`

Vue sensor hook that re-renders when the scroll position in a DOM element changes.

## Usage

```jsx
import {useScroll, useRef} from 'vue-next-use';

const Demo = {
  setup(){
      const scrollRef = useRef(null);
      const state = useScroll(scrollRef);

      return () => {
          const {x, y} = state;
          return (
              <div ref={scrollRef}>
                  <div>x: {x}</div>
                  <div>y: {y}</div>
              </div>
          )};
  }
};
```

## Reference

```ts
useScroll(ref: RefObject<HTMLElement>);
```
