import {useSlider, useRef} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'UI/useSlider',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useSlider.md'));

export const Horizontal = ShowDemo({
    setup(props) {

        const ref = useRef(null);
        const state = useSlider(ref, {
            onScrubStop: (value) => {
                console.log('onScrubStop', value);
            },
        });

        return () => (
            <div>
                <div ref={ref} style={{position: 'relative', background: 'yellow', padding: '4px'}}>
                    <p style={{margin: 0, textAlign: 'center'}}>Slide me</p>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 100 * state.value + '%',
                            transform: 'scale(2)',
                        }}>
                        {state.isSliding ? '🏂' : '🎿'}
                    </div>
                </div>
                <pre>{JSON.stringify(state, null, 2)}</pre>
            </div>
        );
    }
});


export const Vertical = ShowDemo({
    setup(props) {

        const ref = useRef(null);
        const state = useSlider(ref, {vertical: true});

        return () => (
            <div>
                <div
                    ref={ref}
                    style={{position: 'relative', background: 'yellow', padding: '4px', width: '30px', height: '400px'}}>
                    <p style={{margin: '0', textAlign: 'center'}}>Slide me</p>
                    <div
                        style={{
                            position: 'absolute',
                            left: '0',
                            top: 100 * state.value + '%',
                            transform: 'scale(2)',
                        }}>
                        {state.isSliding ? '🏂' : '🎿'}
                    </div>
                </div>
                <pre>{JSON.stringify(state, null, 2)}</pre>
            </div>
        );
    }
});