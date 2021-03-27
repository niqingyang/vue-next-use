import {ref, Ref, unref, UnwrapRef} from 'vue';
import {SetStateAction, useState} from "./index";
import {IHookStateInitAction, resolveHookState} from "./misc/hookState";
import {ToRef} from "./useState";

export type SetPatchStateAction<T> = (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void

export default function useSetState<T extends object>(value: T): [ToRef<T>, SetPatchStateAction<T>]
export default function useSetState<T>(value: IHookStateInitAction<T>): [Ref<T>, SetPatchStateAction<T>]
export default function useSetState<T>(value: T): [ToRef<T>, SetPatchStateAction<T>]
export default function useSetState<T = any>(): [Ref<T | undefined>, SetPatchStateAction<T>]

export default function useSetState(initialState?: unknown) {

    const state = ref(resolveHookState(initialState));

    const setState = (patch) => {
        state.value = Object.assign({}, state.value, resolveHookState(patch, state.value))
    };

    return [state, setState];
};

declare type A = {
    name: string,
    id: string
}

const [state, setState] = useSetState<A>({
    name: '123',
    id: '123'
});

setState({name:'123'});
setState(() => ({name:'123'}));