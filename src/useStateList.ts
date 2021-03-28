import {computed, ComputedRef, Ref, unref} from "vue";
import {useEffect, useRef, useMountedState} from './index';

export interface UseStateListReturn<T> {
    state: ComputedRef<T>;
    currentIndex: number;
    setStateAt: (newIndex: number) => void;
    setState: (state: T) => void;
    next: () => void;
    prev: () => void;
}

export default function useStateList<T>(stateSet: T[] | Ref<T[]> = []): UseStateListReturn<T> {
    const isMounted = useMountedState();
    const index = useRef(0);

    // If new state list is shorter that before - switch to the last element
    useEffect(() => {
        if (unref(stateSet).length <= index.value) {
            index.value = unref(stateSet).length - 1;
        }
    }, computed(() => {
        return unref(stateSet).length
    }));

    const actions = {
        next: () => actions.setStateAt(index.value + 1),
        prev: () => actions.setStateAt(index.value - 1),
        setStateAt: (newIndex: number) => {
            // do nothing on unmounted component
            if (!isMounted()) return;

            // do nothing on empty states list
            if (!unref(stateSet).length) return;

            // in case new index is equal current - do nothing
            if (newIndex === index.value) return;

            // it gives the ability to travel through the left and right borders.
            // 4ex: if list contains 5 elements, attempt to set index 9 will bring use to 5th element
            // in case of negative index it will start counting from the right, so -17 will bring us to 4th element
            index.value =
                newIndex >= 0
                    ? newIndex % unref(stateSet).length
                    : unref(stateSet).length + (newIndex % unref(stateSet).length);
        },
        setState: (state: T) => {
            // do nothing on unmounted component
            if (!isMounted()) return;

            const newIndex = unref(stateSet).length ? unref(stateSet).indexOf(state) : -1;

            if (newIndex === -1) {
                throw new Error(`State '${state}' is not a valid state (does not exist in state list)`);
            }

            index.value = newIndex;
        },
    };

    return {
        state: computed(() => {
            return unref(stateSet)[index.value]
        }),
        currentIndex: index.value,
        ...actions,
    };
}
