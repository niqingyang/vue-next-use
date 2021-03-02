import {ref, Ref, UnwrapRef} from 'vue';
import {SetStateAction} from './misc/types';

export default function useState<T>(initialState: T | (() => T)): [Ref<T>, (prevState: SetStateAction<T>) => void] {
    const state = typeof initialState == 'function' ? ref((<() => T>initialState)()) : ref(initialState);

    const set = (value: SetStateAction<T>) => {
        if (typeof value == "function") {
            state.value = (<(prevState: T) => UnwrapRef<T>>value)(<T>state.value);
        } else {
            state.value = <UnwrapRef<T>>value;
        }
    };

    return [state as Ref<T>, set];
};