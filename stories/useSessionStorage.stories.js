import {useSessionStorage} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/useSessionStorage',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useSessionStorage.md'));

export const Demo = ShowDemo({
    setup() {
        const [value, setValue] = useSessionStorage('hello-key', 'foo');

        return () => (
            <div>
                <div>Value: {value.value}</div>
                <button onClick={() => setValue('bar')}>bar</button>
                <button onClick={() => setValue('baz')}>baz</button>
            </div>
        );
    }
});

