# `useHash`

Vue sensor hook that tracks browser's location hash.

## Usage

```vue
<template>
  <div>
    <div>window.location.href:</div>
    <div>
      <pre>{{ href }}</pre>
    </div>
    <div>Edit hash:</div>
    <div>
      <input style="width: 100%;" v-model="hash"/>
    </div>
  </div>
</template>

<script>
import {onMounted, watch} from 'vue';
import {useHash, useState} from "vue-next-use";

export default {
  setup() {
    const [href, setHref] = useState(window.location.href);
    const [hash, setHash] = useHash();

    onMounted(() => {
      setHash('#/path/to/page?userId=123');
    });

    watch(hash, () => {
      setHref(window.location.href);
    });

    return {
      href,
      hash
    };
  },
};
</script>
```

## API

`const [hash, setHash] = useHash()`

Get latest url hash with `hash` and set url hash with `setHash`.

- `hash: string`: get current url hash. listen to `hashchange` event.
- `setHash: (newHash: string) => void`: change url hash. Invoke this method will trigger `hashchange` event.