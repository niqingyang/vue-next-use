import {useSet} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useSet',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useSet.md'));

export const Demo = ShowDemo({
    setup() {
        const [set, {add, has, remove, reset, toggle}] = useSet(new Set(['hello']));

        return () => (
            <div>
                <button onClick={() => add(String(Date.now()))}>Add</button>
                <button onClick={() => reset()}>Reset</button>
                <button onClick={() => remove('hello')} disabled={!has('hello')}>
                    Remove 'hello'
                </button>
                <button onClick={() => toggle('hello')}>Toggle 'hello'</button>
                <pre>{JSON.stringify(Array.from(set.value), null, 2)}</pre>
            </div>
        );
    },
});




