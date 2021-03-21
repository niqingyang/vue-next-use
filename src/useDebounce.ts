import useTimeoutFn from './useTimeoutFn';
import {ComputedRef} from "vue";
import {sources} from "./misc/util";
import {useEffect} from "./index";

export type UseDebounceReturn = [ComputedRef<boolean> | null, () => void];

export default function useDebounce(
    fn: Function,
    ms: number = 0,
    deps: any[] = []
): UseDebounceReturn {
    const [isReady, cancel, reset] = useTimeoutFn(fn, ms);

    useEffect(reset, sources(deps));

    return [isReady, cancel];
}
