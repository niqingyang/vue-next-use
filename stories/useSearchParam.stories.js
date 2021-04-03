import {useSearchParam} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useSearchParam',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useSearchParam.md'));

export const Demo = ShowDemo({
    setup() {
        const edit = useSearchParam('edit');

        return () => (
            <div>
                <div>edit: {edit.value || '🤷‍♂️'}</div>
                <div>
                    <button onClick={() => history.pushState({}, '', location.pathname + '?edit=123')}>Edit post 123
                        (?edit=123)
                    </button>
                </div>
                <div>
                    <button onClick={() => history.pushState({}, '', location.pathname + '?edit=999')}>Edit post 999
                        (?edit=999)
                    </button>
                </div>
                <div>
                    <button onClick={() => history.pushState({}, '', location.pathname)}>Close modal</button>
                </div>
            </div>
        );
    }
});





