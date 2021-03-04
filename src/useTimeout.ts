import {ComputedRef, Ref} from "vue";
import useTimeoutFn from './useTimeoutFn';

export type UseTimeoutReturn = [ComputedRef | null, () => void, () => void];

export default function useTimeout(ms: number | Ref<number> = 0): UseTimeoutReturn {
    return useTimeoutFn(() => {
        return;
    }, ms);
}