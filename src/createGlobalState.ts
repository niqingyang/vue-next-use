import {useState, useEffect} from './index';
import {IHookStateInitAction, IHookStateSetAction, resolveHookState} from './misc/hookState';
import {Ref} from "vue";

export function createGlobalState<S = any>(
    initialState: IHookStateInitAction<S>
): () => [Ref<S>, (state: IHookStateSetAction<S>) => void];

export function createGlobalState<S = undefined>(): () => [
    Ref<S>,
    (state: IHookStateSetAction<S>) => void
];

export function createGlobalState<S>(initialState?: S) {
    const store: {
        state: S;
        setState: (state: IHookStateSetAction<S>) => void;
        setters: any[];
    } = {
        state: initialState instanceof Function ? initialState() : initialState,
        setState(nextState: IHookStateSetAction<S>) {
            store.state = resolveHookState(nextState, store.state);
            store.setters.forEach((setter) => setter(store.state));
        },
        setters: [],
    };

    return () => {
        const [globalState, stateSetter] = useState<S | undefined>(store.state);

        useEffect(() => () => {
            store.setters = store.setters.filter((setter) => setter !== stateSetter);
        });

        useEffect(() => {
            if (!store.setters.includes(stateSetter)) {
                store.setters.push(stateSetter);
            }
        });

        return [globalState, store.setState];
    };
}

export default createGlobalState;
