# `useMouse` and `useMouseHovered`

Vue sensor hooks that re-render on mouse position changes. `useMouse` simply tracks
mouse position; `useMouseHovered` allows you to specify extra options:

- `bound` &mdash; to bind mouse coordinates within the element
- `whenHovered` &mdash; whether to attach `mousemove` event handler only when user hovers over the element

## Usage

```jsx
import {useMouse, useRef} from 'vue-next-use';

const Demo = {
  setup(){
      const ref = useRef(null);
      // {docX, docY, posX, posY, elX, elY, elW, elH}
      const state = useMouse(ref);

      return () => {
          const {docX, docY, posX, posY, elX, elY, elW, elH} = state.value;
          return (
              <div ref={ref}>
                  <div>Mouse position in document - x:{docX} y:{docY}</div>
                  <div>Mouse position in element - x:{elX} y:{elY}</div>
                  <div>Element position- x:{posX} y:{posY}</div>
                  <div>Element dimensions - {elW}x{elH}</div>
              </div>
          );
      };
  }
};
```

## Reference

```ts
useMouse(ref);
useMouseHovered(ref, {bound: false, whenHovered: false});
```
