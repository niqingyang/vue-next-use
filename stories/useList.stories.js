import {useList} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useList',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useList.md'));

export const Demo = ShowDemo({
    setup() {

        const [list, {
            set,
            push,
            updateAt,
            insertAt,
            update,
            updateFirst,
            upsert,
            sort,
            filter,
            removeAt,
            clear,
            reset
        }] = useList([1, 2, 3, 4, 5]);

        return () => (
            <div>
                <button onClick={() => set([1, 2, 3])}>Set to [1, 2, 3]</button>
                <button onClick={() => push(Date.now())}>Push timestamp</button>
                <button onClick={() => updateAt(1, Date.now())}>Update value at index 1</button>
                <button onClick={() => removeAt(1)}>Remove element at index 1</button>
                <button onClick={() => filter(item => item % 2 === 0)}>Filter even values</button>
                <button onClick={() => sort((a, b) => a - b)}>Sort ascending</button>
                <button onClick={() => sort((a, b) => b - a)}>Sort descending</button>
                <button onClick={clear}>Clear</button>
                <button onClick={reset}>Reset</button>
                <pre>{JSON.stringify(list.value, null, 2)}</pre>
            </div>
        );
    }
});

export const UpsertDemo = ShowDemo({
    setup() {

        const upsertPredicate = (a, b) => a.id === b.id;
        const upsertInitialItems = [
            {id: '1', text: 'Sample'},
            {id: '2', text: 'Example'},
        ];

        const [list, {upsert, reset, removeAt}] = useList(upsertInitialItems);

        return () => (
            <div style={{display: 'inline-flex', flexDirection: 'column'}}>
                {list.value.map((item, index) => (
                    <div key={item.id}>
                        <input
                            value={item.text}
                            onChange={(e) => upsert(upsertPredicate, {...item, text: e.target?.value})}
                        />
                        <button onClick={() => removeAt(index)}>Remove</button>
                    </div>
                ))}
                <button
                    onClick={() => upsert(upsertPredicate, {id: (list.value.length + 1).toString(), text: ''})}>
                    Add item
                </button>
                <button onClick={() => reset()}>Reset</button>
            </div>
        )
    }
});

