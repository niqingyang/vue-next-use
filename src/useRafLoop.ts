import {useEffect, useRef} from './index';
import {computed, ComputedRef} from "vue";

export type RafLoopReturns = [() => void, () => void, ComputedRef<boolean>];

// https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame
export default function useRafLoop(
    callback: FrameRequestCallback,
    initiallyActive = true
): RafLoopReturns {
    const raf = useRef<number | null>(null);
    const rafActivity = useRef<boolean>(false);
    const rafCallback = useRef(callback);
    rafCallback.value = callback;

    const step = (time: number) => {
        if (rafActivity.value) {
            rafCallback.value(time);
            raf.value = requestAnimationFrame(step);
        }
    };

    const stop = () => {
        if (rafActivity.value) {
            rafActivity.value = false;
            raf.value && cancelAnimationFrame(raf.value);
        }
    };

    const start = () => {
        if (!rafActivity.value) {
            rafActivity.value = true;
            raf.value = requestAnimationFrame(step);
        }
    };

    const isActive = computed(() => {
        return rafActivity.value
    });

    useEffect(() => {
        if (initiallyActive) {
            start();
        }
        return stop;
    });

    return [stop, start, isActive];
}
