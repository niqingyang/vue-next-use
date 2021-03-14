import {ShowDemo, ShowDocs} from './util/index';
import {useGeolocation} from "../src/index";

export default {
    title: 'Sensors/useGeolocation',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useGeolocation.md'));

export const Demo = ShowDemo({
    setup() {
        const state = useGeolocation();

        return () => (
            <pre>
              {JSON.stringify(state, null, 2)}
            </pre>
        );
    },
});




