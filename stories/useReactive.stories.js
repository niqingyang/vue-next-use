import {useReactive} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useReactive',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useReactive.md'));

export const Demo = ShowDemo({
    setup(props) {

        const [state, setState] = useReactive();

        return () => (
            <div>
                <pre>{JSON.stringify(state, null, 2)}</pre>
                <button onClick={() => setState({hello: 'world'})}>hello</button>
                <button onClick={() => setState({foo: 'bar'})}>foo</button>
                <button
                    onClick={() => {
                        setState((prevState) => ({
                            counter: {
                                value: (prevState.counter?.value || 0) + 1,
                            }
                        }))
                    }}
                >
                    count
                </button>
            </div>
        )
    }
});

