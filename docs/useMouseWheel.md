# `useMouseWheel` 
Vue Hook to get deltaY of mouse scrolled in window. 

## Usage

```jsx
import { useMouseWheel } from 'vue-next-use';

const Demo = {
  setup(){
      const mouseWheel = useMouseWheel()
      return () => (
          <>
              <h3>delta Y Scrolled: {mouseWheel.value}</h3>
          </>
      );
  }
};
```
