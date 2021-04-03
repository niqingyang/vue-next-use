import {useScrolling, useRef} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useScrolling',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useScrolling.md'));

export const Demo = ShowDemo({
    setup() {
        const scrollRef = useRef(null);
        const scrolling = useScrolling(scrollRef);

        return () => (
            <>
                <div>{scrolling.value ? 'Scrolling' : 'Not scrolling'}</div>
                <br/>
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
        );
    }
});





