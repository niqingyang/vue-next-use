import {useInterval, useBoolean, useState} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';
import {computed, watch} from "vue";

export default {
    title: 'Animation/useInterval',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useInterval.md'));

export const Demo = ShowDemo({
    setup() {
        const [delay] = useState(1000);
        const [count, setCount] = useState(0);
        const [isRunning, toggleIsRunning] = useBoolean(true);

        useInterval(
            () => {
                setCount((c) => c + 1);
            },
            computed(() => {
                return isRunning.value ? delay.value : null
            })
        );

        return () => (
            <div>
                <div>
                    delay: <input type="number" v-model={delay.value}/>
                </div>
                <h1>count: {count.value}</h1>
                <div>
                    <button onClick={toggleIsRunning}>{isRunning.value ? 'stop' : 'start'}</button>
                </div>
            </div>
        );
    }
});

