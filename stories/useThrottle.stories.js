import {useThrottle, useState, useEffect, useCounter, useRef} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/useThrottle',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useThrottle.md'));

export const Demo = ShowDemo({
    setup() {

        const value = useRef('');
        const throttledValue = useThrottle(value, 2000);
        const [lastThrottledValue, setLastThrottledValue] = useState(throttledValue.value);
        const [count, {inc}] = useCounter(0);

        useEffect(() => {
            if (lastThrottledValue.value !== throttledValue.value) {
                setLastThrottledValue(throttledValue.value);
                inc();
            }
        }, throttledValue);

        return () => (
            <div style={{width: '300px', margin: '40px auto'}}>
                <input
                    type="text"
                    v-model={value.value}
                    placeholder="Throttled input"
                    style={{width: '100%'}}
                />
                <br/>
                <br/>
                <div>Throttled value: {throttledValue.value}</div>
                <div>Times updated: {count.value}</div>
            </div>
        );
    }
});

