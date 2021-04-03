import {useWindowScroll} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useWindowScroll',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useWindowScroll.md'));

export const Demo = ShowDemo({
    setup() {
        const state = useWindowScroll();

        return () => {
            const {x, y} = state;
            return (
                <div
                    style={{
                        width: '200vw',
                        height: '200vh',
                    }}>
                    <div
                        style={{
                            position: 'fixed',
                            left: 0,
                            right: 0,
                        }}>
                        <div>x: {x}</div>
                        <div>y: {y}</div>
                    </div>
                </div>
            )
        };
    }
});





