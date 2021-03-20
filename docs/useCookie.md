# `useCookie`

Vue hook that returns the current value of a `cookie`, a callback to update the `cookie`
and a callback to delete the `cookie.`

## Usage

```jsx
import { useCookie, useState } from "vue-next-use";

const Demo = {
    setup() {

        const [value, updateCookie, deleteCookie] = useCookie("my-cookie");
        const [counter, setCounter] = useState(1);

        useEffect(() => {
            deleteCookie();
        }, []);

        const updateCookieHandler = () => {
            updateCookie(`my-awesome-cookie-${counter.value}`);
            setCounter(c => c + 1);
        };

        return () => (
            <div>
                <p>Value: {value.value}</p>
                <button onClick={updateCookieHandler}>Update Cookie</button>
                <br/>
                <button onClick={deleteCookie}>Delete Cookie</button>
            </div>
        );
    }
};
```

## Reference

```ts
const [value, updateCookie, deleteCookie] = useCookie(cookieName: string);
```
