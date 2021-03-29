import {useMediaDevices} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useMediaDevices',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useMediaDevices.md'));

export const Demo = ShowDemo({
    setup() {
        const state = useMediaDevices();

        return () => (
            <pre>
              {JSON.stringify(state, null, 2)}
            </pre>
        );
    }
});





