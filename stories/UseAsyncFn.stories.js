import {ShowDemo, ShowDocs} from './util/index';
import {useAsyncFn} from "../src";
import {computed, unref} from "vue";

export default {
    title: 'SideEffects/useAsyncFn',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useAsyncFn.md'));

export const Demo = ShowDemo({
    template: `
      <button @click="request">
      {{ state.loading ? "loading..." : "request random user" }}
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
        const [state, request] = useAsyncFn(async () => {
            return await fetch("https://randomuser.me/api").then((res) => res.json());
        });

        return {
            state,
            request,
            user: computed(() => {
                if (unref(state).loading || !unref(state).value) {
                    return null;
                }

                const result = unref(state).value.results[0];

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




