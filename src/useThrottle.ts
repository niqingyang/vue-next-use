import {isRef, onUnmounted, unref} from 'vue';
import {sources, useEffect, useRef, useState} from './index';

const useThrottle = <T>(value: T, ms: number = 200) => {
    const [state, setState] = useState<T>(isRef(value) ? unref(value) as T : value);
    const timeout = useRef<ReturnType<typeof setTimeout>>();
    const nextValue = useRef(null) as any;
    const hasNextValue = useRef(0) as any;

    useEffect(() => {
        if (!timeout.value) {
            setState(value);
            const timeoutCallback = () => {
                if (hasNextValue.value) {
                    hasNextValue.value = false;
                    setState(nextValue.value);
                    timeout.value = setTimeout(timeoutCallback, ms);
                } else {
                    timeout.value = undefined;
                }
            };
            timeout.value = setTimeout(timeoutCallback, ms);
        } else {
            nextValue.value = unref(value);
            hasNextValue.value = true;
        }
    }, sources([value]));

    onUnmounted(() => {
        timeout.value && clearTimeout(timeout.value);
    });

    return state;
};

export default useThrottle;
