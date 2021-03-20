import {useCopyToClipboard, useState} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/useCopyToClipboard',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useCopyToClipboard.md'));

export const Demo = ShowDemo({
    setup() {

        const [text] = useState('');
        const [state, copyToClipboard] = useCopyToClipboard();

        return () => (
            <div>
                <input v-model={text.value}/>
                <button type="button" onClick={() => copyToClipboard(text.value)}>copy text</button>
                {state.error
                    ? <p>Unable to copy value: {state.error.message}</p>
                    : state.value && <p>Copied {state.value}</p>}
            </div>
        )
    }
});

