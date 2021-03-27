import {computed, ref, watch} from "vue";
import {useRaf, useRafLoop, useState, useRef, useCss} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Animation/useRaf',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useRaf.md'));

export const Demo = ShowDemo({
    setup() {

        const frames = useRaf(5000, 500);

        return () => (
            <div>Elapsed: {frames.value}</div>
        );
    }
});


export const ProgressDemo = ShowDemo({
    setup() {

        const frames = useRaf(5000, 500);

        const progressClassName = useCss({
            height: '25px',
            background: '#262626',
            padding: '5px',
            overflow: 'visible',
            borderRadius: '20px',
            borderTop: '1px solid #000',
            borderBottom: '1px solid #7992a8',
            marginTop: '20px',
            width: '50%'
        });

        const progressBarClassName = useCss(computed(() => {
            return {
                borderRadius: '20px',
                position: 'relative',
                float: 'left',
                height: '100%',
                fontSize: '12px',
                lineHeight: '25px',
                color: '#fff',
                textAlign: 'center',
                boxShadow: 'inset 0 -1px 0 rgb(0 0 0 / 15%)',
                backgroundColor: frames.value < 0.5 ? '#ffc107' : (frames.value < 1 ? '#03a9f4' : '#4caf50'),
                width: frames.value * 100 + '%',
            }
        }));

        const progress = computed(() => {
            return Math.round(frames.value * 100, 2) + '%';
        });

        return () => (
            <div>
                <div class={progressClassName}>
                    <div class={progressBarClassName}>{progress.value}</div>
                </div>
            </div>
        );
    }
});

