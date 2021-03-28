import {useBoolean} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useBoolean',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useBoolean.md'));

export const Demo = ShowDemo({
    setup() {
        const [on, toggle] = useBoolean(true);

        return () => (
            <div>
                <div>{on.value ? 'ON' : 'OFF'}</div>
                <button onClick={toggle}>Toggle</button>
                <button onClick={() => toggle(true)}>set ON</button>
                <button onClick={() => toggle(false)}>set OFF</button>
            </div>
        );
    }
});

