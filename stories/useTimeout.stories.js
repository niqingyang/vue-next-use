import {computed, ref, watch} from "vue";
import {useTimeout, useState, useRef, useCss} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Animation/useTimeout',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useTimeout.md'));

const TestComponent = {
    props: {
        ms: {
            type: Number,
            default: 5000
        }
    },
    setup(props) {
        const ms = props.ms || 5000;
        const [isReady, cancel] = useTimeout(ms);

        return () => (
            <div>
                {isReady.value ? 'I\'m reloaded after timeout' : `I will be reloaded after ${ms / 1000}s`}
                {isReady.value === false ? <button onClick={cancel}>Cancel</button> : ''}
            </div>
        );
    }
}

export const Demo = ShowDemo({
    setup() {
        return () => (
            <div>
                <TestComponent/>
                <TestComponent ms={10000}/>
            </div>
        );
    }
});

