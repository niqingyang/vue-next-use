import {computed, ComputedRef, Ref, unref} from 'vue';
import {sources, useEffect, useState} from './index';

export default function useRaf(ms: number | Ref<number> = 1e12, delay: number | Ref<number> = 0): ComputedRef<number> {
    const [elapsed, set] = useState<number>(0);

    useEffect(() => {
        let raf;
        let timerStop;
        let start;

        const onFrame = () => {
            const time = Math.min(1, (Date.now() - start) / unref(ms));
            set(time);
            loop();
        };
        const loop = () => {
            raf = requestAnimationFrame(onFrame);
        };
        const onStart = () => {
            timerStop = setTimeout(() => {
                cancelAnimationFrame(raf);
                set(1);
            }, unref(ms));
            start = Date.now();
            loop();
        };
        const timerDelay = setTimeout(onStart, unref(delay));

        return () => {
            clearTimeout(timerStop);
            clearTimeout(timerDelay);
            cancelAnimationFrame(raf);
        };
    }, sources([ms, delay]));

    return computed(() => {
        return elapsed.value;
    });
};
