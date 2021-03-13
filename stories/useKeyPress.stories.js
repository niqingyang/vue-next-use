import {computed, ref, unref} from "vue";
import {useKeyPress} from '../src/index'
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useKeyPress',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useKeyPress.md'));

export const Demo = ShowDemo({
    template: `<div style="text-align: center;">Try pressing numbers<br/>{{ states }}</div>`,
    setup() {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
        const states = ref([]);

        for (const key of keys) {
            states.value.push(useKeyPress(key)[0]);
        }

        return {
            keys,
            states: computed(() => {
                return states.value.reduce((s, pressed, index) => {
                    return s + (unref(pressed) ? (s ? ' + ' : '') + keys[index] : '')
                }, '')
            })
        }
    }
});





