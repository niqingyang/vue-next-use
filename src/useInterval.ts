import {Ref, ref as useRef, unref, watch, isRef} from 'vue';
import {useEffect} from './index';

const useInterval = (callback: Function | Ref<Function>, delay?: number | Ref<number>) => {
    const savedCallback = useRef<Function>(unref(callback));

    if (isRef(callback)) {
        watch(callback, () => {
            savedCallback.value = unref(callback);
        });
    }

    useEffect(() => {
        if (unref(delay) !== null) {
            const interval = setInterval(unref(savedCallback), unref(delay) || 0);
            return () => clearInterval(interval);
        }
        return undefined;
    }, isRef(delay) ? delay : undefined);
};

export default useInterval;