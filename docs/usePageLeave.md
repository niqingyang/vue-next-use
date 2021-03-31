# `usePageLeave`

Vue sensor hook that fires a callback when mouse leaves the page.

## Usage

```jsx
import {usePageLeave} from 'vue-next-use';

const Demo = {
    setup(){
        usePageLeave(() => console.log('Page left...'));

        return null;
    }
};
```
