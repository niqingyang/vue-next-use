import {useNetworkState} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useNetworkState',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useNetworkState.md'));

export const Demo = ShowDemo({
    setup() {
        const state = useNetworkState();

        return () => (
            <pre>
              {JSON.stringify(state, null, 2)}
            </pre>
        );
    }
});





