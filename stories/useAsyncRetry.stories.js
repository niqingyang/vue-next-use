import {ShowDemo, ShowDocs} from './util/index';
import {useAsyncRetry} from "../src";
import {computed, unref} from "vue";

export default {
    title: 'SideEffects/useAsyncRetry',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useAsyncRetry.md'));

export const Demo = ShowDemo({
    template: `
      <button @click="state.retry">
      {{ state.loading ? "loading..." : "retry request random user" }}
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
    `,
    setup(props) {
        const state = useAsyncRetry(async () => {
            return await fetch("https://randomuser.me/api").then((res) => res.json());
        });

        return {
            state,
            user: computed(() => {
                if (state.loading || !state.value) {
                    return null;
                }

                const result = state.value.results[0];

                return {
                    name: `${result.name.title} ${result.name.first} ${result.name.last}`,
                    email: result.email,
                    phone: result.phone,
                    picture: result.picture.large,
                };
            })
        };
    }
});




