import {reactive, toRaw, isReactive} from 'vue';

export default function useReactive<T extends Object>(initialState: T | (() => T) = {} as T): [T, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] {

    const state = isReactive(initialState) ? initialState : (initialState instanceof Function ? reactive((<() => T>initialState)()) : reactive(initialState));

    const setState = (patch: Object | Function) => {
        Object.assign(state, patch instanceof Function ? patch(toRaw(state)) : patch)
    };

    return [state as T, setState as (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void];
}