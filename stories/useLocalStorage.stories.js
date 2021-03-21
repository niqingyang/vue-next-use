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

        return () => (
            <div>
                <div>Value: {JSON.stringify(value.value)}</div>
                <button onClick={() => setValue('bar')}>bar</button>
                <button onClick={() => setValue('baz')}>baz</button>
                <button onClick={() => remove()}>Remove</button>
            </div>
        );
    }
});

