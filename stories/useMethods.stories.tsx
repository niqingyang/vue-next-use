import {useMethods} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useMethods',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useMethods.md'));

export const Demo = ShowDemo({
    setup(props) {
        const initialState = {
            count: 0,
        };

        function createMethods(state) {
            return {
                reset() {
                    return initialState;
                },
                increment() {
                    return {...state, count: state.count + 1};
                },
                decrement() {
                    return {...state, count: state.count - 1};
                },
            };
        }

        const [state, methods] = useMethods(createMethods, initialState);

        return () => (
            <>
                <p>Count: {state.value.count}</p>
                <button onClick={methods.decrement}>-</button>
                <button onClick={methods.increment}>+</button>
                <button onClick={methods.reset}>reset</button>
            </>
        );
    }
});

