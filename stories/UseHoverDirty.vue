<template>
  <span ref="faceNode" style="font-size: 32px; cursor: pointer;">{{isHovering ? '😀' : '🙁'}}</span>
</template>

<script>
import {h, reactive, ref, unref} from "vue";
import {useHoverDirty} from "../src/index";

export default {
  props: {
    enabled: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {

    const {enabled} = reactive(props);

    const faceNode = ref();

    const isHovering = useHoverDirty(faceNode, enabled);

    return {
      faceNode,
      isHovering
    };
  },
};
</script>

<style scoped>
</style>