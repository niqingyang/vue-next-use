# `useMedia`

Vue sensor hook that tracks state of a CSS media query.

## Usage

```jsx
import {useMedia} from 'vue-next-use';

const Demo = {
  setup(){
      const isWide = useMedia('(min-width: 480px)');

      return () => (
          <div>
              Screen is wide: {isWide.value ? 'Yes' : 'No'}
          </div>
      );
  }
};
```

## Reference

```ts
useMedia(query: string | Ref<string>, defaultState: boolean = false): ComputedRef<boolean>;
```

The `defaultState` parameter is only used as a fallback for server side rendering.
