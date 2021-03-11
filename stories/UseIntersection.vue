<template>
  <div>
    {{
      intersection && intersection.intersectionRatio < 1
          ? 'Obscured'
          : 'Fully in view'
    }} - {{intersection && intersection.intersectionRatio}}
  </div>
  <div style="width: 400px; height: 400px; background-color: whitesmoke; overflow: scroll;">Scroll me
    <div style="width: 200px; height: 500px; background-color: whitesmoke;"></div>
    <div style="width: 100px; height: 100px; padding: 20px; background-color: palegreen;" ref="intersectionRef">Obscured</div>
    <div style="width: 200px; height: 500px; background-color: whitesmoke;"></div>
  </div>
</template>

<script>
import {ref} from 'vue';
import {useIntersection} from "../src/index";

export default {
  setup() {
    const intersectionRef = ref(null);
    const intersection = useIntersection(intersectionRef, {
      root: null,
      rootMargin: '0px',
      threshold: 1
    });

    return {
      intersectionRef,
      intersection,
    };
  },
};
</script>

<style scoped>
</style>