# `useStateValidator`

Each time given state changes - validator function is invoked.

## Usage
```jsx 
import { useStateValidator, useState } from 'vue-next-use';

const Demo = {
  setup(props) {

    const DemoStateValidator = (s) => [s === '' ? undefined : (s * 1) % 2 === 0] as [boolean | undefined];

    const [state, setState] = useState<number>(0);
    const [validateState] = useStateValidator(state, DemoStateValidator);
    const [isValid] = toRefs(validateState);

    return () => (
        <div>
          <div>Below field is valid only if number is even</div>
          <input 
                  type="number" 
                  min="0"
                  max="10"
                  v-model={state.value}
          />
          {isValid.value !== undefined && <span>{isValid.value ? 'Valid!' : 'Invalid'}</span>}
        </div>
    );
  }
};
```

## Reference
```ts 
const [validity, revalidate] = useStateValidator(
  state: any,
  validator: (state, setValidity?)=>[boolean|null, ...any[]],
  initialValidity: any
);
```
- **`validity`**_`: [boolean|null, ...any[]]`_ result of validity check. First element is strictly nullable boolean, but others can contain arbitrary data;
- **`revalidate`**_`: ()=>void`_ runs validator once again
- **`validator`**_`: (state, setValidity?)=>[boolean|null, ...any[]]`_ should return an array suitable for validity state described above;
    - `state` - current state;
    - `setValidity` - if defined hook will not trigger validity change automatically. Useful for async validators;
- `initialValidity` - validity value which set when validity is nt calculated yet;
