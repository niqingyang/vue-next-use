import {ShowDemo, ShowDocs} from './util/index';
import {ref} from "vue";
import {useMediatedState} from "../src/index";

export default {
    title: 'State/useMediatedState',
    argTypes: {},
};

// export const Docs = ShowDocs(require('../docs/useIdle.md'));

export const Demo = ShowDemo({
    setup() {
        const inputMediator = (s) => s.replace(/[\s]+/g, ' ');
        const [state] = useMediatedState(inputMediator, '');

        return () => (
            <div>
                <div>You will not be able to enter more than one space</div>
                <input
                    type="text"
                    min="0"
                    max="10"
                    v-model={state.value}
                />
            </div>
        );
    },
});




