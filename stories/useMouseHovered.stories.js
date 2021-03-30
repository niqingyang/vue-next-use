import {useMouseHovered, useRef} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useMouseHovered',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useMouse.md'));

export const Demo = ShowDemo({
    props: {
        whenHovered: {
            type: Boolean,
            default: false
        },
        bound: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const ref = useRef(null);
        const state = useMouseHovered(ref, {
            whenHovered: props.whenHovered,
            bound: props.bound,
        });

        return () => {

            const {elX, elY} = state.value;

            return (
                <>
                    <pre>{JSON.stringify(state.value, null, 2)}</pre>
                    <br/>
                    <br/>
                    <div
                        ref={ref}
                        style={{
                            position: 'relative',
                            width: '400px',
                            height: '400px',
                            backgroundColor: 'whitesmoke',
                        }}>
                    <span
                        style={{
                            position: 'absolute',
                            left: `${elX}px`,
                            top: `${elY}px`,
                            pointerEvents: 'none',
                            transform: 'scale(4)',
                        }}>
                      🐭
                    </span>
                    </div>
                </>
            );
        }
    }
}, {
    whenHovered: false,
    bound: false,
});





