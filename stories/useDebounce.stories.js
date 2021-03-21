import {useDebounce, useState} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/useDebounce',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useDebounce.md'));

export const Demo = ShowDemo({
    props: {
        ms: Number
    },
    setup(props) {

        const [state, setState] = useState('Typing stopped');
        const [val, setVal] = useState('');
        const [debouncedValue, setDebouncedValue] = useState('');

        const [isReady, cancel] = useDebounce(
            () => {
                setState('Typing stopped');
                setDebouncedValue(val.value);
            },
            props.ms,
            [val]
        );

        return () => (
            <div>
                <input
                    type="text"
                    value={val.value}
                    placeholder="Debounced input"
                    onInput={({currentTarget}) => {
                        setState('Waiting for typing to stop...');
                        setVal(currentTarget.value);
                    }}
                />
                <div>{state.value}</div>
                <div>
                    Debounced value: {debouncedValue.value}
                    <button onClick={cancel}>Cancel debounce</button>
                </div>
            </div>
        );
    }
}, {
   ms: 1000
});

