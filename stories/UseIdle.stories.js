import {ShowDemo, ShowDocs} from './util/index';
import {ref} from "vue";
import {useIdle} from "../src/index";

export default {
    title: 'Sensors/useIdle',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useIdle.md'));

export const Demo = ShowDemo({
    template: `
      <div>
      Idle delay ms：<input type="number" v-model="delay"/>
      <div>User is idle: {{ isIdle ? 'Yes 😴' : 'Nope' }}</div>
      </div>
    `,
    setup() {
        const delay = ref(1000);
        const isIdle = useIdle(delay);

        return {
            delay,
            isIdle,
        };
    },
});




