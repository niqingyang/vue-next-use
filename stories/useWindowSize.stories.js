import {useWindowSize} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useWindowSize',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useWindowSize.md'));

export const Demo = ShowDemo({
    setup() {
        const state = useWindowSize();

        return () => {
            const {width, height} = state;
            return (
                <div>
                    <div>width: {width}</div>
                    <div>height: {height}</div>
                </div>
            )
        };
    }
});





