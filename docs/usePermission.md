# `usePermission`

Vue side-effect hook to query permission status of browser APIs.

## Usage

```jsx
import {usePermission} from 'vue-next-use';

const Demo = {
  setup(){
      const state = usePermission({ name: 'microphone' });

      return () => (
          <pre>
              {JSON.stringify(state, null, 2)}
          </pre>
      );
  }
};
```
