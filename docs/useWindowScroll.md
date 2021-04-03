# `useWindowScroll`

Vue sensor hook that re-renders on window scroll.

## Usage

```jsx
import {useWindowScroll} from 'vue-next-use';

const Demo = {
  setup(){
      const state = useWindowScroll();

      return () => {
          const {x, y} = state;
          return (
              <div>
                  <div>x: {x}</div>
                  <div>y: {y}</div>
              </div>
          )
      };
  }
};
```
