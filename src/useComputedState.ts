import {computed, ComputedRef} from "vue";
import {useState} from "./index";
import {SetStateAction} from "./misc/types";

export default function useComputedState<T>(initialState: T | (() => T)): [ComputedRef<T>, (prevState: SetStateAction<T>) => void] {
    const [state, setState] = useState(initialState);

    return [
        computed(() => {
            return state.value;
        }),
        setState
    ];
}