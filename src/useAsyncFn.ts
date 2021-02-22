import {ref, Ref, UnwrapRef} from 'vue';
import useState from "./useState";
import useMountedState from "./useMountedState";
import {FunctionReturningPromise, PromiseType} from './misc/types';

export type AsyncState<T> =
    | {
    loading: boolean;
    error?: undefined;
    value?: undefined;
}
    | {
    loading: true;
    error?: Error | undefined;
    value?: T;
}
    | {
    loading: false;
    error: Error;
    value?: undefined;
}
    | {
    loading: false;
    error?: undefined;
    value: T;
};

type StateFromFunctionReturningPromise<T extends FunctionReturningPromise> = AsyncState<PromiseType<ReturnType<T>>>;

export type AsyncFnReturn<T extends FunctionReturningPromise = FunctionReturningPromise> = [
    Ref<UnwrapRef<StateFromFunctionReturningPromise<T>>>,
    T
];

export default function useAsyncFn<T extends FunctionReturningPromise>(
    fn: T,
    initialState: StateFromFunctionReturningPromise<T> = {loading: false}
): AsyncFnReturn<T> {
    const lastCallId = ref(0);
    const isMounted = useMountedState();
    const [state, set] = useState(initialState);

    const callback = (...args: Parameters<T>): ReturnType<T> => {
        const callId = ++lastCallId.value;

        state.value.loading = true

        return fn(...args).then(
            (value) => {
                isMounted() && callId === lastCallId.value && set({value, loading: false});

                return value;
            },
            (error) => {
                isMounted() && callId === lastCallId.value && set({error, loading: false});

                return error;
            }
        ) as ReturnType<T>;
    };

    return [state, (callback as unknown) as T];
}
