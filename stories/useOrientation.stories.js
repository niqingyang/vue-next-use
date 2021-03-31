import {useOrientation} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useOrientation',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useOrientation.md'));

export const Demo = ShowDemo({
    setup() {
        const state = useOrientation();

        return () => (
            <pre>
              {JSON.stringify(state, null, 2)}
            </pre>
        );
    }
});





