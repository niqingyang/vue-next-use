import {Ref, unref, watch, isRef} from 'vue';
import {sources, useEffect, useRef} from './index';

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
    }, sources(delay));
};

export default useInterval;