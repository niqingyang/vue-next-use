import {Ref, UnwrapRef} from 'vue';
import {SetStateAction, useState} from "./index";
import {IHookStateInitAction, resolveHookState} from "./misc/hookState";
import {ToRef} from "./useState";

export default function useSetState<T extends object>(value: T): [ToRef<T>, (prevState: SetStateAction<T>) => void]
export default function useSetState<T>(value: IHookStateInitAction<T>): [Ref<T>, (prevState: SetStateAction<T>) => void]
export default function useSetState<T>(value: T): [Ref<UnwrapRef<T>>, (prevState: SetStateAction<T>) => void]
export default function useSetState<T = any>(): [Ref<T | undefined>, (prevState: SetStateAction<T>) => void]

export default function useSetState(initialState?: unknown) {
    const [state, set] = useState(initialState);
    const setState = (patch: Object | Function) => {
        set((prevState) =>
            Object.assign({}, prevState, resolveHookState(patch, prevState))
        );
    };

    return [state, setState];
};