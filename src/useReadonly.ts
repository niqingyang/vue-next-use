import {reactive, toRaw, readonly, isReactive} from 'vue';
import {useReactive} from "./index";

export default function useReadonly<T extends Object>(initialState: T | (() => T) = {} as T): [Readonly<T>, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] {

    const [state, setState] = useReactive(initialState);

    return [readonly(state) as Readonly<T>, setState as (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void];
}