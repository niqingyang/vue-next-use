# `useIntersection`

Vue sensor hook that tracks the changes in the intersection of a target element with an ancestor element or with a top-level document's viewport. Uses the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) and returns a [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry).

## Usage

```vue
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
    import {useIntersection} from "vue-next-use";

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
```

## Reference

```ts
useIntersection(
  ref: Ref<HTMLElement>,
  options: IntersectionObserverInit | Ref<IntersectionObserverInit>,
): ComputedRef<IntersectionObserverEntry | null>;
```