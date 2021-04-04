# `useScrolling`

Vue sensor hook that keeps track of whether the user is scrolling or not.

## Usage

```jsx
import { useScrolling, useRef } from "vue-next-use";

const Demo = {
  setup(){
      const scrollRef = useRef(null);
      const scrolling = useScrolling(scrollRef);

      return () => (
          <div ref={scrollRef}>
              {<div>{scrolling.value ? "Scrolling" : "Not scrolling"}</div>}
          </div>
      );
  }
};
```

## Reference

```ts
useScrolling(ref: RefObject<HTMLElement>);
```
