import UseKey from '../src/component/UseKey';
import {ShowDemo, ShowDocs} from './util/index';
import {useKey, useState} from "../src/index";

export default {
    title: 'Sensors/UseKey',
    argTypes: {},
};

export const Docs = ShowDocs({md: require('../docs/useKey.md')});

export const Demo = ShowDemo({
    template: "Press 'q' <UseKey v-bind='args'/>",
    components: {
        UseKey
    },
    setup: () => ({
        args: {
            filter: 'q',
            fn: () => {
                alert('"q" key pressed!')
            }
        }
    })
});

export const Counter = ShowDemo({
    template: '<div>Press the key <input v-model="key"/> to increment: {{count}}</div>',
    setup() {
        const [key] = useState('ArrowUp');
        const [count] = useState(0);
        const increment = () => {
            count.value += 1;
        };
        useKey(key, increment);

        return {
            key,
            count,
        }
    }
});





