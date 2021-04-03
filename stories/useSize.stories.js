import {useSize} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useSize',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useSize.md'));

export const Demo = ShowDemo({
    setup() {
        const [Sized, state] = useSize({width: 100, height: 100});

        return () => {
            const {width, height} = state;
            return (
                <div style={{height: "100vh"}}>
                    <div style={{background: 'red', height: '50%'}}>
                        <Sized/>
                        Size me up! ({width}px * {height}px)
                    </div>
                    <div>width: {width}</div>
                    <div>height: {height}</div>
                </div>
            )
        };
    }
});





