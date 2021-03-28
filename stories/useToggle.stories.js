import {useToggle} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useToggle',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useToggle.md'));

export const Demo = ShowDemo({
    setup() {
        const [on, toggle] = useToggle(true);

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

