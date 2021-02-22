import {watch} from 'vue';
import useAsyncFn from './useAsyncFn';
import {FunctionReturningPromise} from './misc/types';

export type {AsyncState, AsyncFnReturn} from './useAsyncFn';

export default function useAsync<T extends FunctionReturningPromise>(
    fn: T,
    deps?: any[]
) {
    const [state, callback] = useAsyncFn(fn, {
        loading: true,
    });

    if (deps) {
        watch(deps, () => {
            callback();
        });
    } else {
        callback();
    }

    return state;
}