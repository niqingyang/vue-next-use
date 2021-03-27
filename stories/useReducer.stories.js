import {ShowDemo, ShowDocs} from './util/index';
import {useReducer} from "../src/index";
import {Reducer} from "../src/misc/types";

export default {
    title: 'State/useReducer',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useReducer.md'));

export const Demo = ShowDemo({
    setup() {

        // https://zh-hans.reactjs.org/docs/hooks-reference.html#usereducer
        const initializer = (initialState) => {
            return isNaN(initialState) ? 0 : initialState;
        };

        const [state, dispatch] = useReducer((preState, action) => {
            switch (action) {
                case "increment":
                    return preState + 1;
                case "decrement":
                    return preState - 1;
            }
            return preState;
        }, 0, initializer);

        return () => (
            <div>
                <div style={{margin: "0 5px"}}>Count: {state.value}</div>
                <button onClick={() => dispatch('decrement')}>decrement</button>
                <button onClick={() => dispatch('increment')}>increment</button>
            </div>
        );
    },
});




