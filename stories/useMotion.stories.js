import {useMotion, usePermission} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useMotion',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useMotion.md'));

export const Demo = ShowDemo({
    setup() {
        const [state, requestPermission] = useMotion();

        return () => (
            <div>
                <button onClick={requestPermission}>Get Permision</button>
                <pre>
                  {JSON.stringify(state, null, 2)}
                </pre>
            </div>
        );
    }
});





