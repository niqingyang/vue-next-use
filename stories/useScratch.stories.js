import {useScratch} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useScratch',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useScratch.md'));

export const Demo = ShowDemo({
    setup() {
        const [ref, state] = useScratch();

        const blockStyle = {
            position: 'relative',
            width: '400px',
            height: '400px',
            border: '1px solid tomato',
        };

        const preStyle = {
            pointerEvents: 'none',
            userSelect: 'none',
        };


        return () => {

            let {x = 0, y = 0, dx = 0, dy = 0} = state;
            if (dx < 0) [x, dx] = [x + dx, -dx];
            if (dy < 0) [y, dy] = [y + dy, -dy];

            const rectangleStyle = {
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: `${dx}px`,
                height: `${dy}px`,
                border: '1px solid tomato',
                pointerEvents: 'none',
                userSelect: 'none',
            };

            return (
                <div ref={ref} style={blockStyle}>
                    <pre style={preStyle}>{JSON.stringify(state, null, 4)}</pre>
                    {state.isScratching && <div style={rectangleStyle}/>}
                </div>
            )
        };
    }
});





