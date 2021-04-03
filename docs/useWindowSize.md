# `useWindowSize`

React sensor hook that tracks dimensions of the browser window.

## Usage

```jsx
import {useWindowSize} from 'vue-next-use';

const Demo = {
    setup() {
        const state = useWindowSize();

        return () => {
            const {width, height} = state;
            return (
                <div>
                    <div>width: {width}</div>
                    <div>height: {height}</div>
                </div>
            )
        };
    }
};
```
