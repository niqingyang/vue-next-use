import {onUnmounted} from 'vue';
import {useEffect, useRef, useState} from './index';

const useThrottleFn = <T, U extends any[]>(fn: (...args: U) => T, ms: number = 200, args: U) => {
    const [state, setState] = useState<T | null>(null);
    const timeout = useRef<ReturnType<typeof setTimeout>>();
    const nextArgs = useRef<U>();

    useEffect(() => {
        if (!timeout.value) {
            setState(fn(...args));
            const timeoutCallback = () => {
                if (nextArgs.value) {
                    setState(fn(...nextArgs.value));
                    nextArgs.value = undefined;
                    timeout.value = setTimeout(timeoutCallback, ms);
                } else {
                    timeout.value = undefined;
                }
            };
            timeout.value = setTimeout(timeoutCallback, ms);
        } else {
            nextArgs.value = args;
        }
    }, args);

    onUnmounted(() => {
        timeout.value && clearTimeout(timeout.value);
    });

    return state;
};

export default useThrottleFn;
