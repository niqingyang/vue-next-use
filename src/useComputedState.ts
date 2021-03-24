import {computed, ComputedRef, Ref, UnwrapRef, WritableComputedRef} from "vue";
import {ComputedGetter, ComputedSetter, WritableComputedOptions} from "@vue/reactivity";
import {useState} from "./index";
import {SetStateAction} from "./misc/types";
import {IHookStateInitAction} from "./misc/hookState";

export type ToComputedRef<T> = [T] extends [ComputedRef] ? T : ComputedRef<T>;

export default function useComputedState<T extends object>(value: T): [ToComputedRef<T>, (prevState: SetStateAction<T>) => void]
export default function useComputedState<T>(value: IHookStateInitAction<T>): [ToComputedRef<T>, (prevState: SetStateAction<T>) => void]
export default function useComputedState<T>(value: T): [ComputedRef<UnwrapRef<T>>, (prevState: SetStateAction<T>) => void]
export default function useComputedState<T = any>(): [ComputedRef<T | undefined>, (prevState: SetStateAction<T>) => void]

// for internal
export default function useComputedState(initialState?: unknown) {
    const [state, setState] = useState(initialState);

    return [
        computed(() => {
            return state.value;
        }),
        setState
    ];
}