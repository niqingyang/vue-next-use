# `useMediaDevices`

Vue sensor hook that tracks connected hardware devices.


## Usage

```jsx
import {useMediaDevices} from 'vue-next-use';

const Demo = {
  setup(){
      const state = useMediaDevices();

      return () => (
          <pre>
              {JSON.stringify(state, null, 2)}
          </pre>
      );
  }
};
```
