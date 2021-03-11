import UseKey from './UseKey.vue';
import {ShowDemo, ShowDocs} from './util/index';
import {h, reactive, unref} from "vue";
import {useKey, useState} from "../src/index";

export default {
    title: 'Sensors/UseKey',
    component: UseKey,
    argTypes: {
        key: { control: { type: 'select', options: ['ArrowUp', 'ArrowLeft'] } },
    },
};

export const Docs = ShowDocs({md: require('../docs/useKey.md')});

export const Demo = ShowDemo(UseKey);

export const Count = ShowDemo(h({
    setup(props) {
        const {key} = reactive(props);
        const [count, set] = useState(0);
        const increment = () => set(count => ++count);
        console.log('key', unref(key))
        useKey(key, increment);

        return {
            count,
            key
        }
    },
    render({count, test}){
        return h('div',`Press arrow up: ${count}-${test}`)
    }
}), {
    key: 'ArrowUp',
    test: 213
});




