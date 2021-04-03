import useScrollbarWidth from "../src/useScrollbarWidth";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useScrollbarWidth',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useScrollbarWidth.md'));

export const Demo = ShowDemo({
    setup() {
        const sbw = useScrollbarWidth();

        return () => (
            <div>
                {sbw.value === undefined
                    ? `DOM is not ready yet, SBW detection delayed`
                    : `Browser's scrollbar width is ${sbw.value}px`}
            </div>
        );
    }
});





