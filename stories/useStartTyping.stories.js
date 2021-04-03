import {useStartTyping, useRef} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useStartTyping',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useStartTyping.md'));

export const Demo = ShowDemo({
    setup() {
        const input = useRef(null);
        useStartTyping(() => {
            if (input.value) {
                input.value.focus();
            }
        });

        return () => (
            <div>
                <p>Start typing, and below field will get focused.</p>
                <input ref={input}/>

                <br/>
                <hr/>

                <p>Try focusing below elements and see what happens.</p>
                <button>When button is focused, it will lose it.</button>
                <br/>
                <br/>
                <input/>
                <br/>
                <br/>
                <textarea>Editable textarea</textarea>
                <br/>
                <br/>
                <div contentEditable={true}>Editable DIV</div>
            </div>
        );
    }
});





