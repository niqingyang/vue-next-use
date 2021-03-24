import {computed, ComputedRef} from "vue";
import {useState} from "./index";
import {
    Dispatch,
    Reducer,
    ReducerAction,
    ReducerState,
    ReducerStateWithoutAction,
    DispatchWithoutAction,
    ReducerWithoutAction
} from "./misc/types";
import {resolveHookState} from './misc/hookState'

function useReducer<R extends (Reducer<any, any> | ReducerWithoutAction<any>)>(
    reducer: R,
    initialState: ReducerState<R>,
    initializer?: (arg: ReducerState<R>) => ReducerState<R>
): [ComputedRef<ReducerState<R>>, Dispatch<ReducerAction<R>> | DispatchWithoutAction];

function useReducer<R extends (Reducer<any, any> | ReducerWithoutAction<any>), I>(
    reducer: R,
    initialState: I | ReducerState<R>,
    initializer?: (arg: I | ReducerState<R>) => ReducerState<R>
): [ComputedRef<I>, Dispatch<ReducerAction<R>> | DispatchWithoutAction] {

    if (initializer) {
        initialState = initializer(resolveHookState(initialState));
    }

    const [state, setState] = useState(initialState);

    const dispatch: Dispatch<R> = (action) => {
        setState(prevState => reducer(prevState, action))
    };

    return [computed(() => {
        return state.value;
    }), dispatch];
};

export default useReducer;