import {ShowDemo, ShowDocs} from './util/index';
import {useMap} from "../src/index";

export default {
    title: 'State/useMap',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useMap.md'));

export const Demo = ShowDemo({
    setup() {
        const [map, {set, setAll, remove, reset}] = useMap({
            hello: 'there',
        });

        return () => (
            <div>
                <button onClick={() => set(String(Date.now()), new Date().toJSON())}>
                    Add
                </button>
                <button onClick={() => reset()}>
                    Reset
                </button>
                <button onClick={() => setAll({hello: 'new', data: 'data'})}>
                    Set new data
                </button>
                <button onClick={() => remove('hello')} disabled={!map.value.hello}>
                    Remove 'hello'
                </button>
                <pre>{JSON.stringify(map.value, null, 2)}</pre>
            </div>
        );
    },
});




