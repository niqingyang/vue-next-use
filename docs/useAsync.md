# `useAsync`

Vue hook that resolves an `async` function or a function that returns
a promise;

## Usage

```jsx
import {useAsync} from 'vue-next-use';

const Demo = {
    template: `
      <div v-if="state.loading">loading...</div>
      <div v-if="user" style="display: flex; margin-top: 5px">
      <span>
        <img
            :src="user.picture"
            style="width: 80px; height: 80px; background-color: #eee"
        />
      </span>
      <span>
        <ul style="margin: 0">
          <li>Name: {{ user.name }}</li>
          <li>Email: {{ user.email }}</li>
          <li>Phone: {{ user.phone }}</li>
        </ul>
      </span>
      </div>
    `,
    setup(props) {
        const state = useAsync(async () => {
            return await fetch("https://randomuser.me/api").then((res) => res.json());
        });

        return {
            state,
            user: computed(() => {
                if (unref(state).loading || !unref(state).value) {
                    return null;
                }

                const result = unref(state).value.results[0];

                return {
                    name: `${result.name.title} ${result.name.first} ${result.name.last}`,
                    email: result.email,
                    phone: result.phone,
                    picture: result.picture.large,
                };
            })
        };
    }
};
```

## Reference

```ts
useAsync(fn, args?: any[]);
```
