# `useTitle`

Vue side-effect hook that sets title of the page.

## Usage

```jsx
import {useTitle} from 'vue-next-use';

const Demo = {
    setup() {
        useTitle('Hello world!', {
            restoreOnUnmount: true
        });

        return null;
    }
};
```
