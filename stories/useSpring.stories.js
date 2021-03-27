import {computed, ref, watch} from "vue";
import {useRaf, useRafLoop, useState, useRef, useCss} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';
import useSpring from '../src/useSpring';

export default {
    title: 'Animation/useSpring',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useSpring.md'));

export const Demo = ShowDemo({
    setup() {
        const [target, setTarget] = useState(50);
        const value = useSpring(target);

        return () => (
            <div>
                {value.value}
                <br />
                <button onClick={() => setTarget(0)}>Set 0</button>
                <button onClick={() => setTarget(100)}>Set 100</button>
            </div>
        );
    }
});


export const EmojiDemo = ShowDemo({
    props: {
        tension: {
            type: Number,
            default: 50
        },
        friction: {
            type: Number,
            default: 3
        }
    },
    setup(props) {

        const [target, setTarget] = useState(150);
        const value = useSpring(target, props.tension, props.friction);

        const className = useCss(computed(() => {
            return {
                position: 'absolute',
                left: '20px',
                top: value.value + 'px',
                fontSize: '32px'
            }
        }));

        const emoji = computed(()=>{
            return value.value == target.value ? '😄' : '😵';
        })

        return () => (
            <div>
                <button onClick={() => setTarget(150)}>Set 150</button>
                <button onClick={() => setTarget(300)}>Set 300</button>
                <div class={className}>{emoji.value}</div>
            </div>
        );
    }
}, {
    tension: 50,
    friction: 3,
});

