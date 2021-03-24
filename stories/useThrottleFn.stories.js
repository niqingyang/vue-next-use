import {useThrottleFn, useState, useEffect} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/useThrottleFn',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useThrottleFn.md'));

export const Demo = ShowDemo({
    setup() {

        const [value, setValue] = useState('');
        const throttledValue = useThrottleFn((defaultValue) => defaultValue, 2000, [value]);
        const [lastThrottledValue, setLastThrottledValue] = useState(throttledValue);
        const [count, {inc}] = useCounter();

        useEffect(() => {
            if (lastThrottledValue !== throttledValue) {
                setLastThrottledValue(throttledValue);
                inc();
            }
        });

        return () => (
            <div style={{width: '300px', margin: '40px auto'}}>
                <input
                    type="text"
                    value={value}
                    placeholder="Throttled input"
                    style={{width: '100%'}}
                    onChange={({currentTarget}) => {
                        setValue(currentTarget.value);
                    }}
                />
                <br/>
                <br/>
                <div>Throttled value: {throttledValue}</div>
                <div>Times updated: {count}</div>
            </div>
        );
    }
});

