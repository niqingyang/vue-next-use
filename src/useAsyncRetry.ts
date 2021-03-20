import {ref, Ref, UnwrapRef} from 'vue';
import useAsync, {AsyncState} from './useAsync';
import useState from "./useState";

export type AsyncStateRetry<T> = AsyncState<T> & {
    retry(): void;
};

export default function useAsyncRetry<T>(fn: () => Promise<T>, deps: any[] = []) : AsyncStateRetry<T> {
    const [attempt, setAttempt] = useState<number>(0);
    const state = useAsync(fn, [...deps, attempt]) as AsyncStateRetry<T>;

    state.retry = () => {
        if (state.loading) {
            if (process.env.NODE_ENV === 'development') {
                console.log(
                    'You are calling useAsyncRetry hook retry() method while loading in progress, this is a no-op.'
                );
            }
            return;
        }

        setAttempt((currentAttempt) => currentAttempt + 1);
    };

    return state;
};