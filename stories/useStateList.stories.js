import {useStateList, useRef} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useStateList',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useStateList.md'));

export const Demo = ShowDemo({
    setup(props) {

        const stateSet = ['first', 'second', 'third', 'fourth', 'fifth'];

        const {state, prev, next, setStateAt, setState, currentIndex} = useStateList(stateSet);
        const indexInput = useRef(null);
        const stateInput = useRef(null);

        return () => (
            <div>
              <pre>
                {state.value} [index: {currentIndex}]
              </pre>
                <button onClick={() => prev()}>prev</button>
                <br/>
                <button onClick={() => next()}>next</button>
                <br/>
                <input type="text" ref={indexInput} style={{width: 120}}/>
                <button onClick={() => setStateAt(indexInput.value.value)}>set state by
                    index
                </button>
                <br/>
                <input type="text" ref={stateInput} style={{width: 120}}/>
                <button onClick={() => setState(stateInput.value.value)}> set state by value</button>
            </div>
        );
    }
});

