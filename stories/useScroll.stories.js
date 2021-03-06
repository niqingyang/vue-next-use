import {useScroll, useRef} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useScroll',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useScroll.md'));

export const Demo = ShowDemo({
    setup() {
        const scrollRef = useRef(null);
        const state = useScroll(scrollRef);

        return () => {

            const {x, y} = state;

            return (
                <>
                    <div>x: {x}</div>
                    <div>y: {y}</div>
                    <div
                        ref={scrollRef}
                        style={{
                            width: '400px',
                            height: '400px',
                            backgroundColor: 'whitesmoke',
                            overflow: 'scroll',
                        }}>
                        <div style={{width: '2000px', height: '2000px'}}>Scroll me</div>
                    </div>
                </>
            )
        };
    }
});





