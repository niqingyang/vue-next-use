import {ref as useRef} from 'vue';
import {useClickAway, useReactive} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'UI/useClickAway',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useClickAway.md'));

export const Demo = ShowDemo({
    setup(props) {

        const [state, setState] = useReactive({color: 'red'})

        const ref = useRef(null);

        useClickAway(ref, () => {
            console.log('OUTSIDE CLICKED');
            setState({color: 'green'});
            setTimeout(() => {
                setState({color: 'red'});
            }, 300);
        });

        return () => (
            <div ref={ref} style={{
                width: '200px',
                height: '200px',
                background: state.color,
            }}/>
        );
    }
});

