import {ref, Ref, isRef, UnwrapRef} from 'vue';
import {SetStateAction} from './misc/types';

export default function useState<T>(initialState: T | (() => T)): [Ref<T>, (prevState: SetStateAction<T>) => void] {
    const state = initialState instanceof Function ? ref((<() => T>initialState)()) : ref(initialState);

    const set = (value: SetStateAction<T>) => {
        if (value instanceof Function) {
            state.value = (<(prevState: T) => UnwrapRef<T>>value)(<T>state.value);
        } else {
            state.value = <UnwrapRef<T>>value;
        }
    };

    return [state as Ref<T>, set];
};