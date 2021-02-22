import {IHookStateInitAction, IHookStateSetAction, resolveHookState} from './misc/hookState';
import {useState} from "./index";

// 这个 hook 对于 vue 来说应该意义不大，但还是拿过来吧
export default function useGetSet<S>(
    initialState: IHookStateInitAction<S>
): [get: () => S, set: (value: IHookStateSetAction<S>) => void] {
    const [state, set] = useState(resolveHookState(initialState));

    return [
        () => state.value as S,
        (newState: IHookStateSetAction<S>) => {
            state.value = resolveHookState(newState, state.value);
        },
    ];
}