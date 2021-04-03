import {useQueue} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useQueue',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useQueue.md'));

export const Demo = ShowDemo({
    setup() {
        const {add, remove, first, last, size} = useQueue();
        return () => (
            <div>
                <ul>
                    <li>first: {first.value}</li>
                    <li>last: {last.value}</li>
                    <li>size: {size.value}</li>
                </ul>
                <button onClick={() => add((last.value || 0) + 1)}>Add</button>
                <button onClick={() => remove()}>Remove</button>
            </div>
        );
    }
});

