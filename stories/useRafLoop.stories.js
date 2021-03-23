import {ref} from "vue";
import {useRafLoop, useState, useRef} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/useRafLoop',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useRafLoop.md'));

export const Demo = ShowDemo({
    setup() {

        const [ticks, setTicks] = useState(0);
        const [lastCall, setLastCall] = useState(0);

        const [loopStop, loopStart, isActive] = useRafLoop((time) => {
            setTicks((ticks) => ticks + 1);
            setLastCall(time);
        });

        return () => (
            <div>
                <div>RAF triggered: {ticks.value} (times)</div>
                <div>Last high res timestamp: {lastCall.value}</div>
                <br/>
                <button
                    onClick={() => {
                        isActive.value ? loopStop() : loopStart();
                    }}>
                    {isActive.value ? 'STOP' : 'START'}
                </button>
            </div>
        );
    }
});


export const RollDemo = ShowDemo({
    props: {
        distance: Number,
        speed: Number,
    },
    setup(props) {

        const target = useRef(null);

        let start;
        let foward = true;
        const distance = props.distance;
        const speed = props.speed;

        const [loopStop, loopStart, isActive] = useRafLoop((timestamp) => {
            if (target.value) {
                if (start == undefined) {
                    start = timestamp
                }

                let elapsed = foward ? Math.min(speed * (timestamp - start), distance) : Math.max(distance - speed * (timestamp - start), 0);

                if (elapsed == 0) {
                    foward = true;
                    start = timestamp;
                } else if (elapsed == distance) {
                    foward = false;
                    start = timestamp;
                }

                // 这里使用`Math.min()`确保元素刚好停在200px的位置。
                target.value.style.transform = 'translateX(' + elapsed + 'px) rotate(' + elapsed + 'deg)';
            }
        });

        return () => (
            <div>
                <div ref={target} style="width: 50px; height: 50px; background-color: red; border-radius: 10px;"></div>
                <br/>
                <button
                    onClick={() => {
                        isActive.value ? loopStop() : loopStart();
                    }}>
                    {isActive.value ? 'STOP' : 'START'}
                </button>
            </div>
        );
    }
}, {
    distance: 300,
    speed: 0.2,
});

