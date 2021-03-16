import {ComputedRef, ref} from 'vue';
import {useReducer} from "./index";
import {Reducer} from './misc/types';

type Action = {
    type: string;
    payload?: any;
};

type CreateMethods<M, T> = (
    state: T
) => {
    [P in keyof M]: (payload?: any) => T;
};

type WrappedMethods<M> = {
    [P in keyof M]: (...payload: any) => void;
};

const useMethods = <M, T>(
    createMethods: CreateMethods<M, T>,
    initialState: T
): [ComputedRef<T>, WrappedMethods<M>] => {

    const reducer: Reducer<T, Action> = (reducerState: T, action: Action) => {
        return createMethods(reducerState)[action.type](...action.payload);
    };

    const [state, dispatch] = useReducer<Reducer<T, Action>>(reducer, initialState);

    const wrappedMethods: WrappedMethods<M> = (() => {
        const actionTypes = Object.keys(createMethods(initialState));

        return actionTypes.reduce((acc, type) => {
            acc[type] = (...payload) => dispatch({type, payload});
            return acc;
        }, {} as WrappedMethods<M>);
    })();

    return [state, wrappedMethods];
};

export default useMethods;
