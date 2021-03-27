import {computed, ComputedRef, Ref} from 'vue';
import {SetStateAction, useSetState} from "./index";
import {ToComputedRef} from "./useComputedState";
import {IHookStateInitAction} from "./misc/hookState";

export default function useComputedSetState<T extends object>(value: T): [ToComputedRef<T>, (prevState: SetStateAction<T>) => void]
export default function useComputedSetState<T>(value: IHookStateInitAction<T>): [ComputedRef<T>, (prevState: SetStateAction<T>) => void]
export default function useComputedSetState<T>(value: T): [ComputedRef<T>, (prevState: SetStateAction<T>) => void]
export default function useComputedSetState<T = any>(): [ComputedRef<T | undefined>, (prevState: SetStateAction<T>) => void]

export default function useComputedSetState(initialState?: unknown) {
    const [state, setState] = useSetState(initialState);

    return [computed(() => {
        return state.value;
    }), setState];
};