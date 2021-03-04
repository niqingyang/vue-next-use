import {computed, isRef, Ref, ref, unref} from 'vue';
import {useEffect} from './index';
import {clearHarmonicInterval, setHarmonicInterval} from 'set-harmonic-interval';

const useHarmonicIntervalFn = (fn: Function, delay: number | Ref<number> | null = 0) => {
    const latestCallback = ref<Function>(() => {
        // void
    });

    useEffect(() => {
        latestCallback.value = fn;
    });

    useEffect(() => {
        if (unref(delay) !== null) {
            const interval = setHarmonicInterval(() => latestCallback.value, unref(delay) || 0);
            return () => clearHarmonicInterval(interval);
        }
        return undefined;
    }, isRef(delay) ? delay : undefined);
};

export default useHarmonicIntervalFn;