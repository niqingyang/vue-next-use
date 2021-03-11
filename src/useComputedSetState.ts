import {computed, ComputedRef} from 'vue';
import {useSetState} from "./index";

const useComputedSetState = <T extends object>(
    initialState: T = {} as T
): [ComputedRef<T>, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] => {
    const [state, setState] = useSetState<T>(initialState);

    return [computed(() => {
        return state.value;
    }), setState];
};

export default useSetState;