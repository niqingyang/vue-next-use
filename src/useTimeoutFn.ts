import {computed, ComputedRef, Ref, ref as useRef, unref, isRef} from 'vue';
import useEffect from "./useEffect";

export type UseTimeoutFnReturn = [ComputedRef | null, () => void, () => void];

// fn: Function - function that will be called;
// ms: number - delay in milliseconds;
// isReady: boolean|null - function returning current timeout state:
//      false - pending
//      true - called
//      null - cancelled
// cancel: ()=>void - cancel the timeout
// reset: ()=>void - reset the timeout
export default function useTimeoutFn(fn: Function | Ref<Function>, ms: number | Ref<number> = 0): UseTimeoutFnReturn {
    const ready = useRef<boolean | null>(false);
    const timeout = useRef<ReturnType<typeof setTimeout>>();

    const isReady = computed(() => ready.value);

    const set = () => {
        ready.value = false;
        timeout.value && clearTimeout(timeout.value);

        timeout.value = setTimeout(() => {
            ready.value = true;
            unref(fn)();
        }, unref(ms));
    };

    const clear = () => {
        ready.value = null;
        timeout.value && clearTimeout(timeout.value);
    };

    // set on mount, clear on unmount
    useEffect(() => {
        set();

        return clear;
    }, isRef(ms) ? ms : null);

    return [isReady, clear, set];
}