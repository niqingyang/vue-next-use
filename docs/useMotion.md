# `useMotion`

Vue sensor hook that uses device's acceleration sensor to track its motions.


## Usage

```jsx
import {useMotion} from 'vue-next-use';

const Demo = () => {
  const [state, requestPermission] = useMotion();

  return () => (
      <div>
          <button onClick={requestPermission}>Get Permision</button>
          <pre>
              {JSON.stringify(state, null, 2)}
          </pre>
      </div>
  );
};
```
