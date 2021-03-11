<template>
  <article v-html="content" class="markdown-body"></article>
</template>

<script>
import { reactive } from "vue";
import './github-markdown.css';

export default {
  name: "Docs",
  props: {
    content: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    props = reactive(props);
    return {
      content: props.content,
    };
  },
};
</script>

<style scoped>

</style>
