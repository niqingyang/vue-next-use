import {reactive, toRaw, isReactive, unref} from 'vue';
import {resolveHookState} from "./misc/hookState";
import _ from 'lodash/object';

export default function useReactive<T extends Object>(initialState: T | (() => T) = {} as T): [T, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] {

    const state = isReactive(initialState) ? initialState : (initialState instanceof Function ? reactive((<() => T>initialState)()) : reactive(initialState));

    const setState = (patch: Object | Function) => {
        Object.assign(state, resolveHookState(patch, toRaw(state)))
    };

    return [state as T, setState as (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void];
}