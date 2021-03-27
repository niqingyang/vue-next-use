import {useTimeoutFn, useState, useRef, useCss} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Animation/useTimeoutFn',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useTimeoutFn.md'));

export const Demo = ShowDemo({
    setup() {
        const [state, setState] = useState('Not called yet');

        function fn() {
            setState(`called at ${Date.now()}`);
        }

        const [isReady, cancel, reset] = useTimeoutFn(fn, 5000);
        const cancelButtonClick = () => {
            if (isReady.value === false) {
                cancel();
                setState(`cancelled`);
            } else {
                reset();
                setState('Not called yet');
            }
        };

        return () => (
            <div>
                <div>{isReady.value !== null ? 'Function will be called in 5 seconds' : 'Timer cancelled'}</div>
                <button onClick={cancelButtonClick}>
                    {' '}
                    {isReady.value === false ? 'cancel' : 'restart'} timeout
                </button>
                <br/>
                <div>
                    Function state: {isReady.value === false ? 'Pending' : isReady.value ? 'Called' : 'Cancelled'}
                </div>
                <div>{state.value}</div>
            </div>
        );
    }
});

