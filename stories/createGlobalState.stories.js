import {createGlobalState} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/createGlobalState',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/createGlobalState.md'));

const useGlobalValue = createGlobalState(0);

const CompA = {
    setup() {
        const [value, setValue] = useGlobalValue();

        return () => (
            <button onClick={() => setValue(c => c + 1)}>+</button>
        );
    }
};

const CompB = {
    setup() {
        const [value, setValue] = useGlobalValue();

        return () => (
            <button onClick={() => setValue(value.value - 1)}>-</button>
        );
    }
};

export const Demo = ShowDemo({
    setup() {
        const [value] = useGlobalValue();
        return () => (
            <div>
                <p>{value.value}</p>
                <CompA/>
                <CompB/>
            </div>
        );
    }
});

