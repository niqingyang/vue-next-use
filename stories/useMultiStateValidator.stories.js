import {useMultiStateValidator, useState} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useMultiStateValidator',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useMultiStateValidator.md'));

const DemoStateValidator = (s) => [s.every((num) => !(num % 2))];

export const Demo = ShowDemo({
    setup() {

        const [state1, setState1] = useState(1);
        const [state2, setState2] = useState(1);
        const [state3, setState3] = useState(1);
        const [isValid] = useMultiStateValidator([state1, state2, state3], DemoStateValidator, [false]);

        return () => (
            <div>
                <div>Below fields will be valid if all of them is even</div>
                <br/>
                <input
                    type="number"
                    min="1"
                    max="10"
                    v-model={state1.value}
                />
                <input
                    type="number"
                    min="1"
                    max="10"
                    v-model={state2.value}
                />
                <input
                    type="number"
                    min="1"
                    max="10"
                    v-model={state3.value}
                />
                {isValid[0] !== undefined && (
                    <span style={{marginLeft: 24}}>{isValid[0] ? 'Valid!' : 'Invalid'}</span>
                )}
            </div>
        );
    }
});

