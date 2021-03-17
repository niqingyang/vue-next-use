import {useStateValidator, useState} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';
import {toRefs} from 'vue';

export default {
    title: 'State/useStateValidator',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useStateValidator.md'));

export const Demo = ShowDemo({
    setup(props) {

        const DemoStateValidator = (s) => [s === '' ? undefined : (s * 1) % 2 === 0] as [boolean | undefined];

        const [state] = useState<number>(0);
        const [validateState] = useStateValidator(state, DemoStateValidator);
        const [isValid] = toRefs(validateState);

        return () => (
            <div>
                <div>Below field is valid only if number is even</div>
                <input
                    type="number"
                    min="0"
                    max="10"
                    v-model={state.value}
                />
                &nbsp;{isValid.value !== undefined && <span>{isValid.value ? 'Valid!' : 'Invalid'}</span>}
            </div>
        );
    }
});

