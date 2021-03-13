import {ShowDemo, ShowDocs} from './util/index';
import {useLocation} from "../src/index";

export default {
    title: 'Sensors/useLocation',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useLocation.md'));

export const Demo = ShowDemo({
    setup() {
        const state = useLocation();


        const go = (page) => window.history.pushState({}, '', page);

        return () => (
            <div>
                <button onClick={() => go('page-1')}>Page 1</button>
                <button onClick={() => go('page-2')}>Page 2</button>
                <pre>
                  {JSON.stringify(state.value, null, 2)}
                </pre>
            </div>
        );
    },
});




