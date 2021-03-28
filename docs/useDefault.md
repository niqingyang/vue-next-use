# `useDefault`

Vue state hook that returns the default value when state is null or undefined.

## Usage

```jsx
import {useDefault} from 'vue-next-use';

const Demo = {
  setup(){
      const initialUser = { name: 'Marshall' }
      const defaultUser = { name: 'Mathers' }
      const [user, setUser] = useDefault(defaultUser, initialUser);

      return () => (
          <div>
              <div>User: {user.value.name}</div>
              <input onInput={e => setUser({ name: e.target.value })} />
              <button onClick={() => setUser(null)}>set to null</button>
          </div>
      );
  }
};
```
