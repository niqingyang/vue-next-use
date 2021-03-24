import {ref, unref, ComputedRef, Ref, isRef, computed} from 'vue';
import {useEffect, useRef} from "./index";

export type UseTimeoutFnReturn = [ComputedRef<boolean | null>, () => void, () => void];

// fn: Function - function that will be called;
// ms: number - delay in milliseconds;
// isReady: ComputedRef<boolean|null> - the current timeout state:
//      false - pending
//      true - called
//      null - cancelled
// cancel: ()=>void - cancel the timeout
// reset: ()=>void - reset the timeout
export default function useTimeoutFn(fn: Function | Ref<Function>, ms: number | Ref<number> = 0): UseTimeoutFnReturn {

    const timeout = ref<ReturnType<typeof setTimeout>>();
    const isReady = useRef<boolean | null>(false);

    const set = () => {
        isReady.value = false;
        timeout.value && clearTimeout(timeout.value);

        timeout.value = setTimeout(() => {
            isReady.value = true;
            unref(fn)();
        }, unref(ms));
    };

    const clear = () => {
        isReady.value = null;
        timeout.value && clearTimeout(timeout.value);
    };

    // set on mount, clear on unmount
    useEffect(() => {
        set();

        return clear;
    }, isRef(ms) ? ms : null);

    return [computed(() => {
        return isReady.value;
    }), clear, set];
}