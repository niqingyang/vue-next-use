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
import {useHash, useState} from "../src/index";

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

<style scoped>
</style>