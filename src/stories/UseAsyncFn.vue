<template>
  <button @click="request">{{ state.loading ? 'loading...' : 'request' }}</button>
  <div v-if="user" style="display: flex; margin-top: 5px;">
      <span>
        <img :src="user.picture" style="width: 80px; height: 80px; background-color: #eee;"/>
      </span>
    <span>
        <ul style="margin: 0;">
          <li>Name: {{ user.name }}</li>
          <li>Email: {{ user.email }}</li>
          <li>Phone: {{ user.phone }}</li>
        </ul>
      </span>
  </div>
</template>

<script>

import {useAsyncFn} from "../index";
import {computed} from "vue";

export default {
  name: "UseAsyncFn",
  setup() {
    const [state, request] = useAsyncFn(async () => {
      return await fetch('https://randomuser.me/api').then(res => res.json());
    });

    return {
      user: computed(() => {

        let user = null;

        if (!state.value.loading && state.value.value) {
          const result = state.value.value.results[0];

          user = {
            name: `${result.name.title} ${result.name.first} ${result.name.last}`,
            email: result.email,
            phone: result.phone,
            picture: result.picture.large
          }
        }

        return user;
      }),
      state,
      request
    }
  }
}
</script>

<style scoped>

</style>