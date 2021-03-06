import {useLocalStorage} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/useLocalStorage',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useLocalStorage.md'));

export const Demo = ShowDemo({
    setup() {

        const [value, setValue, remove] = useLocalStorage('my-key', 'foo');
        const [state, setState, removeState] = useLocalStorage('object-key', {count: 0});

        return () => (
            <div>
                <div>
                    <div>Value: {JSON.stringify(value.value)}</div>
                    <button onClick={() => setValue('bar')}>bar</button>
                    <button onClick={() => setValue('baz')}>baz</button>
                    <button onClick={() => remove()}>Remove</button>
                </div>
                <div style="margin-top: 10px;">
                    <div>Object: {JSON.stringify(state.value)}</div>
                    <button onClick={() => setState({count: 1})}>set count</button>
                    <button onClick={() => setState({count: 1, key: 'key'})}>set key</button>
                    <button onClick={() => removeState()}>Remove</button>
                </div>
            </div>
        );
    }
});

