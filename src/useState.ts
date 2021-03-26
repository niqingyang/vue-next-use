import {ref, Ref, unref, UnwrapRef} from 'vue';
import {SetStateAction} from './misc/types';
import {resolveHookState, IHookStateInitAction} from './misc/hookState';

export type ToRef<T> = [T] extends [Ref] ? T : Ref<UnwrapRef<T>>

export default function useState<T extends object>(value: T): [ToRef<T>, (prevState: SetStateAction<T>) => void]
export default function useState<T>(value: IHookStateInitAction<T>): [Ref<T>, (prevState: SetStateAction<T>) => void]
export default function useState<T>(value: T): [Ref<UnwrapRef<T>>, (prevState: SetStateAction<T>) => void]
export default function useState<T = any>(): [Ref<T | undefined>, (prevState: SetStateAction<T>) => void]

export default function useState(initialState?: unknown) {

    const state = ref(resolveHookState(initialState));

    const set = (value) => {
        if (value instanceof Function) {
            state.value = value(state.value);
        } else {
            state.value = unref(value);
        }
    };

    return [state, set];
};