import {UnwrapRef, computed, ComputedRef} from 'vue';
import {useState} from './index';

export interface QueueMethods<T> {
    add: (item: T) => void;
    remove: () => T | undefined;
    first: ComputedRef<UnwrapRef<T>>;
    last: ComputedRef<UnwrapRef<T>>;
    size: ComputedRef<UnwrapRef<number>>;
}

// 队列
const useQueue = <T>(initialValue: T[] = []): QueueMethods<T> => {
    const [state, set] = useState(initialValue);

    return {
        add: (value) => {
            set((queue) => [...queue, value]);
        },
        remove: () => {
            let result: T | undefined = undefined;
            set(([first, ...rest]) => {
                result = first;
                return rest;
            });
            return result;
        },
        first: computed(() => {
            return state.value[0] as UnwrapRef<T>;
        }),
        last: computed(() => {
            return state.value[state.value.length - 1] as UnwrapRef<T>;
        }),
        size: computed(() => {
            return state.value.length;
        }),
    };
};

export default useQueue;