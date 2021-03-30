import {useMouseWheel} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useMouseWheel',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useMouseWheel.md'));

export const Demo = ShowDemo({
    setup() {
        const mouseWheelScrolled = useMouseWheel();

        return () => (
            <>
                <h3>delta Y Scrolled: {mouseWheelScrolled.value}</h3>
            </>
        );
    }
});





