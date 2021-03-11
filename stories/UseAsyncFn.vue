<template>
  <button @click="request">
    {{ state.loading ? "loading..." : "request" }}
  </button>
  <div v-if="user" style="display: flex; margin-top: 5px">
    <span>
      <img
        :src="user.picture"
        style="width: 80px; height: 80px; background-color: #eee"
      />
    </span>
    <span>
      <ul style="margin: 0">
        <li>Name: {{ user.name }}</li>
        <li>Email: {{ user.email }}</li>
        <li>Phone: {{ user.phone }}</li>
      </ul>
    </span>
  </div>
</template>

<script>
import { useAsyncFn } from "../src/index";
import { computed, reactive, unref } from "vue";

export default {
  components: {},
  props: {},
  setup(props) {
    const [state, request] = useAsyncFn(async () => {
      return await fetch("https://randomuser.me/api").then((res) => res.json());
    });

    return {
      user: computed(() => {
        let user = null;

        if (!unref(state).loading && unref(state).value) {
          const result = unref(state).value.results[0];

          user = {
            name: `${result.name.title} ${result.name.first} ${result.name.last}`,
            email: result.email,
            phone: result.phone,
            picture: result.picture.large,
          };
        }

        return user;
      }),
      state,
      request,
    };
  },
};
</script>

<style scoped>
</style>