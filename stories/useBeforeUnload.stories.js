import {ShowDemo, ShowDocs} from './util/index';
import {useBeforeUnload, useToggle} from "../src/index";

export default {
    title: 'SideEffects/useBeforeUnload',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useBeforeUnload.md'));

export const DemoBool = ShowDemo({
    setup() {
        const [dirty, toggleDirty] = useToggle(false);
        useBeforeUnload(dirty, 'You have unsaved changes, are you sure?');

        return () => (
            <div>
                {dirty.value && <p>Try to reload or close tab</p>}
                <button onClick={() => toggleDirty()}>{dirty.value ? 'Disable' : 'Enable'}</button>
            </div>
        );
    }
});


export const DemoFunc = ShowDemo({
    setup() {
        const [dirty, toggleDirty] = useToggle(false);
        const dirtyFn = () => {
            return dirty.value;
        };
        useBeforeUnload(dirtyFn, 'You have unsaved changes, are you sure?');

        return () => (
            <div>
                {dirty.value && <p>Try to reload or close tab</p>}
                <button onClick={() => toggleDirty()}>{dirty.value ? 'Disable' : 'Enable'}</button>
            </div>
        );
    }
});




